const rateLimit = require("express-rate-limit");

// generic helper
function limiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });
}

// login brute-force protection
const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts. Try again after 15 minutes.",
});

// register spam protection
const registerLimiter = limiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many registrations from this IP. Try later.",
});

// forgot password abuse protection
const forgotPasswordLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many reset requests. Try again later.",
});

// OTP brute force protection
const otpLimiter = limiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP attempts. Try again later.",
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  otpLimiter,
};
