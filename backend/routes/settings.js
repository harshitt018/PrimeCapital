const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Company = require("../models/Company");

// ================= GET SETTINGS =================
// ================= GET SETTINGS =================
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    const settings = await Settings.findOne({ userId });
    const company = await Company.findOne({ ownerUserId: userId });

    res.json({
      profile: {
        name: user?.name || "",
        email: user?.email || "",
        phone: settings?.profile?.phone || "",
      },
      company: {
        name: company?.name || settings?.company?.name || "",
        address: company?.address || settings?.company?.address || "",
        city: company?.city || settings?.company?.city || "",
        state: company?.state || settings?.company?.state || "",
        pincode: company?.pincode || settings?.company?.pincode || "",
        gstin: company?.gstin || settings?.company?.gstin || "",
        stateCode: company?.stateCode || settings?.company?.stateCode || "",
        bankName: settings?.company?.bankName || "",
        accountNumber: settings?.company?.accountNumber || "",
        ifsc: settings?.company?.ifsc || "",
        branch: settings?.company?.branch || "",
        phone: company?.phone || settings?.company?.phone || "",
        email: company?.email || settings?.company?.email || "",
      },
      invoice: settings?.invoice || {
        cgst: 2.5,
        sgst: 2.5,
        pdfPath: "",
        fileNameFormat: "",
        showBank: true,
        terms: "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= UPDATE SETTINGS =================
router.put("/", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const { profile, company, invoice } = req.body;

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = new Settings({
        userId,
        profile: {},
        company: {},
        invoice: {},
      });
    }

    settings.profile = {
      ...settings.profile,
      phone: profile.phone,
    };

    settings.company = {
      ...settings.company,
      name: company.name || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      stateCode: company.stateCode || "",
      gstin: company.gstin || "",
      pincode: company.pincode || "",
      phone: company.phone || "",
      email: company.email || "",
      bankName: company.bankName || "",
      accountNumber: company.accountNumber || "",
      ifsc: company.ifsc || "",
      branch: company.branch || "",
    };

    settings.invoice = {
      ...settings.invoice,
      ...invoice,
    };

    await settings.save();

    await User.findByIdAndUpdate(userId, {
      ...(profile.name && { name: profile.name }),
      ...(profile.email && { email: profile.email }),
    });

    await Company.findOneAndUpdate(
      { ownerUserId: userId },
      {
        name: company.name,
        address: company.address,
        city: company.city,
        state: company.state,
        stateCode: company.stateCode,
        gstin: company.gstin,
        pincode: company.pincode,
        phone: company.phone,
        email: company.email,
      },
      { new: true, upsert: true },
    );

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update error" });
  }
});

// ================= DELETE COMPANY =================
router.delete("/company", auth, async (req, res) => {
  try {
    await Settings.findOneAndUpdate(
      { userId: req.userId },
      { $set: { company: {} } },
    );

    res.json({ msg: "Company deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;
