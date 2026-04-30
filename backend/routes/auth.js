const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

/* rate limiters */
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  otpLimiter,
} = require("../middleware/rateLimit");

/* models & utils */
const User = require("../models/User");
const { sendVerificationCodeEmail } = require("../utils/mailer");

/* env config */
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-key";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-key";
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXP || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXP || "30d";
const SALT_ROUNDS = 10;

function signAccess(user) {
  return jwt.sign({ sub: user._id, type: "access" }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXP,
  });
}

function signRefresh(user, jti) {
  return jwt.sign({ sub: user._id, type: "refresh", jti }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXP,
  });
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function minutesFromNow(min) {
  return new Date(Date.now() + min * 60 * 1000);
}

function invalidateVerificationCode(user) {
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
}

/* ================= REGISTER ================= */

router.post(
  "/register",
  registerLimiter,

  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password } = req.body;

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already registered" });

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const code = generateCode();
      const expires = minutesFromNow(15);

      const user = new User({
        name,
        email,
        passwordHash,
        emailVerified: false,
        verificationCode: code,
        verificationExpires: expires,
        refreshTokens: [],
      });

      await user.save();

      try {
        await sendVerificationCodeEmail(email, code, name);
      } catch (mailErr) {
        await User.deleteOne({ _id: user._id });
        return res.status(500).json({
          message: "Email sending failed. Please try again.",
        });
      }

      res.status(201).json({
        message: "User registered. Verification code sent to email.",
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

/* ========== RESEND REGISTER VERIFICATION CODE ========== */

router.post(
  "/resend-register-code",
  otpLimiter,
  [body("email").isEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Email not registered" });

      if (user.emailVerified)
        return res.status(400).json({ message: "Email already verified" });

      // ❗ invalidate old OTP
      invalidateVerificationCode(user);

      const newCode = generateCode();
      const expires = minutesFromNow(15);

      user.verificationCode = newCode;
      user.verificationExpires = expires;
      await user.save();

      await sendVerificationCodeEmail(email, newCode, user.name);

      res.json({
        message: "Verification code resent successfully. Check your email.",
      });
    } catch (err) {
      console.error("Resend register code error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

/* ================= VERIFY EMAIL ================= */

router.post(
  "/verify-code",
  otpLimiter,
  [body("email").isEmail(), body("code").isLength({ min: 6, max: 6 })],
  async (req, res) => {
    try {
      const { email, code } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid request" });

      if (user.emailVerified) return res.json({ message: "Already verified" });

      if (
        !user.verificationCode ||
        !user.verificationExpires ||
        user.verificationCode !== code
      ) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      if (new Date() > user.verificationExpires) {
        return res.status(400).json({ message: "Verification code expired" });
      }

      user.emailVerified = true;
      invalidateVerificationCode(user);
      await user.save();

      res.json({ message: "Email verified successfully" });
    } catch (err) {
      console.error("Verify-code error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

/* ================= LOGIN ================= */

router.post(
  "/login",
  loginLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res
          .status(401)
          .json({ message: "Invalid email or password. Please try again." });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok)
        return res
          .status(401)
          .json({ message: "Invalid email or password. Please try again." });

      if (!user.emailVerified)
        return res.status(403).json({ message: "Email not verified" });

      const jti = uuidv4();
      const accessToken = signAccess(user);
      const refreshToken = signRefresh(user, jti);

      user.refreshTokens.push({ token: jti, createdAt: new Date() });
      await user.save();

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

/* ================= REFRESH TOKEN ================= */

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // verify refresh token
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // check if refresh token jti exists in DB
    const tokenExists = user.refreshTokens.some((t) => t.token === payload.jti);

    if (!tokenExists) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    // issue new access token
    const newAccessToken = signAccess(user);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
});

/* ================= LOGOUT ================= */

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token missing" });
    }

    // verify refresh token
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    if (payload.type !== "refresh") {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // remove refresh token jti from DB
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== payload.jti,
    );

    await user.save();

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

/* ================= FORGOT PASSWORD ================= */

router.post("/forgot-password", [body("email").isEmail()], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not registered" });

    const code = generateCode();
    const expires = minutesFromNow(15);

    user.resetPasswordCode = code;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendVerificationCodeEmail(email, code, user.name);

    res.json({ message: "Password reset code sent to email" });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */

router.post(
  "/reset-password",
  forgotPasswordLimiter,
  [
    body("email").isEmail(),
    body("code").isLength({ min: 6, max: 6 }),
    body("newPassword").isLength({ min: 6 }),
    body("confirmPassword").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match" });

      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or code" });

      if (
        !user.resetPasswordCode ||
        !user.resetPasswordExpires ||
        user.resetPasswordCode !== code
      ) {
        return res.status(400).json({ message: "Invalid reset code" });
      }

      if (new Date() > user.resetPasswordExpires)
        return res.status(400).json({ message: "Reset code expired" });

      // check old password
      const isSame = await bcrypt.compare(newPassword, user.passwordHash);

      if (isSame) {
        return res.status(400).json({
          message: "New password cannot be same as old password",
        });
      }

      // update password
      user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.passwordChangedAt = new Date();
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      user.refreshTokens = [];

      await user.save();

      res.json({
        message: "Password changed successfully. Please login again.",
      });
    } catch (err) {
      console.error("Reset-password error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

/* ================= CHANGE PASSWORD ================= */
const authenticate = require("../middleware/auth");

router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame)
      return res
        .status(400)
        .json({ message: "New password cannot be same as current password" });

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordChangedAt = new Date();
    user.refreshTokens = [];
    await user.save();

    res.json({ message: "Password changed successfully. Please login again." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-password", authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });
    res.json({ message: "Password verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = router;
