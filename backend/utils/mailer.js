const moment = require("moment");
const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST, // smtp-relay.brevo.com
  port: process.env.BREVO_SMTP_PORT, // 587
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER, // Brevo login
    pass: process.env.BREVO_SMTP_PASS, // Brevo password
  },
});

async function sendVerificationCodeEmail(toEmail, code, name) {
  try {
    await transporter.sendMail({
      from: `"PrimeCapital" <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: "PrimeCapital Verification Code",
      html: getVerificationHTML(code, name),
    });
  } catch (err) {
    console.error("BREVO VERIFICATION MAIL ERROR:", err);
    throw new Error("Email sending failed");
  }
}

async function sendResetPasswordEmail(toEmail, code, name) {
  try {
    await transporter.sendMail({
      from: `"PrimeCapital" <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: "PrimeCapital Password Reset Code",
      html: getResetHTML(code, name),
    });
  } catch (err) {
    console.error("BREVO RESET MAIL ERROR:", err);
    throw new Error("Email sending failed");
  }
}

/* ================= HTML TEMPLATES ================= */
function getVerificationHTML(code, name) {
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>PrimeCapital - Verification Code</title>

<style>
:root { color-scheme: light dark; }

.logo-light {
  display:block !important;
  width:60px !important;
  height:60px !important;
}

.logo-dark {
  display:none !important;
  width:0 !important;
  height:0 !important;
  mso-hide:all !important;
}

@media (prefers-color-scheme: dark) {
  .logo-light { display:none !important; width:0 !important; height:0 !important; }
  .logo-dark  { display:block !important; width:60px !important; height:60px !important; }
}
</style>
</head>

<body style="margin:0;padding:0;background:linear-gradient(180deg,#dbeafe,#eff6ff);font-family:'Segoe UI',Tahoma,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:18px;box-shadow:0 10px 40px rgba(59,130,246,.15);overflow:hidden;">

<!-- HEADER -->
<tr>
<td style="padding:36px 40px;background:linear-gradient(135deg,#2563eb,#1d4ed8);">
<table cellpadding="0" cellspacing="0" width="100%">
<tr>
<td style="padding-right:20px;vertical-align:middle;width:60px;">
<img src="${
    process.env.BACKEND_URL
  }/assets/logo-light.png" class="logo-light" alt="PrimeCapital Logo" style="display:block;" />
<img src="${
    process.env.BACKEND_URL
  }/assets/logo-dark.png" class="logo-dark" alt="PrimeCapital Logo" style="display:block;" />
</td>

<td style="vertical-align:middle;">
<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.2;">
PrimeCapital
</h1>
<p style="margin:4px 0 0;color:rgba(255,255,255,.9);font-size:13px;line-height:1.3;">
Secure Account Verification
</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:44px;">
<h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;">
Hello <span style="color:#2563eb;">${name || "there"}</span> 👋
</h2>

<p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 24px;">
Use the verification code below to complete your PrimeCapital sign-in.
</p>

<div style="margin:32px 0;text-align:center;">
<div style="display:inline-block;background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:24px 36px;">
<p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
Verification Code
</p>
<div style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#1e40af;letter-spacing:8px;">
${code}
</div>
<p style="margin:10px 0 0;font-size:12px;color:#64748b;">
Expires in 15 minutes
</p>
</div>
</div>

