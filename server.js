'use strict';

const path       = require('path');
const fs         = require('fs');
const express    = require('express');
const cors       = require('cors');
const Database   = require('better-sqlite3');

// ── Database setup ────────────────────────────────────────────
const DB_PATH     = path.join(__dirname, 'bills.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');   // better concurrent performance
db.pragma('foreign_keys = ON');

// Apply schema (idempotent – uses CREATE IF NOT EXISTS)
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// ── Prepared statements ───────────────────────────────────────
const stmtInsert = db.prepare(`
  INSERT INTO bills
    (bill_no, customer_name, phone,
     cosmetic_raw, cosmetic_tax,
     grocery_raw,  grocery_tax,
     drink_raw,    drink_tax,
     grand_total,  bill_text)
  VALUES
    (@bill_no, @customer_name, @phone,
     @cosmetic_raw, @cosmetic_tax,
     @grocery_raw,  @grocery_tax,
     @drink_raw,    @drink_tax,
     @grand_total,  @bill_text)
`);

const stmtFindByNo  = db.prepare('SELECT * FROM bills WHERE bill_no = ?');
const stmtAll       = db.prepare('SELECT id, bill_no, customer_name, phone, grand_total, created_at FROM bills ORDER BY created_at DESC');
const stmtDeleteAll = db.prepare('DELETE FROM bills');

// ── Express app ───────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Serve static front-end files from the project root
app.use(express.static(__dirname));

// ── API routes ────────────────────────────────────────────────

/**
 * POST /api/bills
 * Body: { bill_no, customer_name, phone,
 *         cosmetic_raw, cosmetic_tax, grocery_raw, grocery_tax,
 *         drink_raw, drink_tax, grand_total, bill_text }
 */
app.post('/api/bills', (req, res) => {
  const {
    bill_no, customer_name, phone,
    cosmetic_raw, cosmetic_tax,
    grocery_raw,  grocery_tax,
    drink_raw,    drink_tax,
    grand_total,  bill_text
  } = req.body;

  if (!bill_no || !customer_name || !phone || !bill_text) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    stmtInsert.run({
      bill_no, customer_name, phone,
      cosmetic_raw: cosmetic_raw ?? 0,
      cosmetic_tax: cosmetic_tax ?? 0,
      grocery_raw:  grocery_raw  ?? 0,
      grocery_tax:  grocery_tax  ?? 0,
      drink_raw:    drink_raw    ?? 0,
      drink_tax:    drink_tax    ?? 0,
      grand_total:  grand_total  ?? 0,
      bill_text
    });
    return res.status(201).json({ success: true, bill_no });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: `Bill number "${bill_no}" already exists.` });
    }
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

/**
 * GET /api/bills/:billNo
 * Returns the full bill record for a given bill number.
 */
app.get('/api/bills/:billNo', (req, res) => {
  const bill = stmtFindByNo.get(req.params.billNo);
  if (!bill) {
    return res.status(404).json({ error: `Bill "${req.params.billNo}" not found.` });
  }
  return res.json(bill);
});

/**
 * GET /api/bills
 * Returns a summary list of all saved bills (no bill_text to keep payload small).
 */
app.get('/api/bills', (req, res) => {
  const bills = stmtAll.all();
  return res.json(bills);
});

/**
 * DELETE /api/bills
 * Wipes all saved bills (used by the "Clear All Saved Bills" action).
 */
app.delete('/api/bills', (req, res) => {
  stmtDeleteAll.run();
  return res.json({ success: true });
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🧾  Billing Software running at http://localhost:${PORT}\n`);
});
