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

// ── Prepared statements – bills (legacy flat store) ───────────
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

// ── Prepared statements – normalised tables ───────────────────
const stmtFindCustomerByPhone = db.prepare('SELECT * FROM customer WHERE phone = ?');
const stmtInsertCustomer      = db.prepare(
  'INSERT INTO customer (name, phone, email, address) VALUES (@name, @phone, @email, @address)'
);
const stmtAllCustomers        = db.prepare('SELECT * FROM customer ORDER BY created_at DESC');

const stmtInsertProduct = db.prepare(
  'INSERT OR IGNORE INTO product (name, sku, price, tax_rate, stock_qty) VALUES (@name, @sku, @price, @tax_rate, @stock_qty)'
);
const stmtAddProduct    = db.prepare(
  'INSERT INTO product (name, sku, price, tax_rate, stock_qty) VALUES (@name, @sku, @price, @tax_rate, @stock_qty)'
);
const stmtFindProductBySku = db.prepare('SELECT * FROM product WHERE sku = ?');
const stmtAllProducts      = db.prepare('SELECT * FROM product ORDER BY name');

const stmtInsertInvoice = db.prepare(`
  INSERT INTO invoice (invoice_number, customer_id, invoice_date, subtotal, tax, discount, total, status)
  VALUES (@invoice_number, @customer_id, DATE('now'), @subtotal, @tax, @discount, @total, @status)
`);
const stmtGetInvoice    = db.prepare('SELECT * FROM invoice WHERE id = ?');
const stmtAllInvoices   = db.prepare(`
  SELECT i.*, c.name AS customer_name, c.phone
  FROM   invoice i
  JOIN   customer c ON c.id = i.customer_id
  ORDER  BY i.created_at DESC
`);

const stmtInsertInvoiceItem = db.prepare(`
  INSERT INTO invoice_item (invoice_id, product_id, description, qty, unit_price, tax_rate, line_total)
  VALUES (@invoice_id, @product_id, @description, @qty, @unit_price, @tax_rate, @line_total)
`);
const stmtGetInvoiceItems = db.prepare('SELECT * FROM invoice_item WHERE invoice_id = ?');

const stmtInsertPayment = db.prepare(`
  INSERT INTO payment (invoice_id, amount, method, paid_at, reference, notes)
  VALUES (@invoice_id, @amount, @method, CURRENT_TIMESTAMP, @reference, @notes)
`);
const stmtGetPayments   = db.prepare('SELECT * FROM payment WHERE invoice_id = ? ORDER BY paid_at');
const stmtGetCustomer   = db.prepare('SELECT * FROM customer WHERE id = ?');

