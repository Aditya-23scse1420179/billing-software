-- ============================================================
--  Billing Software – SQLite Schema
--  Run once to initialise: sqlite3 bills.db < schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS bills (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  bill_no       TEXT     NOT NULL UNIQUE,
  customer_name TEXT     NOT NULL,
  phone         TEXT     NOT NULL,
  cosmetic_raw  REAL     NOT NULL DEFAULT 0,
  cosmetic_tax  REAL     NOT NULL DEFAULT 0,
  grocery_raw   REAL     NOT NULL DEFAULT 0,
  grocery_tax   REAL     NOT NULL DEFAULT 0,
  drink_raw     REAL     NOT NULL DEFAULT 0,
  drink_tax     REAL     NOT NULL DEFAULT 0,
  grand_total   REAL     NOT NULL DEFAULT 0,
  bill_text     TEXT     NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast look-ups by bill number
CREATE INDEX IF NOT EXISTS idx_bills_bill_no ON bills (bill_no);
