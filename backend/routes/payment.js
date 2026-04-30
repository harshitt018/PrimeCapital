const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Activity = require("../models/Activity");

const authenticate = require("../middleware/auth");

// CREATE PAYMENT
router.post("/", authenticate, async (req, res) => {
  try {
    const { invoiceId, amount, method, referenceNo, notes } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({
        message: "invoiceId and amount required",
      });
    }

    const invoice = await Invoice.findById(invoiceId);

    console.log("INVOICE ID:", invoiceId);
    console.log("INVOICE:", invoice);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const totalAmount =
      invoice.total ||
      invoice.grandTotal ||
      (invoice.items || []).reduce(
        (sum, item) => sum + (item.amount || item.qty * item.rate || 0),
        0,
      );
    const oldDue = invoice.due;

    if (amount > invoice.due) {
      return res.status(400).json({
        message: "Payment exceeds due amount",
      });
    }

    // create payment record
    const payment = new Payment({
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      companyId: invoice.companyId,
      amount,
      method,
      referenceNo,
      notes,
      createdBy: req.userId,
    });

    await payment.save();
    await Activity.create({
      type: "payment_received",
      invoiceId: invoice._id,
      invoiceNo: invoice.invoiceNo,
      customerId: invoice.customerId,
      amount: amount,
      method: method,
      total: totalAmount,
      due: oldDue,
      description: "Payment received",
      createdBy: req.userId,
    });

    // UPDATE INVOICE
    invoice.amountPaid += amount;
    invoice.due -= amount;

    if (invoice.due <= 0) {
      invoice.status = "paid";
      invoice.due = 0;
    }

    await invoice.save();

    // UPDATE CUSTOMER TOTAL DUE
    const customer = await Customer.findById(invoice.customerId);

    if (customer) {
      customer.totalDue = Math.max(
        0,
        (customer.totalDue || 0) - Number(amount),
      );

      await customer.save();
    }

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
      invoice,
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET ALL PAYMENTS (History)
router.get("/", authenticate, async (req, res) => {
  try {
    const { companyId, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (companyId) filter.companyId = companyId;

    const payments = await Payment.find(filter)
      .populate("invoiceId", "invoiceNo total")
      .populate("customerId", "name contactNo")
      .populate("companyId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(payments);
  } catch (err) {
    console.error("Payment history error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

//GET CUSTOMER PAYMENT STATEMENT
router.get("/customer/:customerId", authenticate, async (req, res) => {
  try {
    const { customerId } = req.params;

    const payments = await Payment.find({ customerId })
      .populate("invoiceId", "invoiceNo total")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.error("Customer statement error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

//GET PAYMENTS FOR A SPECIFIC INVOICE
router.get("/invoice/:invoiceId", authenticate, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payments = await Payment.find({ invoiceId })
      .populate("customerId", "name contactNo")
      .populate("invoiceId", "invoiceNo total")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.error("Invoice payment history error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

router.get("/ledger/:customerId", authenticate, async (req, res) => {
  try {
    const { customerId } = req.params;

    // invoices
    const invoices = await Invoice.find({ customerId })
      .select("invoiceNo total createdAt")
      .sort({ createdAt: 1 });

    // payments
    const payments = await Payment.find({ customerId })
      .select("amount createdAt invoiceId method")
      .populate("invoiceId", "invoiceNo")
      .sort({ createdAt: 1 });

    // merge data
    let ledger = [];

    invoices.forEach((inv) => {
      ledger.push({
        type: "invoice",
        invoiceNo: inv.invoiceNo,
        debit: inv.total,
        credit: 0,
        date: inv.createdAt,
      });
    });

    payments.forEach((pay) => {
      ledger.push({
        type: "payment",
        invoiceNo: pay.invoiceId?.invoiceNo,
        debit: 0,
        credit: pay.amount,
        method: pay.method,
        date: pay.createdAt,
      });
    });

    // sort by date
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // running balance
    let balance = 0;

    ledger = ledger.map((entry) => {
      balance += entry.debit - entry.credit;

      return {
        ...entry,
        balance,
      };
    });

    res.json(ledger);
  } catch (err) {
    console.error("Ledger error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
