import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";
import { useState } from "react";
import { useTheme } from "../../../hooks/useTheme";

function getFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  return date.getMonth() >= 3
    ? `${String(year).slice(2)}-${String(year + 1).slice(2)}`
    : `${String(year - 1).slice(2)}-${String(year).slice(2)}`;
}

function formatInvoiceNumber(invoiceNo, prefix = "") {
  if (!invoiceNo) return "GENERATING...";
  let num = invoiceNo;
  if (typeof invoiceNo === "string" && invoiceNo.includes("/"))
    num = invoiceNo.split("/").pop();
  const fy = getFinancialYear();
  if (prefix && prefix.trim() !== "") return `${prefix}/${num}`;
  return `${fy}/${num}`;
}

export default function InvoicePreview({
  company,
  customer,
  items,
  subtotal,
  gstAmount,
  invoiceNo,
  invoiceData,
  transport,
  destination,
  invoicePrefix,
  onDownload,
  onShare,
  invoiceSettings,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [notification, setNotification] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const realInvoiceNo = invoiceData?.invoiceNo ?? invoiceNo ?? null;
  const finalInvoiceNo = realInvoiceNo
    ? formatInvoiceNumber(realInvoiceNo, invoicePrefix)
    : "GENERATING...";

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const totalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  const taxAmount = cgst + sgst;
  const totalWithTax = subtotal + taxAmount;
  const roundedTotal = Math.round(totalWithTax);
  const roundOff = +(roundedTotal - totalWithTax).toFixed(2);

  function numberToWords(num) {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    if (num === 0) return "Zero";
    function two(n) {
      return n < 20
        ? a[n]
        : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    }
    function three(n) {
      const h = Math.floor(n / 100),
        r = n % 100;
      return (h ? a[h] + " Hundred " : "") + (r ? two(r) : "");
    }
    let str = "",
      crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    if (crore) str += three(crore) + " Crore ";
    if (lakh) str += three(lakh) + " Lakh ";
    if (thousand) str += three(thousand) + " Thousand ";
    if (num) str += three(num);
    return str.trim();
  }

  const totalInWords = numberToWords(roundedTotal) + " Only";

  const downloadPDF = async () => {
    const element = document.getElementById("invoice-preview");
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210,
      pdfHeight = (canvas.height * pdfWidth) / canvas.width,
      margin = 10;
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin,
      pdfWidth - margin * 2,
      pdfHeight,
    );
    const customerName = customer?.name || "Customer";
    const safeCustomerName = customerName.replace(/[\\/:*?"<>|]/g, "");
    const dateStr = invoiceData?.createdAt
      ? moment(invoiceData.createdAt).format("DD MMMM YYYY")
      : moment().format("DD MMMM YYYY");
    const fy = getFinancialYear();
    const invoiceNumberOnly = finalInvoiceNo.split("/").pop();
    pdf.save(`${fy}_${invoiceNumberOnly}_${safeCustomerName}_${dateStr}.pdf`);
    showNotification("Invoice downloaded successfully! 📥", "success");
    if (onDownload) onDownload();
  };

  const sendPDFToBackend = async () => {
    if (!invoiceData?._id) {
      showNotification("Invoice not created yet!", "error");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/invoices/save-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ invoiceId: invoiceData._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "PDF save failed!", "error");
        return;
      }
      showNotification(
        `Invoice saved successfully! 💾\n${data.fileName}`,
        "success",
      );
    } catch {
      showNotification("Failed to save invoice. Please try again.", "error");
    }
  };

  const shareOnWhatsApp = () => {
    if (!invoiceData?._id) {
      showNotification("Invoice not created yet!", "error");
      return;
    }
    let phone = customer?.contactNo || "";
    phone = phone.replace(/\s+/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;
    const BASE_URL = "https://irruptive-touristically-westin.ngrok-free.dev";
    const pdfLink = `${BASE_URL}/api/invoices/download-pdf/${invoiceData._id}`;
    const message = `Hello ${customer?.name || "Customer"} 👋\n\nYour invoice is ready ✅\n\nInvoice No: ${finalInvoiceNo}\nAmount: ₹${roundedTotal}\n\nDownload Invoice PDF:\n${pdfLink}\n\nThank you 🙂\n${company?.name || ""}`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    showNotification("Invoice shared on WhatsApp! 📤", "success");
    if (onShare) onShare();
  };

  const FIXED_ROWS = 11;
  /* ── Invoice colors — ALWAYS hardcoded (PDF must be light) ── */
  const B = "1px solid #555";
  const B2 = "1px solid #000";

  /* ══════════════════════════════════════════════════════════
     InvoiceBody — hardcoded light colors, PDF-safe
  ══════════════════════════════════════════════════════════ */
  const InvoiceBody = ({ forPdf = false }) => {
    const emptyRows = items.length < FIXED_ROWS ? FIXED_ROWS - items.length : 0;
    const fs = forPdf ? "9.5px" : "15px";
    const pad = forPdf ? "3px 6px" : "8px 10px";
    const padSm = forPdf ? "3px 6px" : "5px 8px";

    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: fs,
          color: "#111",
          lineHeight: "1.4",
        }}
      >
        {/* TAX INVOICE */}
        <div style={{ textAlign: "center", marginBottom: "3px" }}>
          <span
            style={{
              fontSize: forPdf ? "11px" : "20px",
              fontWeight: "900",
              letterSpacing: "3px",
            }}
          >
            TAX INVOICE
          </span>
        </div>

        {/* Company Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "2px solid #000",
            paddingBottom: "5px",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              fontSize: forPdf ? "20px" : "36px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            {company?.name?.toUpperCase() || "COMPANY NAME"}
          </div>
          <div
            style={{
              fontSize: forPdf ? "9px" : "11px",
              color: "#444",
              marginTop: "1px",
            }}
          >
            {company?.address || "Company Address"}
          </div>
          <div style={{ fontSize: forPdf ? "9px" : "11px", marginTop: "1px" }}>
            Tel : {company?.phone || "-"}
          </div>
        </div>

        {/* GSTIN Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: forPdf ? "9px" : "11px",
            fontWeight: "bold",
            borderBottom: "2px solid #000",
            paddingBottom: "3px",
            marginBottom: "5px",
          }}
        >
          <span>GSTIN: {company?.gstin || "-"}</span>
          <span>STATE: {company?.state || "-"}</span>
          <span>STATE CODE: {company?.stateCode || "-"}</span>
        </div>

        {/* Buyer + Invoice Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "55% 45%",
            border: B2,
            marginBottom: "5px",
            fontSize: forPdf ? "9px" : "11px",
          }}
        >
          <div style={{ padding: pad, borderRight: B2 }}>
            <div
              style={{ fontWeight: "bold", color: "#666", marginBottom: "2px" }}
            >
              Buyer
            </div>
            <div style={{ fontWeight: "bold" }}>{customer?.name || "-"}</div>
            <div>{customer?.billingAddress || "-"}</div>
            <div>Phone: {customer?.contactNo || "-"}</div>
            <div>GSTIN/UIN : {customer?.gstNo || "-"}</div>
            <div>
              State Name : {company?.state || "-"}, Code :{" "}
              {company?.stateCode || "-"}
            </div>
          </div>
          <div style={{ padding: pad }}>
            <div style={{ marginBottom: "2px" }}>
              <b>Invoice No. :</b> {finalInvoiceNo}
            </div>
            <div style={{ marginBottom: "2px" }}>
              <b>Invoice Date :</b>{" "}
              {moment(invoiceData?.createdAt || new Date()).format(
                "DD-MM-YYYY",
              )}
            </div>
            <div style={{ marginBottom: "2px" }}>
              <b>Transport :</b> {transport || "-"}
            </div>
            <div>
              <b>Destination :</b> {destination || "-"}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: forPdf ? "9px" : "14px",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "50px" }} />
            <col />
            <col style={{ width: "90px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "110px" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
              {[
                ["SR NO.", "center"],
                ["Description", "left"],
                ["HSN CODE", "center"],
                ["Qty.", "center"],
                ["Rate (₹)", "right"],
                ["Amount (₹)", "right"],
              ].map(([h, a]) => (
                <th key={h} style={{ border: B, padding: pad, textAlign: a }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td style={{ border: B, padding: pad, textAlign: "center" }}>
                  {i + 1}
                </td>
                <td style={{ border: B, padding: pad }}>
                  {it.description || "-"}
                </td>
                <td style={{ border: B, padding: pad, textAlign: "center" }}>
                  {it.hsnCode?.trim() || "-"}
                </td>
                <td style={{ border: B, padding: pad, textAlign: "center" }}>
                  {it.qty}
                </td>
                <td style={{ border: B, padding: pad, textAlign: "right" }}>
                  {Number(it.rate).toFixed(2)}
                </td>
                <td style={{ border: B, padding: pad, textAlign: "right" }}>
                  {(Number(it.qty) * Number(it.rate)).toFixed(2)}
                </td>
              </tr>
            ))}
            {[...Array(emptyRows)].map((_, i) => (
              <tr key={`e-${i}`} style={{ height: "16px" }}>
                {[...Array(6)].map((__, j) => (
                  <td key={j} style={{ border: B }}>
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
            <tr style={{ fontWeight: "bold", background: "#f5f5f5" }}>
              <td
                colSpan="3"
                style={{ border: B, padding: pad, textAlign: "right" }}
              >
                Total
              </td>
              <td style={{ border: B, padding: pad, textAlign: "center" }}>
                {totalQty}
              </td>
              <td style={{ border: B, padding: pad }}></td>
              <td style={{ border: B, padding: pad, textAlign: "right" }}>
                ₹ {subtotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bottom Section */}
        <div
          style={{
            border: B2,
            borderTop: "none",
            display: "flex",
            fontSize: forPdf ? "9px" : "11px",
          }}
        >
          {/* Left */}
          <div
            style={{
              width: "60%",
              borderRight: B2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: padSm, borderBottom: B2 }}>
              <span style={{ fontWeight: "bold" }}>
                Total Amount in Words :{" "}
              </span>
              <span
                style={{ fontStyle: "italic", borderBottom: "1px solid #555" }}
              >
                INR {totalInWords}
              </span>
            </div>
            {invoiceSettings?.showBank !== false && (
              <div style={{ padding: padSm, borderBottom: B2 }}>
                <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                  Bank Details
                </div>
                <div>
                  <b>Company Name</b> : {company?.name || "-"}
                </div>
                <div>
                  <b>Bank Name</b> : {company?.bankName || "-"}
                </div>
                <div>
                  <b>A/c No</b> : {company?.accountNumber || "-"}
                </div>
                <div>
                  <b>IFSC Code</b> : {company?.ifsc || "-"}
                </div>
              </div>
            )}
            <div
              style={{
                padding: padSm,
                flex: 1,
                position: "relative",
                minHeight: "80px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  marginBottom: "3px",
                }}
              >
                Terms &amp; Conditions
              </div>
              {invoiceSettings?.terms && (
                <div
                  style={{
                    whiteSpace: "pre-line",
                    lineHeight: "1.6",
                    paddingRight: "96px",
                  }}
                >
                  {invoiceSettings.terms}
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    width: "125px",
                    height: "75px",
                    border: "1px dashed #aaa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    fontSize: forPdf ? "8px" : "11px",
                  }}
                >
                  Common Seal
                </div>
                <div
                  style={{ fontSize: forPdf ? "8px" : "11px", color: "#666" }}
                >
                  (Customer Signature)
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div
            style={{ width: "40%", display: "flex", flexDirection: "column" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
              }}
            >
              <tbody>
                {[
                  ["Total", subtotal.toFixed(2), false],
                  [
                    `Add : CGST ${invoiceSettings?.cgst ?? 2.5}%`,
                    cgst.toFixed(2),
                    false,
                  ],
                  [
                    `Add : SGST ${invoiceSettings?.sgst ?? 2.5}%`,
                    sgst.toFixed(2),
                    false,
                  ],
                  ["Total Tax Amount", taxAmount.toFixed(2), true],
                  ["Total Amount w/Tax", totalWithTax.toFixed(2), false],
                  ["Round Off", roundOff.toFixed(2), false],
                ].map(([label, value, bold]) => (
                  <tr key={label} style={bold ? { fontWeight: "bold" } : {}}>
                    <td
                      style={{
                        padding: padSm,
                        borderBottom: bold ? B2 : "1px solid #ddd",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: padSm,
                        textAlign: "right",
                        borderBottom: bold ? B2 : "1px solid #ddd",
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: "bold", background: "#f0f0f0" }}>
                  <td style={{ padding: padSm, borderBottom: B2 }}>
                    Total Amount
                  </td>
                  <td
                    style={{
                      padding: padSm,
                      textAlign: "right",
                      borderBottom: B2,
                    }}
                  >
                    ₹ {roundedTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                flex: 1,
                padding: padSm,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "60px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontStyle: "italic",
                  textAlign: "center",
                  fontSize: "11px",
                }}
              >
                For {company?.name?.toUpperCase() || "COMPANY"}
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    borderTop: "1px dashed #aaa",
                    paddingTop: "3px",
                    fontSize: forPdf ? "8px" : "11px",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════
          WRAPPER CARD — theme apply hoti hai yahan
      ══════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
        style={{
          minWidth: "690px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl p-2 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isPreviewVisible ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  )}
                </svg>
              </button>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Live Preview
              </h2>
            </div>
            {invoiceData && (
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold hidden md:inline">
                  Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Live Preview area ── */}
        {isPreviewVisible ? (
          /* Invoice always white bg — PDF safe */
          <div style={{ padding: "12px", background: "var(--bg-subtle)" }}>
            <div
              style={{
                background: "white",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                padding: "16px 20px",
              }}
            >
              <InvoiceBody />
            </div>
          </div>
        ) : (
          /* Hidden state */
          <div
            className="p-8 text-center"
            style={{ background: "var(--bg-subtle)" }}
          >
            <div
              className="rounded-xl p-8"
              style={{
                background: "var(--bg-card)",
                border: "2px dashed var(--border)",
              }}
            >
              <svg
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Invoice Preview Hidden
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                Click the eye icon to show preview
              </p>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div
          className="p-4 md:p-5"
          style={{
            background: "var(--bg-subtle)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Download */}
            <button
              onClick={downloadPDF}
              className="text-white px-4 md:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden md:inline">Download PDF</span>
              <span className="md:hidden">Download</span>
            </button>

            {/* Save to Server */}
            <button
              onClick={sendPDFToBackend}
              disabled={!invoiceData?._id}
              className="text-white px-4 md:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              <span className="hidden md:inline">Save to Server</span>
              <span className="md:hidden">Save</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareOnWhatsApp}
              disabled={!invoiceData?._id}
              className="text-white px-4 md:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base bg-[#25D366] hover:bg-[#22c55e]"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden md:inline">WhatsApp</span>
              <span className="md:hidden">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* HIDDEN A4 PDF DIV — always white, never themed */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div
          id="invoice-preview"
          style={{
            width: "794px",
            padding: "28px 32px",
            background: "white",
            boxSizing: "border-box",
          }}
        >
          <InvoiceBody forPdf={true} />
        </div>
      </div>

      {/* ── Notification Modal ── */}
      {notification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setNotification(null)}
        >
          <div
            className="rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "scaleIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    notification.type === "success"
                      ? "var(--green-bg)"
                      : "var(--red-bg)",
                }}
              >
                {notification.type === "success" ? (
                  <svg
                    className="w-10 h-10"
                    style={{ color: "var(--green-text)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-10 h-10"
                    style={{ color: "var(--red-text)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <h3
              className="text-2xl font-bold mb-3"
              style={{
                color:
                  notification.type === "success"
                    ? "var(--green-text)"
                    : "var(--red-text)",
              }}
            >
              {notification.type === "success" ? "Success!" : "Error!"}
            </h3>
            <p
              className="text-lg mb-6 whitespace-pre-line"
              style={{ color: "var(--text-secondary)" }}
            >
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className={`px-8 py-3 rounded-xl font-semibold text-white hover:scale-105 transition-all duration-200 ${
                notification.type === "success"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-red-500 to-rose-500"
              }`}
            >
              OK, Got it!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
      `}</style>
    </>
  );
}
