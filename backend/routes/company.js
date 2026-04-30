const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Company = require("../models/Company");
const Invoice = require("../models/Invoice");
const Settings = require("../models/Settings");
const authenticate = require("../middleware/auth");

// Create or update company (onboarding)
router.post(
  "/",
  authenticate,
  [body("name").notEmpty().withMessage("Company name required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const ownerUserId = req.userId;
      const payload = req.body;
      let company = await Company.findOne({ ownerUserId });
      if (company) {
        Object.assign(company, payload);
        await company.save();
      } else {
        company = new Company({ ownerUserId, ...payload });
        await company.save();
      }
      return res.json(company);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Get company for logged-in owner
router.get("/", authenticate, async (req, res) => {
  try {
    const company = await Company.findOne({ ownerUserId: req.userId });
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE COMPANY ──────────────────────────────────────────────────
// Deletes company + ALL related data from DB completely
router.delete("/", authenticate, async (req, res) => {
  try {
    const ownerUserId = req.userId;

    // 1. Find company
    const company = await Company.findOne({ ownerUserId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const companyId = company._id;

    // 2. Delete all invoices
    await Invoice.deleteMany({ companyId });

    // 3. Delete all customers
    try {
      const Customer = require("../models/Customer");
      await Customer.deleteMany({ companyId });
    } catch (e) {
      console.log("Customer model skip:", e.message);
    }

    // 4. Delete all payments
    try {
      const Payment = require("../models/Payment");
      await Payment.deleteMany({ companyId });
    } catch (e) {
      console.log("Payment model skip:", e.message);
    }

    // 5. Delete all activity logs
    try {
      const Activity = require("../models/Activity");
      await Activity.deleteMany({ companyId });
    } catch (e) {
      console.log("Activity model skip:", e.message);
    }

    // 6. Delete invoice counters/sequences
    try {
      const Counter = require("../models/Counter");
      await Counter.deleteMany({ _id: new RegExp("invoiceSeq:" + companyId) });
    } catch (e) {
      console.log("Counter model skip:", e.message);
    }

    // 7. Delete the company itself
    await Company.findByIdAndDelete(companyId);

    // 8. Clear company + invoice settings
    await Settings.findOneAndUpdate(
      { userId: ownerUserId },
      { $unset: { company: "", invoice: "" } },
    );

    res.json({ message: "Company and all related data deleted successfully" });
  } catch (err) {
    console.error("Delete company error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