<p style="color:#64748b;font-size:14px;line-height:22px;margin:24px 0 0;">
If you didn't request this verification code, you can safely ignore this email. Your account remains secure.
</p>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="padding:28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
<p style="margin:0;font-size:13px;color:#475569;font-weight:600;">PrimeCapital</p>
<p style="margin:6px 0;font-size:12px;color:#94a3b8;">
GST Invoice & Business Management System
</p>
<p style="margin:0;font-size:12px;color:#cbd5e1;">
© 2025 PrimeCapital. All rights reserved.
</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>
`;
}

function getResetHTML(code, name) {
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>PrimeCapital - Reset Password</title>

<style>
:root { color-scheme: light dark; }

.logo-light {
  display:block !important;
  width:60px !important;
  height:60px !important;
}

.logo-dark {
  display:none !important;
  width:0 !important;
  height:0 !important;
  mso-hide:all !important;
}

@media (prefers-color-scheme: dark) {
  .logo-light { display:none !important; width:0 !important; height:0 !important; }
  .logo-dark  { display:block !important; width:60px !important; height:60px !important; }
}
</style>
</head>

<body style="margin:0;padding:0;background:linear-gradient(180deg,#dbeafe,#eff6ff);font-family:'Segoe UI',Tahoma,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:18px;box-shadow:0 10px 40px rgba(59,130,246,.15);overflow:hidden;">

<!-- HEADER -->
<tr>
<td style="padding:36px 40px;background:linear-gradient(135deg,#2563eb,#1d4ed8);">
<table cellpadding="0" cellspacing="0" width="100%">
<tr>
<td style="padding-right:20px;vertical-align:middle;width:60px;">
<img src="${
    process.env.BACKEND_URL
  }/assets/logo-light.png" class="logo-light" alt="PrimeCapital Logo" style="display:block;" />
<img src="${
    process.env.BACKEND_URL
  }/assets/logo-dark.png" class="logo-dark" alt="PrimeCapital Logo" style="display:block;" />
</td>

<td style="vertical-align:middle;">
<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.2;">
PrimeCapital
</h1>
<p style="margin:4px 0 0;color:rgba(255,255,255,.9);font-size:13px;line-height:1.3;">
Password Reset Request
</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:44px;">
<h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;">
Hello <span style="color:#2563eb;">${name || "there"}</span> 🔐
</h2>

<p style="color:#475569;font-size:16px;line-height:26px;margin:0 0 24px;">
We received a request to reset your PrimeCapital account password. Use the code below to proceed with the password reset.
</p>

<div style="margin:32px 0;text-align:center;">
<div style="display:inline-block;background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:24px 36px;">
<p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
Reset Code
</p>
<div style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#1e40af;letter-spacing:8px;">
${code}
</div>
<p style="margin:10px 0 0;font-size:12px;color:#64748b;">
Expires in 15 minutes
</p>
</div>
</div>

<p style="color:#64748b;font-size:14px;line-height:22px;margin:24px 0 0;">
If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account remains secure.
</p>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="padding:28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
<p style="margin:0;font-size:13px;color:#475569;font-weight:600;">PrimeCapital</p>
<p style="margin:6px 0;font-size:12px;color:#94a3b8;">
GST Invoice & Business Management System
</p>
<p style="margin:0;font-size:12px;color:#cbd5e1;">
© 2025 PrimeCapital. All rights reserved.
</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>

`;
}

async function sendInvoiceEmail({
  companyEmail,
  customerEmail,
  invoice,
  pdfPath,
}) {
  try {
    console.log("🚀 sendInvoiceEmail function called");
    console.log("📨 companyEmail =", companyEmail);
    console.log("📨 customerEmail =", customerEmail);
    console.log("📄 pdfPath =", pdfPath);

    const recipients = [companyEmail, customerEmail].filter(Boolean).join(",");

    console.log("📨 recipients =", recipients);

    if (!recipients.length) {
      console.log("⚠️ No email recipients found");
      return;
    }

    await transporter.sendMail({
      from: `"PrimeCapital" <${process.env.FROM_EMAIL}>`,
      to: recipients,
      subject: `Invoice ${invoice.invoiceNo} - PrimeCapital`,
      html: `
<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:30px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.08);overflow:hidden;">
    
    <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:20px;color:white;">
      <h1 style="margin:0;font-size:22px;">PrimeCapital</h1>
      <p style="margin:4px 0 0;font-size:13px;">GST Invoice & Business Management</p>
    </div>

    <div style="padding:24px;">
      <h2 style="margin:0 0 10px;color:#0f172a;">Invoice Generated ✅</h2>

      <p style="color:#475569;font-size:14px;">
        Hello,<br/>
        Your invoice has been successfully generated.
      </p>

      <table style="width:100%;margin-top:16px;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#64748b;">Invoice No</td>
          <td style="padding:8px 0;font-weight:bold;">${invoice.invoiceNo}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748b;">Total Amount</td>
          <td style="padding:8px 0;font-weight:bold;">₹${invoice.total}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748b;">Date</td>
          <td style="padding:8px 0;font-weight:bold;">${moment(
            invoice.createdAt,
          ).format("DD/MM/YYYY")}</td>
        </tr>
      </table>

      <p style="margin-top:16px;color:#475569;font-size:14px;">
        📎 Invoice PDF is attached with this email.
      </p>

      <div style="margin-top:20px;text-align:center;">
        <span style="display:inline-block;background:#2563eb;color:white;padding:10px 18px;border-radius:8px;font-size:13px;">
          PrimeCapital Invoice System
        </span>
      </div>
    </div>

    <div style="background:#f1f5f9;padding:12px;text-align:center;font-size:12px;color:#64748b;">
      © ${new Date().getFullYear()} PrimeCapital. All rights reserved.
    </div>

  </div>
</div>
`,

      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath,
        },
      ],
    });

    console.log("✅ Invoice email sent successfully");
  } catch (err) {
    console.error("❌ Invoice email error:", err);
  }
}

module.exports = {
  sendVerificationCodeEmail,
  sendResetPasswordEmail,
  sendInvoiceEmail,
};
