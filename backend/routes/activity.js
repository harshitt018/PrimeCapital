const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const authenticate = require("../middleware/auth");

// GET ALL ACTIVITY
router.get("/", authenticate, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("invoiceId", "invoiceNo")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE REMINDER ACTIVITY
router.post("/reminder", authenticate, async (req, res) => {
  try {
    const { invoiceId, customerId, amount } = req.body;

    const activity = await Activity.create({
      type: "reminder_sent",
      invoiceId,
      customerId,
      amount,
      description: "Reminder sent",
      createdBy: req.userId,
    });

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
