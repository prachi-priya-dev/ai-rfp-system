// backend/vendorStore.js
const db = require('../db');

function createVendor({ name, email, company, notes }) {
  const stmt = db.prepare(`
    INSERT INTO vendors (name, email, company, notes)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(
    name,
    email,
    company || null,
    notes || null
  );

  const row = db
    .prepare('SELECT * FROM vendors WHERE id = ?')
    .get(info.lastInsertRowid);

  return row;
}

function getAllVendors() {
  const rows = db
    .prepare(
      `
    SELECT *
    FROM vendors
    ORDER BY datetime(createdAt) DESC
  `,
    )
    .all();

  return rows;
}

function getVendorsForRfp(rfpId) {
  const rows = db
    .prepare(
      `
    SELECT v.*
    FROM vendors v
    JOIN rfp_vendors rv ON rv.vendorId = v.id
    WHERE rv.rfpId = ?
    ORDER BY v.name
  `,
    )
    .all(rfpId);

  return rows;
}

function setVendorsForRfp(rfpId, vendorIds) {
  const deleteStmt = db.prepare(
    'DELETE FROM rfp_vendors WHERE rfpId = ?',
  );
  const insertStmt = db.prepare(
    'INSERT OR IGNORE INTO rfp_vendors (rfpId, vendorId) VALUES (?, ?)',
  );

  const tx = db.transaction((ids) => {
    deleteStmt.run(rfpId);
    (ids || []).forEach((id) => {
      insertStmt.run(rfpId, id);
    });
  });

  tx(vendorIds || []);
}

// 🔹 NEW: update existing vendor
function updateVendor(id, { name, email, company, notes }) {
  const stmt = db.prepare(`
    UPDATE vendors
    SET name = ?, email = ?, company = ?, notes = ?
    WHERE id = ?
  `);

  stmt.run(
    name,
    email,
    company || null,
    notes || null,
    id
  );

  const row = db
    .prepare('SELECT * FROM vendors WHERE id = ?')
    .get(id);

  return row;
}

module.exports = {
  createVendor,
  getAllVendors,
  getVendorsForRfp,
  setVendorsForRfp,
  updateVendor,          // 👈 export
};
