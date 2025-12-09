const db = require('./db');

// Create a new RFP and return the created row
function createRfp({ title, description, budget, deadline, budgetCurrency }) {
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

  // Fetch the inserted row
  const row = db
    .prepare('SELECT * FROM rfps WHERE id = ?')
    .get(info.lastInsertRowid);

  return row;
}

// Get all RFPs (newest first)
function getAllRfps() {
  const rows = db
    .prepare('SELECT * FROM rfps ORDER BY datetime(createdAt) DESC')
    .all();
  return rows;
}

// Get a single RFP by id
function getRfpById(id) {
  const row = db.prepare('SELECT * FROM rfps WHERE id = ?').get(id);
  return row || null;
}

module.exports = {
  createRfp,
  getAllRfps,
  getRfpById,
};
