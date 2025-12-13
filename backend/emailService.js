// backend/emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const {
  MAILTRAP_HOST,
  MAILTRAP_PORT,
  MAILTRAP_USER,
  MAILTRAP_PASS,
  MAIL_FROM,
} = process.env;

// create SMTP transport for Mailtrap
const transporter = nodemailer.createTransport({
  host: MAILTRAP_HOST,
  port: Number(MAILTRAP_PORT) || 2525,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASS,
  },
});
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Send RFP email to a list of vendors.
 * @param {object} rfp - RFP row from DB
 * @param {Array} vendors - vendor rows (name, email, etc.)
 */
async function sendRfpEmails(rfp, vendors) {
  if (!rfp || !Array.isArray(vendors) || vendors.length === 0) {
    return { sent: 0, results: [] };
  }

  const from = MAIL_FROM || 'RFP System <no-reply@example.com>';

  const baseText = `
You are invited to submit a proposal for the following RFP:

Title: ${rfp.title}

Description:
${rfp.description}

Budget: ${
    rfp.budget != null
      ? `${rfp.budgetCurrency || ''} ${rfp.budget}`
      : 'Not specified'
  }
Deadline: ${rfp.deadline || 'Not specified'}

Please reply to this email with your proposal, pricing, and terms.
  `.trim();

  const results = [];
  let sent = 0;

  for (const vendor of vendors) {
    // ✅ vendor email validation (prevents crash)
    if (!vendor.email || !vendor.email.includes('@')) {
      results.push({
        vendorId: vendor.id,
        ok: false,
        error: 'Missing/invalid vendor email',
      });
      continue;
    }

    const mailOptions = {
      from,
      to: vendor.email,
      subject: `RFP Invitation: ${rfp.title}`,
      text:
        baseText +
        `

Vendor: ${vendor.name}${vendor.company ? ' (' + vendor.company + ')' : ''}
`,
      html: `
        <p>You are invited to submit a proposal for the following RFP:</p>
        <p><strong>Title:</strong> ${rfp.title}</p>
        <p><strong>Description:</strong><br/>${rfp.description}</p>
        <p><strong>Budget:</strong> ${
          rfp.budget != null
            ? `${rfp.budgetCurrency || ''} ${rfp.budget}`
            : 'Not specified'
        }</p>
        <p><strong>Deadline:</strong> ${rfp.deadline || 'Not specified'}</p>
        <p>Please reply to this email with your proposal, pricing, and terms.</p>
        <hr />
        <p>Vendor: ${vendor.name}${
          vendor.company ? ' (' + vendor.company + ')' : ''
        }</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      sent++;
      results.push({
        vendorId: vendor.id,
        ok: true,
        messageId: info.messageId,
        to: vendor.email,
      });
    } catch (err) {
      results.push({
        vendorId: vendor.id,
        ok: false,
        error: err.message,
        to: vendor.email,
      });
    }
    await sleep(20000);
  }

  return { sent, results };
}

module.exports = {
  sendRfpEmails,
};
