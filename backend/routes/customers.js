const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Customer = require("../models/Customer");
const authenticate = require("../middleware/auth");

// Create customer
router.post(
  "/",
  authenticate,
  [
    body("companyId").notEmpty().withMessage("Company is required"),

    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .bail()
      .matches(/^[A-Za-z\s.]+$/)
      .withMessage("Name must contain only letters"),

    body("contactNo")
      .notEmpty()
      .withMessage("Mobile number is required")
      .bail()
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Invalid mobile number"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email"),

    body("billingAddress").notEmpty().withMessage("Address is required"),

    body("gstNo")
      .optional({ checkFalsy: true })
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .withMessage("Invalid GST number"),

    body("gstNo").notEmpty().withMessage("GST number is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Fill the form correctly",
        errors: errors.array(),
      });
    }

    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (err) {
      // DUPLICATE ERROR HANDLING
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
          message: `${field} already exists for this company`,
        });
      }

      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// List customers
router.get("/", authenticate, async (req, res) => {
  try {
    const { companyId, q, page = 1, limit = 20 } = req.query;

    if (!companyId || companyId === "null") {
      return res.status(400).json({ message: "companyId required" });
    }

    const filter = { companyId, isDeleted: { $ne: true } };

    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { gstNo: new RegExp(q, "i") },
      ];
    }

    const customers = await Customer.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get by id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Not found" });
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update
router.put("/:id", authenticate, async (req, res) => {
  try {
    const c = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!c) return res.status(404).json({ message: "Not found" });
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get customer due amount
router.get("/:id/due", authenticate, async (req, res) => {
  try {
    const Invoice = require("../models/Invoice");

    const invoices = await Invoice.find({
      customerId: req.params.id,
    });

    const totalDue = invoices.reduce((sum, inv) => sum + (inv.due || 0), 0);

    res.json({ totalDue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
