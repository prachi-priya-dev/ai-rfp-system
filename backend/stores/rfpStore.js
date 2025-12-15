// backend/rfpStore.js
const db = require('../db');

// Create a new RFP and return the created row
function createRfp({ title, description, budget, budgetCurrency, deadline }) {
  const stmt = db.prepare(`
    INSERT INTO rfps (title, description, budget, budgetCurrency, deadline)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    title,
    description,
    budget ?? null,
    budgetCurrency || null,
    deadline ?? null
  );

  const row = db
    .prepare('SELECT * FROM rfps WHERE id = ?')
    .get(info.lastInsertRowid);

  return row;
}

// Get all RFPs (newest first) + how many vendors linked to each
function getAllRfps() {
  const rows = db
    .prepare(
      `
    SELECT
      r.*,
      COUNT(rv.vendorId) AS vendorCount,
      GROUP_CONCAT(v.name, ', ') AS vendorNames
    FROM rfps r
    LEFT JOIN rfp_vendors rv ON rv.rfpId = r.id
    LEFT JOIN vendors v ON v.id = rv.vendorId
    GROUP BY r.id
    ORDER BY datetime(r.createdAt) DESC
  `,
    )
    .all();

  return rows;
}

// Get a single RFP by id
function getRfpById(id) {
  const row = db.prepare('SELECT * FROM rfps WHERE id = ?').get(id);
  return row || null;
}

function deleteRfp(id) {
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM rfp_vendors WHERE rfpId = ?').run(id);
    db.prepare('DELETE FROM proposals WHERE rfpId = ?').run(id);
    db.prepare('DELETE FROM rfps WHERE id = ?').run(id);
  });

  tx();
}

function updateRfp(id, { title, description, budget, budgetCurrency, deadline }) {
  db.prepare(`
    UPDATE rfps
    SET title = ?, description = ?, budget = ?, budgetCurrency = ?, deadline = ?
    WHERE id = ?
  `).run(
    title,
    description,
    budget ?? null,
    budgetCurrency ?? null,
    deadline ?? null,
    id
  );

  return getRfpById(id);
}

module.exports = {
  createRfp,
  getAllRfps,
  getRfpById,
  deleteRfp,
  updateRfp,
};
