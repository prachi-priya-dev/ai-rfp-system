// backend/db.js
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'rfp.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// RFPs table
db.exec(`
  CREATE TABLE IF NOT EXISTS rfps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget INTEGER,
    budgetCurrency TEXT,
    deadline TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Vendors table
db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Mapping table: which vendors are linked to which RFP
db.exec(`
  CREATE TABLE IF NOT EXISTS rfp_vendors (
    rfpId INTEGER NOT NULL,
    vendorId INTEGER NOT NULL,
    PRIMARY KEY (rfpId, vendorId)
  );
`);

module.exports = db;
