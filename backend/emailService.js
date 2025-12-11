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

/**
 * Send RFP email to a list of vendors.
 * @param {object} rfp - RFP row from DB
 * @param {Array} vendors - vendor rows (name, email, etc.)
 */
async function sendRfpEmails(rfp, vendors) {
  if (!rfp || !Array.isArray(vendors) || vendors.length === 0) {
    return { sent: 0 };
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

  for (const vendor of vendors) {
    const mailOptions = {
      from,
      to: vendor.email,
      subject: `RFP Invitation: ${rfp.title}`,
      text: baseText + `

Vendor: ${vendor.name}${
        vendor.company ? ' (' + vendor.company + ')' : ''
      }
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
        <p><strong>Deadline:</strong> ${
          rfp.deadline || 'Not specified'
        }</p>
        <p>Please reply to this email with your proposal, pricing, and terms.</p>
        <hr />
        <p>Vendor: ${vendor.name}${
        vendor.company ? ' (' + vendor.company + ')' : ''
      }</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    results.push({ vendorId: vendor.id, messageId: info.messageId });
  }

  return { sent: results.length, results };
}

module.exports = {
  sendRfpEmails,
};
