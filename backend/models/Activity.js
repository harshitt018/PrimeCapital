const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "invoice_created",
        "invoice_updated",
        "invoice_deleted",
        "payment_received",
        "reminder_sent",
      ],
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    amount: Number,

    invoiceNo: String,

    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Activity", ActivitySchema);
