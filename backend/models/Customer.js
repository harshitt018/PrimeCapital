const mongoose = require("mongoose");

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const CustomerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      match: [/^[A-Za-z\s.]+$/, "Name can contain only letters"],
    },

    contactNo: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    gstNo: {
      type: String,
      uppercase: true,
      trim: true,
      match: [GST_REGEX, "Invalid GST number"],
      sparse: true,
    },

    billingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    shippingAddress: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    totalDue: {
      type: Number,
      default: 0,
    },

    notes: String,
  },
  { timestamps: true },
);

/* UNIQUE RULES (per company) */

CustomerSchema.index(
  { companyId: 1, contactNo: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

CustomerSchema.index(
  { companyId: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

CustomerSchema.index(
  { companyId: 1, gstNo: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

module.exports = mongoose.model("Customer", CustomerSchema);
