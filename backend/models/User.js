const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // EMAIL VERIFICATION OTP
    verificationCode: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },

    // FORGOT PASSWORD OTP
    resetPasswordCode: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    passwordChangedAt: Date,

    // REFRESH TOKENS
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
