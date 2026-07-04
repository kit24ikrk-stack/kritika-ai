const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// ==========================================
// SQLite-only database layer
// Exposes a small unified API (query/execute/getOne)
// so route handlers stay storage-agnostic.
// ==========================================

let sqliteDb = null;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Initialise the SQLite database connection and ensure tables exist.
function initDb() {
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Could not connect to SQLite database:', err.message);
        return reject(err);
      }
      console.log(`Connected to SQLite database (${DB_PATH}).`);
      createTables().then(resolve).catch(reject);
    });
  });
}

// Create tables if they do not already exist.
function createTables() {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(() => {
      // Inquiries table (FR-02)
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company TEXT,
          country TEXT,
          job_title TEXT,
          job_details TEXT NOT NULL,
          status TEXT DEFAULT 'New',
          assigned_to TEXT DEFAULT 'Kritika S.',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Admins table (FR-03) - passwords stored as bcrypt hashes only
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reviews table (Feedback & Ratings)
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          role TEXT,
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating SQLite tables:', err.message);
          return reject(err);
        }
        console.log('SQLite tables verified/created successfully.');
        resolve();
      });
    });
  });
}

// Run a SELECT and return all matching rows.
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Run an INSERT/UPDATE/DELETE and return affected metadata.
function execute(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
}

// Run a SELECT and return the first row (or null).
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

module.exports = {
  initDb,
  query,
  execute,
  getOne,
  getDbType: () => 'sqlite'
};
