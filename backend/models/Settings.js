const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    profile: {
      name: String,
      email: String,
      phone: String,
    },

    company: {
      name: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      gstin: String,
      stateCode: String,
      bankName: String,
      accountNumber: String,
      ifsc: String,
      branch: String,
      phone: String,
      email: String,
    },

    invoice: {
      cgst: Number,
      sgst: Number,
      pdfPath: String,
      fileNameFormat: String,
      showBank: Boolean,
      terms: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