// ── Seed default product catalogue (idempotent) ───────────────
const PRODUCT_SEED = [
  // Cosmetics – 5 % tax
  { name: 'Bath Soap',   sku: 'soap',       price: 40,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Face Cream',  sku: 'face_cream', price: 120, tax_rate: 5,  stock_qty: 100 },
  { name: 'Face Wash',   sku: 'face_wash',  price: 60,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Hair Spray',  sku: 'spray',      price: 180, tax_rate: 5,  stock_qty: 100 },
  { name: 'Hair Gel',    sku: 'gel',        price: 140, tax_rate: 5,  stock_qty: 100 },
  { name: 'Body Lotion', sku: 'lotion',     price: 180, tax_rate: 5,  stock_qty: 100 },
  // Grocery – 10 % tax
  { name: 'Rice',        sku: 'rice',       price: 40,  tax_rate: 10, stock_qty: 100 },
  { name: 'Food Oil',    sku: 'food_oil',   price: 120, tax_rate: 10, stock_qty: 100 },
  { name: 'Daal',        sku: 'daal',       price: 60,  tax_rate: 10, stock_qty: 100 },
  { name: 'Wheat',       sku: 'wheat',      price: 180, tax_rate: 10, stock_qty: 100 },
  { name: 'Sugar',       sku: 'sugar',      price: 140, tax_rate: 10, stock_qty: 100 },
  { name: 'Tea',         sku: 'tea',        price: 180, tax_rate: 10, stock_qty: 100 },
  // Cold Drinks – 5 % tax
  { name: 'Maza',        sku: 'maza',       price: 60,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Coke',        sku: 'coke',       price: 60,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Thumbs Up',   sku: 'thumsup',    price: 50,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Limca',       sku: 'limca',      price: 45,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Pepsi',       sku: 'pepsi',      price: 45,  tax_rate: 5,  stock_qty: 100 },
  { name: 'Sprite',      sku: 'sprite',     price: 60,  tax_rate: 5,  stock_qty: 100 },
];

db.transaction(() => {
  for (const p of PRODUCT_SEED) stmtInsertProduct.run(p);
})();

// ── Transaction: create normalised invoice from a saved bill ──
const createNormalizedInvoice = db.transaction((bill_no, customer_name, phone, items, subtotal, tax, grand_total) => {
  // Find or create customer
  let customer = stmtFindCustomerByPhone.get(phone);
  if (!customer) {
    const r = stmtInsertCustomer.run({ name: customer_name, phone, email: null, address: null });
    customer = { id: r.lastInsertRowid };
  }

  // Prevent duplicate invoices for the same bill_no
  const existing = db.prepare('SELECT id FROM invoice WHERE invoice_number = ?').get(bill_no);
  if (existing) return existing.id;

  // Create invoice
  const invResult = stmtInsertInvoice.run({
    invoice_number: bill_no,
    customer_id:    customer.id,
    subtotal,
    tax,
    discount:       0,
    total:          grand_total,
    status:         'unpaid'
  });
  const invoiceId = invResult.lastInsertRowid;

  // Create invoice items
  for (const item of items) {
    const product = item.sku ? stmtFindProductBySku.get(item.sku) : null;
    stmtInsertInvoiceItem.run({
      invoice_id:  invoiceId,
      product_id:  product ? product.id : null,
      description: item.name,
      qty:         item.qty,
      unit_price:  item.unit_price,
      tax_rate:    item.tax_rate,
      line_total:  item.line_total
    });
  }

  return invoiceId;
});

// ── Express app ───────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Serve static front-end files from the public/ directory only
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes – bills (legacy) ───────────────────────────────

/**
 * POST /api/bills
 * Body: { bill_no, customer_name, phone,
 *         cosmetic_raw, cosmetic_tax, grocery_raw, grocery_tax,
 *         drink_raw, drink_tax, grand_total, bill_text,
 *         items?: [{ sku, name, qty, unit_price, tax_rate, line_total }] }
 */
app.post('/api/bills', (req, res) => {
  const {
    bill_no, customer_name, phone,
    cosmetic_raw, cosmetic_tax,
    grocery_raw,  grocery_tax,
    drink_raw,    drink_tax,
    grand_total,  bill_text,
    items
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
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: `Bill number "${bill_no}" already exists.` });
    }
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }

  // Also persist to normalised tables when itemised data is provided
  let invoice_id = null;
  if (Array.isArray(items) && items.length > 0) {
    try {
      const subtotal  = (cosmetic_raw ?? 0) + (grocery_raw ?? 0) + (drink_raw ?? 0);
      const totalTax  = (cosmetic_tax ?? 0) + (grocery_tax ?? 0) + (drink_tax ?? 0);
      invoice_id = createNormalizedInvoice(
        bill_no, customer_name, phone,
        items, subtotal, totalTax, grand_total ?? 0
      );
    } catch (invErr) {
      console.error('Could not create normalised invoice:', invErr);
    }
  }

  return res.status(201).json({ success: true, bill_no, invoice_id });
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

// ── API routes – customers ────────────────────────────────────

/** GET /api/customers – list all customers */
app.get('/api/customers', (req, res) => {
  return res.json(stmtAllCustomers.all());
});

/** POST /api/customers – create a customer */
app.post('/api/customers', (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required.' });
  }
  try {
    const result = stmtInsertCustomer.run({ name, phone, email: email || null, address: address || null });
    return res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

// ── API routes – products ─────────────────────────────────────

/** GET /api/products – list all products */
app.get('/api/products', (req, res) => {
  return res.json(stmtAllProducts.all());
});

/** POST /api/products – create a product */
app.post('/api/products', (req, res) => {
  const { name, sku, price, tax_rate, stock_qty } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'name and price are required.' });
  }
  try {
    const result = stmtAddProduct.run({
      name,
      sku:       sku       || null,
      price,
      tax_rate:  tax_rate  ?? 0,
      stock_qty: stock_qty ?? 0
    });
    return res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: `SKU "${sku}" already exists.` });
    }
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

// ── API routes – invoices ─────────────────────────────────────

/** GET /api/invoices – list all invoices (with customer info) */
app.get('/api/invoices', (req, res) => {
  return res.json(stmtAllInvoices.all());
});

/**
 * GET /api/invoices/:id
 * Returns invoice with customer, line items and payments – used for printing.
 */
app.get('/api/invoices/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid invoice id.' });

  const invoice = stmtGetInvoice.get(id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

  const customer = stmtGetCustomer.get(invoice.customer_id);
  const items    = stmtGetInvoiceItems.all(id);
  const payments = stmtGetPayments.all(id);

  return res.json({ invoice, customer, items, payments });
});

/**
 * POST /api/invoices/:id/payments
 * Body: { amount, method?, reference?, notes? }
 */
app.post('/api/invoices/:id/payments', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid invoice id.' });

  const invoice = stmtGetInvoice.get(id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

  const { amount, method, reference, notes } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be greater than 0.' });
  }

  try {
    const result = stmtInsertPayment.run({
      invoice_id: id,
      amount:     Number(amount),
      method:     method    || 'cash',
      reference:  reference || null,
      notes:      notes     || null
    });
    return res.status(201).json({ success: true, payment_id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🧾  Billing Software running at http://localhost:${PORT}\n`);
});
