const path = require('path');
const Database = require('better-sqlite3');

// The database file will be created in the backend folder
const dbPath = path.join(__dirname, 'rfp.db');

// Open (or create) the SQLite database
const db = new Database(dbPath);

// Some recommended SQLite settings
db.pragma('journal_mode = WAL');

// Create the RFPs table if it doesn't exist
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


module.exports = db;
