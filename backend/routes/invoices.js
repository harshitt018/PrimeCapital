const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendInvoiceEmail } = require("../utils/mailer");
const { body, validationResult } = require("express-validator");
const Invoice = require("../models/Invoice");
const Company = require("../models/Company");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");
const Activity = require("../models/Activity");
const authenticate = require("../middleware/auth");
const Settings = require("../models/Settings");
const puppeteer = require("puppeteer");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

function getDisplayInvoiceNo(invoice, company) {
  if (!invoice?.invoiceNo) return "";

  const num = invoice.invoiceNo.split("/").pop(); // last part like 002

  const year = moment(invoice.createdAt).year();
  const fy =
    moment(invoice.createdAt).month() >= 3
      ? `${String(year).slice(2)}-${String(year + 1).slice(2)}`
      : `${String(year - 1).slice(2)}-${String(year).slice(2)}`;

  const prefix = company?.invoiceSettings?.invoicePrefix?.trim();

  // if no prefix, use prefix (INV/002)
  if (prefix && prefix !== "PC") {
    return `${prefix}/${num}`;
  }

  // default: financial year (25-26/002)
  return `${fy}/${num}`;
}

async function generateInvoicePDF(invoiceId) {
  const invoice = await Invoice.findById(invoiceId)
    .populate("customerId")
    .populate("companyId");

  if (!invoice) return;

  // companyId extraction
  const companyId = invoice.companyId?._id || invoice.companyId;
  const companyData = await Company.findById(companyId);

  if (!companyData) return;

  const settings = await Settings.findOne({
    userId: companyData.ownerUserId,
  });

  // ✅ FIXED - companyFresh wali duplicate line hatao, companyData use karo
  const company = {
    ...companyData.toObject(),
    // Settings se override karo — yeh latest data hai
    name: settings?.company?.name || companyData.name,
    address: settings?.company?.address || companyData.address,
    state: settings?.company?.state || companyData.state,
    stateCode: settings?.company?.stateCode || companyData.stateCode,
    gstin: settings?.company?.gstin || companyData.gstin,
    bankName: settings?.company?.bankName || companyData.bankName,
    accountNumber:
      settings?.company?.accountNumber || companyData.accountNumber,
    ifsc: settings?.company?.ifsc || companyData.ifsc,
    branch: settings?.company?.branch || companyData.branch,
    phone:
      settings?.company?.phone || settings?.profile?.phone || companyData.phone,
  };

  const customer = invoice.customerId;

  const customerName = customer?.name || "Customer";
  const safeCustomerName = customerName.replace(/[\\/:*?"<>|]/g, "");

  const year = moment(invoice.createdAt).year();
  const fy =
    moment(invoice.createdAt).month() >= 3
      ? `${String(year).slice(2)}-${String(year + 1).slice(2)}`
      : `${String(year - 1).slice(2)}-${String(year).slice(2)}`;

  const dateStr = moment(invoice.createdAt).format("DD MMMM YYYY");

  const displayInvoiceNo = getDisplayInvoiceNo(invoice, company);
  const invoiceNumberOnly = displayInvoiceNo.split("/").pop();

  const fileName = `${fy} ${invoiceNumberOnly} ${safeCustomerName} ${dateStr}.pdf`;

  const folder = (settings?.invoice?.pdfPath?.trim() || "D:/Invoices").replace(
    /[/\\]+$/,
    "",
  );

  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const fullPath = path.join(folder, fileName);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath); // 🔥 delete old pdf
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; font-family: Arial, sans-serif; font-size: 10px; color: #111; }

  .invoice {
    width: 794px;
    min-height: 1123px;
    margin: 0 auto;
    padding: 28px 32px;
  }

  /* TAX INVOICE label */
  .tax-invoice-label {
    text-align: center;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 3px;
    margin-bottom: 3px;
  }

  /* Company header */
  .company-header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 6px;
    margin-bottom: 6px;
  }
  .company-name {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .company-sub {
    font-size: 9px;
    color: #444;
    margin-top: 1px;
  }

  /* GSTIN row */
  .gstin-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    font-weight: bold;
    border-bottom: 2px solid #000;
    padding-bottom: 3px;
    margin-bottom: 6px;
  }

  /* Buyer + Invoice details */
  .buyer-section {
    display: grid;
    grid-template-columns: 55% 45%;
    border: 1px solid #000;
    margin-bottom: 6px;
    font-size: 9px;
  }
  .buyer-left {
    padding: 5px 7px;
    border-right: 1px solid #000;
  }
  .buyer-right {
    padding: 5px 7px;
  }
  .buyer-label {
    font-weight: bold;
    color: #666;
    margin-bottom: 2px;
  }

  /* Items table */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
    table-layout: fixed;
  }
  .items-table th, .items-table td {
    border: 1px solid #555;
    padding: 4px 6px;
  }
  .items-table thead tr {
    background: #f0f0f0;
    font-weight: bold;
  }
  .items-table .col-sr   { width: 35px; text-align: center; }
  .items-table .col-desc { }
  .items-table .col-hsn  { width: 65px; text-align: center; }
  .items-table .col-qty  { width: 42px; text-align: center; }
  .items-table .col-rate { width: 75px; text-align: right; }
  .items-table .col-amt  { width: 85px; text-align: right; }
  .items-table .empty-row { height: 18px; }
  .items-table .total-row { font-weight: bold; background: #f5f5f5; }

  /* Bottom section */
  .bottom-section {
    border: 1px solid #000;
    border-top: none;
    display: flex;
    font-size: 9px;
  }
  .bottom-left {
    width: 60%;
    border-right: 1px solid #000;
    display: flex;
    flex-direction: column;
  }
  .bottom-right {
    width: 40%;
    display: flex;
    flex-direction: column;
  }

  .amount-words-row {
    padding: 4px 6px;
    border-bottom: 1px solid #000;
  }
  .amount-words-row span.label { font-weight: bold; }
  .amount-words-row span.value { font-style: italic; border-bottom: 1px solid #555; }

  .bank-details {
    padding: 4px 6px;
    border-bottom: 1px solid #000;
  }
  .bank-details .section-title { font-weight: bold; margin-bottom: 2px; }

  .tnc-box {
    padding: 4px 6px;
    flex: 1;
    position: relative;
    min-height: 90px;
  }
  .tnc-box .section-title {
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 3px;
  }
  .tnc-box .tnc-text {
    line-height: 1.6;
    padding-right: 96px;
  }
  .common-seal {
    position: absolute;
    bottom: 6px;
    right: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .common-seal-box {
    width: 80px;
    height: 50px;
    border: 1px dashed #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    font-size: 8px;
  }
  .common-seal-label { font-size: 8px; color: #666; }

  /* Tax table */
  .tax-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
  }
  .tax-table td {
    padding: 3px 6px;
    border-bottom: 1px solid #ddd;
  }
  .tax-table td:last-child { text-align: right; }
  .tax-table .bold-row { font-weight: bold; }
  .tax-table .border-top-dark td { border-top: 1px solid #000; border-bottom: 1px solid #000; }
  .tax-table .total-row td { font-weight: bold; background: #f0f0f0; border-top: 1px solid #000; border-bottom: 1px solid #000; }

  /* Signature */
  .signature-box {
    flex: 1;
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 65px;
    text-align: center;
  }
  .for-company { font-weight: bold; font-style: italic; font-size: 9px; }
  .auth-signatory {
    border-top: 1px dashed #aaa;
    padding-top: 3px;
    font-size: 8px;
    color: #555;
    font-weight: bold;
  }
</style>
</head>
<body>
<div class="invoice">

  <!-- TAX INVOICE -->
  <div class="tax-invoice-label">TAX INVOICE</div>

  <!-- Company Header -->
  <div class="company-header">
    <div class="company-name">${company.name?.toUpperCase()}</div>
    <div class="company-sub">${company.address || ""}</div>
    <div class="company-sub">Tel : ${company.phone || settings?.profile?.phone || ""}</div>
  </div>

  <!-- GSTIN Row -->
  <div class="gstin-row">
    <span>GSTIN: ${company.gstin || "-"}</span>
    <span>STATE: ${company.state || "-"}</span>
    <span>STATE CODE: ${company.stateCode || "-"}</span>
  </div>

  <!-- Buyer + Invoice Details -->
  <div class="buyer-section">
    <div class="buyer-left">
      <div class="buyer-label">Buyer</div>
      <div style="font-weight:bold;">${customer.name || "-"}</div>
      <div>${customer.billingAddress || "-"}</div>
      <div>Phone: ${customer.contactNo || "-"}</div>
      <div>GSTIN/UIN : ${customer.gstNo || "-"}</div>
      <div>State Name : ${company.state || "-"}, Code : ${company.stateCode || "-"}</div>
    </div>
    <div class="buyer-right">
      <div style="margin-bottom:3px;"><b>Invoice No. :</b> ${displayInvoiceNo}</div>
      <div style="margin-bottom:3px;"><b>Invoice Date :</b> ${moment(invoice.createdAt).format("DD-MM-YYYY")}</div>
      <div style="margin-bottom:3px;"><b>Transport :</b> ${invoice.transport || "-"}</div>
      <div><b>Destination :</b> ${invoice.destination || "-"}</div>
    </div>
  </div>

  <!-- Items Table -->
  <table class="items-table">
    <colgroup>
      <col class="col-sr" />
      <col class="col-desc" />
      <col class="col-hsn" />
      <col class="col-qty" />
      <col class="col-rate" />
      <col class="col-amt" />
    </colgroup>
    <thead>
      <tr>
        <th class="col-sr">SR NO.</th>
        <th class="col-desc" style="text-align:left;">Description</th>
        <th class="col-hsn">HSN CODE</th>
        <th class="col-qty">Qty.</th>
        <th class="col-rate">Rate (₹)</th>
        <th class="col-amt">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (it, i) => `
      <tr>
        <td class="col-sr">${i + 1}</td>
        <td class="col-desc">${it.description || "-"}</td>
        <td class="col-hsn">${it.hsnCode?.trim() || "-"}</td>
        <td class="col-qty">${it.qty}</td>
        <td class="col-rate">${Number(it.rate).toFixed(2)}</td>
        <td class="col-amt">${(Number(it.qty) * Number(it.rate)).toFixed(2)}</td>
      </tr>`,
        )
        .join("")}

      ${Array.from({ length: Math.max(0, 11 - invoice.items.length) })
        .map(
          () => `
      <tr style="height:18px;">
        <td style="border:1px solid #555;">&nbsp;</td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
      </tr>`,
        )
        .join("")}

      <tr class="total-row">
        <td colspan="3" style="text-align:right;">Total</td>
        <td class="col-qty">${invoice.items.reduce((s, i) => s + Number(i.qty), 0)}</td>
        <td></td>
        <td class="col-amt">₹ ${Number(invoice.subtotal).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Bottom Section -->
  <div class="bottom-section">

    <!-- LEFT -->
    <div class="bottom-left">

      <!-- Amount in Words -->
      <div class="amount-words-row">
        <span class="label">Total Amount in Words : </span>
        <span class="value">INR ${invoice.totalInWords}</span>
      </div>

      <!-- Bank Details -->
      ${
        settings?.invoice?.showBank !== false
          ? `
      <div class="bank-details">
        <div class="section-title">Bank Details</div>
        <div><b>Company Name</b> : ${company.name || "-"}</div>
        <div><b>Bank Name</b> : ${company.bankName || "-"}</div>
        <div><b>A/c No</b> : ${company.accountNumber || "-"}</div>
        <div><b>IFSC Code</b> : ${company.ifsc || "-"}</div>
      </div>`
          : ""
      }

      <!-- Terms & Conditions + Common Seal -->
      <div class="tnc-box">
        <div class="section-title">Terms &amp; Conditions</div>
        ${settings?.invoice?.terms ? `<div class="tnc-text">${settings.invoice.terms}</div>` : ""}
        <div class="common-seal">
          <div class="common-seal-box">Common Seal</div>
          <div class="common-seal-label">(Customer Signature)</div>
        </div>
      </div>

    </div>

    <!-- RIGHT -->
    <div class="bottom-right">

      <!-- Tax Table -->
      <table class="tax-table">
        <tr>
          <td>Total</td>
          <td>${Number(invoice.subtotal).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Add : CGST ${settings?.invoice?.cgst ?? 2.5}%</td>
          <td>${Number(invoice.cgst).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Add : SGST ${settings?.invoice?.sgst ?? 2.5}%</td>
          <td>${Number(invoice.sgst).toFixed(2)}</td>
        </tr>
        <tr class="bold-row border-top-dark">
          <td>Total Tax Amount</td>
          <td>${(Number(invoice.cgst) + Number(invoice.sgst)).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Total Amount w/Tax</td>
          <td>${(Number(invoice.subtotal) + Number(invoice.cgst) + Number(invoice.sgst)).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Round Off</td>
          <td>${Number(invoice.roundOff).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount</td>
          <td>₹ ${Number(invoice.total).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Signature -->
      <div class="signature-box">
        <div class="for-company">For ${company.name?.toUpperCase() || "COMPANY"}</div>
        <div class="auth-signatory">Authorised Signatory</div>
      </div>

    </div>
  </div>

</div>
</body>
</html>
`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.setViewport({
    width: 794,
    height: 1123,
    deviceScaleFactor: 2,
  });

  await page.evaluate(() => {
    document.title = "Invoice";
  });

  await page.pdf({
    path: fullPath,
    format: "A4",
    printBackground: true,
    margin: { top: "10px", bottom: "10px", left: "10px", right: "10px" },
  });

  await browser.close();

  invoice.pdfPath = fullPath;
  await invoice.save();
}

router.post("/save-pdf", authenticate, async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ message: "InvoiceId required" });
    }

    const invoice = await Invoice.findById(invoiceId)
      .populate("customerId")
      .populate("companyId");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const companyId = invoice.companyId?._id || invoice.companyId;
    const companyData = await Company.findById(companyId);

    const settings = await Settings.findOne({
      userId: companyData.ownerUserId,
    });

    const company = {
      ...companyData.toObject(),
      // Settings se override karo — yeh latest data hai
      name: settings?.company?.name || companyData.name,
      address: settings?.company?.address || companyData.address,
      state: settings?.company?.state || companyData.state,
      stateCode: settings?.company?.stateCode || companyData.stateCode,
      gstin: settings?.company?.gstin || companyData.gstin,
      bankName: settings?.company?.bankName || companyData.bankName,
      accountNumber:
        settings?.company?.accountNumber || companyData.accountNumber,
      ifsc: settings?.company?.ifsc || companyData.ifsc,
      branch: settings?.company?.branch || companyData.branch,
      phone:
        settings?.company?.phone ||
        settings?.profile?.phone ||
        companyData.phone,
    };

    const customer = invoice.customerId;

    const customerName = customer?.name || "Customer";
    const safeCustomerName = customerName.replace(/[\\/:*?"<>|]/g, "");

    const year = moment(invoice.createdAt).year();
    const fy =
      moment(invoice.createdAt).month() >= 3
        ? `${String(year).slice(2)}-${String(year + 1).slice(2)}`
        : `${String(year - 1).slice(2)}-${String(year).slice(2)}`;

    const dateStr = moment(invoice.createdAt).format("DD MMMM YYYY");

    const safeInvoiceNo = invoice.invoiceNo.replace(/[\/\\]/g, "-"); // replace / with -

    const displayInvoiceNo = getDisplayInvoiceNo(invoice, company);
    const invoiceNumberOnly = displayInvoiceNo.split("/").pop();

    const fileName = `${fy} ${invoiceNumberOnly} ${safeCustomerName} ${dateStr}.pdf`;

    const folder = (
      settings?.invoice?.pdfPath?.trim() || "D:/Invoices"
    ).replace(/[/\\]+$/, "");
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const fullPath = path.join(folder, fileName);

    // ✅ BACKEND HTML TEMPLATE (FINAL)

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; font-family: Arial, sans-serif; font-size: 10px; color: #111; }

  .invoice {
    width: 794px;
    min-height: 1123px;
    margin: 0 auto;
    padding: 28px 32px;
  }

  /* TAX INVOICE label */
  .tax-invoice-label {
    text-align: center;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 3px;
    margin-bottom: 3px;
  }

  /* Company header */
  .company-header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 6px;
    margin-bottom: 6px;
  }
  .company-name {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .company-sub {
    font-size: 9px;
    color: #444;
    margin-top: 1px;
  }

  /* GSTIN row */
  .gstin-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    font-weight: bold;
    border-bottom: 2px solid #000;
    padding-bottom: 3px;
    margin-bottom: 6px;
  }

  /* Buyer + Invoice details */
  .buyer-section {
    display: grid;
    grid-template-columns: 55% 45%;
    border: 1px solid #000;
    margin-bottom: 6px;
    font-size: 9px;
  }
  .buyer-left {
    padding: 5px 7px;
    border-right: 1px solid #000;
  }
  .buyer-right {
    padding: 5px 7px;
  }
  .buyer-label {
    font-weight: bold;
    color: #666;
    margin-bottom: 2px;
  }

  /* Items table */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
    table-layout: fixed;
  }
  .items-table th, .items-table td {
    border: 1px solid #555;
    padding: 4px 6px;
  }
  .items-table thead tr {
    background: #f0f0f0;
    font-weight: bold;
  }
  .items-table .col-sr   { width: 35px; text-align: center; }
  .items-table .col-desc { }
  .items-table .col-hsn  { width: 65px; text-align: center; }
  .items-table .col-qty  { width: 42px; text-align: center; }
  .items-table .col-rate { width: 75px; text-align: right; }
  .items-table .col-amt  { width: 85px; text-align: right; }
  .items-table .empty-row { height: 18px; }
  .items-table .total-row { font-weight: bold; background: #f5f5f5; }

  /* Bottom section */
  .bottom-section {
    border: 1px solid #000;
    border-top: none;
    display: flex;
    font-size: 9px;
  }
  .bottom-left {
    width: 60%;
    border-right: 1px solid #000;
    display: flex;
    flex-direction: column;
  }
  .bottom-right {
    width: 40%;
    display: flex;
    flex-direction: column;
  }

  .amount-words-row {
    padding: 4px 6px;
    border-bottom: 1px solid #000;
  }
  .amount-words-row span.label { font-weight: bold; }
  .amount-words-row span.value { font-style: italic; border-bottom: 1px solid #555; }

  .bank-details {
    padding: 4px 6px;
    border-bottom: 1px solid #000;
  }
  .bank-details .section-title { font-weight: bold; margin-bottom: 2px; }

  .tnc-box {
    padding: 4px 6px;
    flex: 1;
    position: relative;
    min-height: 90px;
  }
  .tnc-box .section-title {
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 3px;
  }
  .tnc-box .tnc-text {
    line-height: 1.6;
    padding-right: 96px;
  }
  .common-seal {
    position: absolute;
    bottom: 6px;
    right: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .common-seal-box {
    width: 80px;
    height: 50px;
    border: 1px dashed #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    font-size: 8px;
  }
  .common-seal-label { font-size: 8px; color: #666; }

  /* Tax table */
  .tax-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
  }
  .tax-table td {
    padding: 3px 6px;
    border-bottom: 1px solid #ddd;
  }
  .tax-table td:last-child { text-align: right; }
  .tax-table .bold-row { font-weight: bold; }
  .tax-table .border-top-dark td { border-top: 1px solid #000; border-bottom: 1px solid #000; }
  .tax-table .total-row td { font-weight: bold; background: #f0f0f0; border-top: 1px solid #000; border-bottom: 1px solid #000; }

  /* Signature */
  .signature-box {
    flex: 1;
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 65px;
    text-align: center;
  }
  .for-company { font-weight: bold; font-style: italic; font-size: 9px; }
  .auth-signatory {
    border-top: 1px dashed #aaa;
    padding-top: 3px;
    font-size: 8px;
    color: #555;
    font-weight: bold;
  }
</style>
</head>
<body>
<div class="invoice">

  <!-- TAX INVOICE -->
  <div class="tax-invoice-label">TAX INVOICE</div>

  <!-- Company Header -->
  <div class="company-header">
    <div class="company-name">${company.name?.toUpperCase()}</div>
    <div class="company-sub">${company.address || ""}</div>
    <div class="company-sub">Tel : ${company.phone || settings?.profile?.phone || ""}</div>
  </div>

  <!-- GSTIN Row -->
  <div class="gstin-row">
    <span>GSTIN: ${company.gstin || "-"}</span>
    <span>STATE: ${company.state || "-"}</span>
    <span>STATE CODE: ${company.stateCode || "-"}</span>
  </div>

  <!-- Buyer + Invoice Details -->
  <div class="buyer-section">
    <div class="buyer-left">
      <div class="buyer-label">Buyer</div>
      <div style="font-weight:bold;">${customer.name || "-"}</div>
      <div>${customer.billingAddress || "-"}</div>
      <div>Phone: ${customer.contactNo || "-"}</div>
      <div>GSTIN/UIN : ${customer.gstNo || "-"}</div>
      <div>State Name : ${company.state || "-"}, Code : ${company.stateCode || "-"}</div>
    </div>
    <div class="buyer-right">
      <div style="margin-bottom:3px;"><b>Invoice No. :</b> ${displayInvoiceNo}</div>
      <div style="margin-bottom:3px;"><b>Invoice Date :</b> ${moment(invoice.createdAt).format("DD-MM-YYYY")}</div>
      <div style="margin-bottom:3px;"><b>Transport :</b> ${invoice.transport || "-"}</div>
      <div><b>Destination :</b> ${invoice.destination || "-"}</div>
    </div>
  </div>

  <!-- Items Table -->
  <table class="items-table">
    <colgroup>
      <col class="col-sr" />
      <col class="col-desc" />
      <col class="col-hsn" />
      <col class="col-qty" />
      <col class="col-rate" />
      <col class="col-amt" />
    </colgroup>
    <thead>
      <tr>
        <th class="col-sr">SR NO.</th>
        <th class="col-desc" style="text-align:left;">Description</th>
        <th class="col-hsn">HSN CODE</th>
        <th class="col-qty">Qty.</th>
        <th class="col-rate">Rate (₹)</th>
        <th class="col-amt">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (it, i) => `
      <tr>
        <td class="col-sr">${i + 1}</td>
        <td class="col-desc">${it.description || "-"}</td>
        <td class="col-hsn">${it.hsnCode?.trim() || "-"}</td>
        <td class="col-qty">${it.qty}</td>
        <td class="col-rate">${Number(it.rate).toFixed(2)}</td>
        <td class="col-amt">${(Number(it.qty) * Number(it.rate)).toFixed(2)}</td>
      </tr>`,
        )
        .join("")}

      ${Array.from({ length: Math.max(0, 11 - invoice.items.length) })
        .map(
          () => `
      <tr style="height:18px;">
        <td style="border:1px solid #555;">&nbsp;</td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
        <td style="border:1px solid #555;"></td>
      </tr>`,
        )
        .join("")}

      <tr class="total-row">
        <td colspan="3" style="text-align:right;">Total</td>
        <td class="col-qty">${invoice.items.reduce((s, i) => s + Number(i.qty), 0)}</td>
        <td></td>
        <td class="col-amt">₹ ${Number(invoice.subtotal).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Bottom Section -->
  <div class="bottom-section">

    <!-- LEFT -->
    <div class="bottom-left">

      <!-- Amount in Words -->
      <div class="amount-words-row">
        <span class="label">Total Amount in Words : </span>
        <span class="value">INR ${invoice.totalInWords}</span>
      </div>

      <!-- Bank Details -->
      ${
        settings?.invoice?.showBank !== false
          ? `
      <div class="bank-details">
        <div class="section-title">Bank Details</div>
        <div><b>Company Name</b> : ${company.name || "-"}</div>
        <div><b>Bank Name</b> : ${company.bankName || "-"}</div>
        <div><b>A/c No</b> : ${company.accountNumber || "-"}</div>
        <div><b>IFSC Code</b> : ${company.ifsc || "-"}</div>
      </div>`
          : ""
      }

      <!-- Terms & Conditions + Common Seal -->
      <div class="tnc-box">
        <div class="section-title">Terms &amp; Conditions</div>
        ${settings?.invoice?.terms ? `<div class="tnc-text">${settings.invoice.terms}</div>` : ""}
        <div class="common-seal">
          <div class="common-seal-box">Common Seal</div>
          <div class="common-seal-label">(Customer Signature)</div>
        </div>
      </div>

    </div>

    <!-- RIGHT -->
    <div class="bottom-right">

      <!-- Tax Table -->
      <table class="tax-table">
        <tr>
          <td>Total</td>
          <td>${Number(invoice.subtotal).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Add : CGST ${settings?.invoice?.cgst ?? 2.5}%</td>
          <td>${Number(invoice.cgst).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Add : SGST ${settings?.invoice?.sgst ?? 2.5}%</td>
          <td>${Number(invoice.sgst).toFixed(2)}</td>
        </tr>
        <tr class="bold-row border-top-dark">
          <td>Total Tax Amount</td>
          <td>${(Number(invoice.cgst) + Number(invoice.sgst)).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Total Amount w/Tax</td>
          <td>${(Number(invoice.subtotal) + Number(invoice.cgst) + Number(invoice.sgst)).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Round Off</td>
          <td>${Number(invoice.roundOff).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount</td>
          <td>₹ ${Number(invoice.total).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Signature -->
      <div class="signature-box">
        <div class="for-company">For ${company.name?.toUpperCase() || "COMPANY"}</div>
        <div class="auth-signatory">Authorised Signatory</div>
      </div>

    </div>
  </div>

</div>
</body>
</html>
`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    await page.evaluate(() => {
      document.title = "Invoice";
    });

    await page.pdf({
      path: fullPath,
      format: "A4",
      printBackground: true,
      margin: { top: "10px", bottom: "10px", left: "10px", right: "10px" },
    });

    await browser.close();

    // ✅ Save pdf path in DB
    invoice.pdfPath = fullPath;
    await invoice.save();

    res.json({
      message: "PDF generated successfully ✅",
      fileName,
      path: fullPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF failed", error: err.message });
  }
});

router.get("/download-pdf/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // 🔥 ALWAYS GENERATE NEW PDF
    await generateInvoicePDF(invoiceId);

    const updatedInvoice = await Invoice.findById(invoiceId);

    if (!updatedInvoice || !updatedInvoice.pdfPath) {
      return res.status(404).send("PDF not found");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice.pdf"`);

    fs.createReadStream(updatedInvoice.pdfPath).pipe(res);
  } catch (err) {
    console.error("Download PDF error:", err);
    res.status(500).send("Server error");
  }
});

/** helper: simple indian number -> words (small util, OK for invoices) */
function numberToWords(num) {
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  if (num === 0) return "zero";
  function two(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    return "";
  }
  function three(n) {
    let h = Math.floor(n / 100);
    let rest = n % 100;
    return (
      (h ? a[h] + " hundred" + (rest ? " and " : "") : "") +
      (rest ? two(rest) : "")
    );
  }
  let str = "";
  const crore = Math.floor(num / 10000000);
  num = num % 10000000;
  const lakh = Math.floor(num / 100000);
  num = num % 100000;
  const thousand = Math.floor(num / 1000);
  num = num % 1000;
  if (crore) str += three(crore) + " crore ";
  if (lakh) str += three(lakh) + " lakh ";
  if (thousand) str += three(thousand) + " thousand ";
  if (num) str += three(num);
  return str.trim();
}

async function getNextInvoiceNo(companyId) {
  const year = new Date().getFullYear();

  const fy =
    new Date().getMonth() >= 3
      ? `${String(year).slice(2)}-${String(year + 1).slice(2)}`
      : `${String(year - 1).slice(2)}-${String(year).slice(2)}`;

  const key = `invoiceSeq:${companyId}:${fy}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const seq = counter.seq;
  const seqFormatted = String(seq).padStart(3, "0");

  // company prefix (INV) or empty
  const company = await Company.findById(companyId);
  const userPrefix = company?.invoiceSettings?.invoicePrefix || "";

  if (userPrefix && userPrefix.trim() !== "") {
    return `${userPrefix}/${seqFormatted}`;
  }

  return `${fy}/${seqFormatted}`;
}

// Create invoice
router.post("/", authenticate, async (req, res) => {
  try {
    const { companyId, customerId, items = [], notes, dueDate } = req.body;

    if (!companyId || !customerId || !items.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // subtotal calculate
    let subtotal = 0;
    for (const it of items) {
      const qty = Number(it.qty || 1);
      const rate = Number(it.rate || 0);
      subtotal += qty * rate;
    }

    const company = await Company.findById(companyId);
    const userSettings = await Settings.findOne({
      userId: company.ownerUserId,
    });
    const cgstRate = Number(userSettings?.invoice?.cgst ?? 2.5);
    const sgstRate = Number(userSettings?.invoice?.sgst ?? 2.5);
    const gstPerc = cgstRate + sgstRate; // total GST %

    const cgst = +((subtotal * cgstRate) / 100).toFixed(2);
    const sgst = +((subtotal * sgstRate) / 100).toFixed(2);
    const igst = 0;
    const totalTax = +(cgst + sgst + igst).toFixed(2);

    let total = +(subtotal + totalTax).toFixed(2);

    const rounded = Math.round(total);
    const roundOff = +(rounded - total).toFixed(2);
    total = rounded;

    const invoiceNo = await getNextInvoiceNo(companyId);

    const inv = new Invoice({
      companyId,
      customerId,
      items,
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      roundOff,
      total,
      invoiceNo,
      totalInWords: numberToWords(total) + " rupees only",
      notes,
      createdBy: req.userId,
      amountPaid: 0,
      due: total,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await inv.save();

    // AUTO GENERATE PDF
    await generateInvoicePDF(inv._id);
    // reload invoice to get pdfPath
    const latestInvoice = await Invoice.findById(inv._id);

    // get customer
    const customer = await Customer.findById(customerId);

    // get company owner (user)
    const companyOwner = await User.findById(company.ownerUserId);

    // send invoice email (ONLY ONCE)
    await sendInvoiceEmail({
      companyEmail: companyOwner?.email, // company email
      customerEmail: customer?.email, // customer email
      invoice: latestInvoice,
      pdfPath: latestInvoice.pdfPath,
    });

    // update customer totalDue
    if (customer) {
      customer.totalDue = (customer.totalDue || 0) + total;
      await customer.save();
    }

    return res.status(201).json(inv);
  } catch (err) {
    console.error("Invoice create error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

router.post("/send-email/:id", authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId")
      .populate("companyId");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const company = invoice.companyId;
    const customer = invoice.customerId;

    const user = await User.findById(company.ownerUserId);

    await sendInvoiceEmail({
      companyEmail: user?.email,
      customerEmail: customer?.email,
      invoice,
      pdfPath: invoice.pdfPath,
    });

    res.json({ message: "Email sent successfully ✅" });
  } catch (err) {
    console.error("Send email error:", err);
    res.status(500).json({ message: "Email failed ❌" });
  }
});

// List invoices
router.get("/", authenticate, async (req, res) => {
  try {
    const { companyId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;

    const docs = await Invoice.find(filter)
      .populate("customerId", "name gstNo billingAddress contactNo email")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let inv of docs) {
      if (inv.due > 0) {
        if (inv.dueDate) {
          const dueDate = new Date(inv.dueDate);
          // ✅ UTC timezone fix
          const dueDateOnly = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate(),
          );

          if (dueDateOnly < today) {
            inv.status = "overdue";
          } else {
            inv.status = "pending"; // ✅ future date → pending
          }
        } else {
          inv.status = "pending";
        }
        await inv.save();
      }
    }

    for (let inv of docs) {
      if (inv.due > 0 && inv.dueDate && new Date(inv.dueDate) < today) {
        if (inv.status !== "overdue") {
          inv.status = "overdue";
          await inv.save();
        }
      }
    }
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE INVOICE
router.get("/:id", authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name contactNo gstNo billingAddress email")
      .populate("companyId", "name gstin address phone");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Get invoice error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// DELETE INVOICE
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // DELETE
    await Invoice.findByIdAndDelete(req.params.id);

    // ✅ SAFE ACTIVITY (NO CRASH)
    try {
      await Activity.create({
        type: "invoice_deleted",
        invoiceId: invoice._id,
        invoiceNo: invoice.invoiceNo,
        customerId: invoice.customerId,
        amount: invoice.total,
        due: invoice.due > 0 ? invoice.due : invoice.total,
        description: "Invoice deleted",
        createdBy: req.userId,
      });
    } catch (err) {
      console.error("Activity error:", err);
    }

    res.json({
      message: "Invoice deleted successfully",
    });
  } catch (err) {
    console.error("Delete invoice error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// UPDATE INVOICE
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { items, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // recalculate subtotal
    let subtotal = 0;

    for (const it of items) {
      const qty = Number(it.qty || 1);
      const rate = Number(it.rate || 0);
      subtotal += qty * rate;
    }

    const company = await Company.findById(invoice.companyId);
    const userSettings = await Settings.findOne({
      userId: company.ownerUserId,
    });
    const cgstRate = Number(userSettings?.invoice?.cgst ?? 2.5);
    const sgstRate = Number(userSettings?.invoice?.sgst ?? 2.5);

    const cgst = +((subtotal * cgstRate) / 100).toFixed(2);
    const sgst = +((subtotal * sgstRate) / 100).toFixed(2);
    const totalTax = cgst + sgst;

    let total = subtotal + totalTax;

    const rounded = Math.round(total);
    const roundOff = +(rounded - total).toFixed(2);
    total = rounded;

    invoice.items = items;
    invoice.subtotal = subtotal;
    invoice.cgst = cgst;
    invoice.sgst = sgst;
    invoice.totalTax = totalTax;
    invoice.total = total;
    invoice.roundOff = roundOff;
    invoice.notes = notes;

    // recalculate due
    invoice.due = invoice.total - invoice.amountPaid;

    // update invoice status
    if (invoice.due <= 0) {
      invoice.status = "paid";
      invoice.due = 0;
    } else {
      invoice.status = "pending";
    }
    await invoice.save();

    await Activity.create({
      type: "invoice_updated",
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amount: invoice.total,
      description: "Invoice edited",
      createdBy: req.userId,
    });

    res.json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (err) {
    console.error("Update invoice error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
