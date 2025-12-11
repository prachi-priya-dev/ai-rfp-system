// backend/proposalStore.js
const db = require('./db');

/**
 * Create a proposal row in DB.
 * `parsed` is the structured object from our mock AI
 */
function createProposal({ rfpId, vendorName, vendorEmail, rawText, parsed }) {
  const json = parsed ? JSON.stringify(parsed) : null;
  const amount =
    parsed && typeof parsed.amount === 'number' ? parsed.amount : null;
  const currency = parsed && parsed.currency ? parsed.currency : null;

  const stmt = db.prepare(`
    INSERT INTO proposals (
      rfpId, vendorName, vendorEmail, rawText, parsedJson, amount, currency
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    rfpId,
    vendorName || null,
    vendorEmail || null,
    rawText,
    json,
    amount,
    currency,
  );

  const row = db
    .prepare('SELECT * FROM proposals WHERE id = ?')
    .get(info.lastInsertRowid);

  // parse JSON back to object for API response
  if (row && row.parsedJson) {
    try {
      row.parsed = JSON.parse(row.parsedJson);
    } catch {
      row.parsed = null;
    }
  } else {
    row.parsed = null;
  }

  return row;
}

/**
 * Get all proposals for a given RFP id (newest first)
 */
function getProposalsForRfp(rfpId) {
  const rows = db
    .prepare(
      `
    SELECT *
    FROM proposals
    WHERE rfpId = ?
    ORDER BY datetime(createdAt) DESC
  `,
    )
    .all(rfpId);

  return rows.map((row) => {
    if (row.parsedJson) {
      try {
        row.parsed = JSON.parse(row.parsedJson);
      } catch {
        row.parsed = null;
      }
    } else {
      row.parsed = null;
    }
    return row;
  });
}

module.exports = {
  createProposal,
  getProposalsForRfp,
};
