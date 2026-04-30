const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    address: String,
    gstin: String,
    state: String,
    stateCode: String,
    city: String,
    pincode: String,
    phone: String,
    email: String,
    bankName: String,
    accountNumber: String,
    ifsc: String,
    branch: String,
    invoiceSettings: {
      gstPercentage: { type: Number, default: 5 },
      invoicePrefix: { type: String, default: "INV" },
      invoicePattern: { type: String, default: "<PREFIX>-<YYYY>-<SEQ>" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", CompanySchema);
