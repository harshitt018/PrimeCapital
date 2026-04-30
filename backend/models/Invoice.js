const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  description: String,
  hsn: String,
  qty: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
});

const InvoiceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    invoiceNo: { type: String, required: true, index: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [ItemSchema],

    subtotal: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    totalInWords: String,

    pdfPath: String,

    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue"],
      default: "pending",
    },

    dueDate: {
      type: Date,
    },

    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amountPaid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
  },
  { timestamps: true },
);

InvoiceSchema.pre("save", function () {
  this.due = this.total - this.amountPaid;
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
