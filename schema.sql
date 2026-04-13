-- ============================================================
--  Billing Software – SQLite Schema
--  Run once to initialise: sqlite3 bills.db < schema.sql
-- ============================================================

-- ── Legacy bills table (flat receipt store) ───────────────────
CREATE TABLE IF NOT EXISTS bills (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  bill_no       TEXT     NOT NULL UNIQUE,   -- e.g. "4721"
  customer_name TEXT     NOT NULL,
  phone         TEXT     NOT NULL,
  cosmetic_raw  REAL     NOT NULL DEFAULT 0,
  cosmetic_tax  REAL     NOT NULL DEFAULT 0,
  grocery_raw   REAL     NOT NULL DEFAULT 0,
  grocery_tax   REAL     NOT NULL DEFAULT 0,
  drink_raw     REAL     NOT NULL DEFAULT 0,
  drink_tax     REAL     NOT NULL DEFAULT 0,
  grand_total   REAL     NOT NULL DEFAULT 0,
  bill_text     TEXT     NOT NULL,          -- full formatted receipt
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast look-ups by bill number
CREATE INDEX IF NOT EXISTS idx_bills_bill_no ON bills (bill_no);

-- ── Normalised tables ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customer (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL,
  phone      TEXT     NOT NULL,
  email      TEXT,
  address    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL,
  sku        TEXT     UNIQUE,
  price      REAL     NOT NULL DEFAULT 0,
  tax_rate   REAL     NOT NULL DEFAULT 0,  -- percentage, e.g. 5 or 10
  stock_qty  INTEGER  NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice (
  id             INTEGER  PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT     NOT NULL UNIQUE,
  customer_id    INTEGER  NOT NULL REFERENCES customer(id),
  invoice_date   DATE     NOT NULL DEFAULT (DATE('now')),
  subtotal       REAL     NOT NULL DEFAULT 0,
  tax            REAL     NOT NULL DEFAULT 0,
  discount       REAL     NOT NULL DEFAULT 0,
  total          REAL     NOT NULL DEFAULT 0,
  status         TEXT     NOT NULL DEFAULT 'unpaid'
                          CHECK (status IN ('unpaid','paid','cancelled')),
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_number   ON invoice (invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_customer ON invoice (customer_id);

CREATE TABLE IF NOT EXISTS invoice_item (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  invoice_id  INTEGER  NOT NULL REFERENCES invoice(id),
  product_id  INTEGER  REFERENCES product(id),
  description TEXT,
  qty         REAL     NOT NULL DEFAULT 1,
  unit_price  REAL     NOT NULL DEFAULT 0,
  tax_rate    REAL     NOT NULL DEFAULT 0,
  line_total  REAL     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_item_invoice ON invoice_item (invoice_id);

CREATE TABLE IF NOT EXISTS payment (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER  NOT NULL REFERENCES invoice(id),
  amount     REAL     NOT NULL DEFAULT 0,
  method     TEXT     NOT NULL DEFAULT 'cash',
  paid_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reference  TEXT,
  notes      TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payment (invoice_id);
