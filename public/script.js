// ── Prices (Rs.) ──────────────────────────────────────────────
const PRICES = {
  // Cosmetics
  soap: 40, face_cream: 120, face_wash: 60,
  spray: 180, gel: 140, lotion: 180,
  // Grocery
  rice: 40, food_oil: 120, daal: 60,
  wheat: 180, sugar: 140, tea: 180,
  // Cold Drinks
  maza: 60, coke: 60, thumsup: 50,
  limca: 45, pepsi: 45, sprite: 60
};

const COSMETICS   = ['soap','face_cream','face_wash','spray','gel','lotion'];
const GROCERY     = ['rice','food_oil','daal','wheat','sugar','tea'];
const COLD_DRINKS = ['maza','coke','thumsup','limca','pepsi','sprite'];

const LABELS = {
  soap:'Bath Soap', face_cream:'Face Cream', face_wash:'Face Wash',
  spray:'Hair Spray', gel:'Hair Gel', lotion:'Body Lotion',
  rice:'Rice', food_oil:'Food Oil', daal:'Daal',
  wheat:'Wheat', sugar:'Sugar', tea:'Tea',
  maza:'Maza', coke:'Coke', thumsup:'Thumbs Up',
  limca:'Limca', pepsi:'Pepsi', sprite:'Sprite'
};

// Computed totals (set by calcTotal, used by generateBill)
let computed = null;

// Invoice id returned by the server after saving (used by printBill)
let currentInvoiceId = null;

// ── Bill number ───────────────────────────────────────────────
function randBill() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
document.getElementById('c-bill-no').value = randBill();

// ── Welcome message ───────────────────────────────────────────
function welcomeMsg() {
  const billNo = document.getElementById('c-bill-no').value;
  const name   = document.getElementById('c-name').value;
  const phone  = document.getElementById('c-phone').value;
  return [
    '\tWelcome Webcode Retail',
    '',
    ` Bill Number : ${billNo}`,
    ` Customer Name : ${name}`,
    ` Phone Number  : ${phone}`,
    '='.repeat(55),
    ` Products\t\t\tQTY\t\tPrice`,
    '='.repeat(55)
  ].join('\n');
}

function refreshBillHeader() {
  const ta = document.getElementById('bill-area');
  ta.value = welcomeMsg();
}
refreshBillHeader();

// ── Quantity helpers ──────────────────────────────────────────
function qty(id) { return Math.max(0, parseInt(document.getElementById(id).value) || 0); }

// ── Calculate totals ──────────────────────────────────────────
function calcTotal() {
  const cosmeticRaw = COSMETICS.reduce((s, id) => s + qty(id) * PRICES[id], 0);
  const groceryRaw  = GROCERY.reduce((s, id) => s + qty(id) * PRICES[id], 0);
  const drinkRaw    = COLD_DRINKS.reduce((s, id) => s + qty(id) * PRICES[id], 0);

  const cosmeticTax = Math.round(cosmeticRaw * 0.05 * 100) / 100;
  const groceryTax  = Math.round(groceryRaw  * 0.10 * 100) / 100;
  const drinkTax    = Math.round(drinkRaw    * 0.05 * 100) / 100;

  const grandTotal  = cosmeticRaw + groceryRaw + drinkRaw + cosmeticTax + groceryTax + drinkTax;

  document.getElementById('cosmetic-price').value = 'Rs. ' + cosmeticRaw.toFixed(2);
  document.getElementById('cosmetic-tax').value   = 'Rs. ' + cosmeticTax.toFixed(2);
  document.getElementById('grocery-price').value  = 'Rs. ' + groceryRaw.toFixed(2);
  document.getElementById('grocery-tax').value    = 'Rs. ' + groceryTax.toFixed(2);
  document.getElementById('drink-price').value    = 'Rs. ' + drinkRaw.toFixed(2);
  document.getElementById('drink-tax').value      = 'Rs. ' + drinkTax.toFixed(2);

  computed = { cosmeticRaw, groceryRaw, drinkRaw, cosmeticTax, groceryTax, drinkTax, grandTotal };
}

// ── Generate bill ─────────────────────────────────────────────
function generateBill() {
  const name  = document.getElementById('c-name').value.trim();
  const phone = document.getElementById('c-phone').value.trim();
  if (!name || !phone) {
    showAlert('Error', 'Customer Name and Phone Number are required.');
    return;
  }
  if (!computed) {
    showAlert('Error', 'Please click "Total" first to calculate prices.');
    return;
  }

  let lines = [welcomeMsg()];

  function addItems(ids) {
    ids.forEach(id => {
      const q = qty(id);
      if (q > 0) {
        const total = q * PRICES[id];
        lines.push(` ${LABELS[id].padEnd(18)}\t${q}\t\tRs. ${total}`);
      }
    });
  }

  addItems(COSMETICS);
  addItems(GROCERY);
  addItems(COLD_DRINKS);

  lines.push('-'.repeat(55));
  if (computed.cosmeticTax > 0) lines.push(` Cosmetic Tax (5%)\t\t\tRs. ${computed.cosmeticTax.toFixed(2)}`);
  if (computed.groceryTax  > 0) lines.push(` Grocery Tax (10%)\t\t\tRs. ${computed.groceryTax.toFixed(2)}`);
  if (computed.drinkTax    > 0) lines.push(` Cold-Drink Tax (5%)\t\t\tRs. ${computed.drinkTax.toFixed(2)}`);
  lines.push('-'.repeat(55));
  lines.push(` Total Bill :\t\t\t\tRs. ${computed.grandTotal.toFixed(2)}`);
  lines.push('-'.repeat(55));

  const billText = lines.join('\n');
  document.getElementById('bill-area').value = billText;

  // Build itemised list for normalised DB storage
  const billItems = [];
  [...COSMETICS, ...GROCERY, ...COLD_DRINKS].forEach(id => {
    const q = qty(id);
    if (q > 0) {
      const taxRate   = GROCERY.includes(id) ? 10 : 5;
      const unitPrice = PRICES[id];
      const lineRaw   = q * unitPrice;
      const lineTax   = Math.round(lineRaw * (taxRate / 100) * 100) / 100;
      billItems.push({
        sku:        id,
        name:       LABELS[id],
        qty:        q,
        unit_price: unitPrice,
        tax_rate:   taxRate,
        line_total: lineRaw + lineTax
      });
    }
  });

  saveBillPrompt(billText, billItems);
}

// ── API base URL (same origin when served by Express) ─────────
const API = '/api/bills';

// ── Save bill  →  POST /api/bills ─────────────────────────────
function saveBillPrompt(billText, billItems) {
  const billNo = document.getElementById('c-bill-no').value;
  const name   = document.getElementById('c-name').value.trim();
  const phone  = document.getElementById('c-phone').value.trim();

  showConfirm('Save Bill', 'Do you want to save this bill to the database?', async () => {
    try {
      const payload = {
        bill_no:       billNo,
        customer_name: name,
        phone,
        cosmetic_raw:  computed ? computed.cosmeticRaw : 0,
        cosmetic_tax:  computed ? computed.cosmeticTax : 0,
        grocery_raw:   computed ? computed.groceryRaw  : 0,
        grocery_tax:   computed ? computed.groceryTax  : 0,
        drink_raw:     computed ? computed.drinkRaw    : 0,
        drink_tax:     computed ? computed.drinkTax    : 0,
        grand_total:   computed ? computed.grandTotal  : 0,
        bill_text:     billText,
        items:         billItems || []
      };

      const res = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert('Error', data.error || 'Could not save bill.');
        return;
      }

      // Store invoice_id so printBill can render a proper HTML invoice
      currentInvoiceId = data.invoice_id || null;

      // Also trigger .txt download
      const blob = new Blob([billText], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Bill_${billNo}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);

      showAlert('Saved', `Bill No. ${billNo} saved to database successfully.`);
    } catch (err) {
      showAlert('Error', 'Network error – could not reach the server.');
      console.error(err);
    }
  });
}

// ── Find bill  →  GET /api/bills/:billNo ──────────────────────
async function findBill() {
  const search = document.getElementById('search-bill').value.trim();
  if (!search) {
    showAlert('Error', 'Please enter a bill number to search.');
    return;
  }
  try {
    const res  = await fetch(`${API}/${encodeURIComponent(search)}`);
    const data = await res.json();
    if (!res.ok) {
      showAlert('Error', data.error || `Bill "${search}" not found.`);
      return;
    }
    document.getElementById('bill-area').value = data.bill_text;
    currentInvoiceId = null; // text-only display; clear invoice reference
  } catch (err) {
    showAlert('Error', 'Network error – could not reach the server.');
    console.error(err);
  }
}

// ── All Bills  →  GET /api/bills ──────────────────────────────
async function showAllBills() {
  try {
    const res   = await fetch(API);
    const bills = await res.json();

    if (!bills.length) {
      showAlert('All Bills', 'No bills have been saved yet.');
      return;
    }

    let rows = bills.map(b =>
      `  #${b.id}  |  Bill ${b.bill_no}  |  ${b.customer_name}  |  ` +
      `Ph: ${b.phone}  |  Rs. ${Number(b.grand_total).toFixed(2)}  |  ${b.created_at}`
    ).join('\n');

    document.getElementById('bill-area').value =
      '='.repeat(55) + '\n All Saved Bills\n' + '='.repeat(55) + '\n' + rows;
    currentInvoiceId = null;
  } catch (err) {
    showAlert('Error', 'Network error – could not reach the server.');
    console.error(err);
  }
}

// ── Clear data ────────────────────────────────────────────────
function confirmClear() {
  showConfirm('Clear', 'Do you really want to clear all data?', clearData);
}

function clearData() {
  [...COSMETICS, ...GROCERY, ...COLD_DRINKS].forEach(id => {
    document.getElementById(id).value = 0;
  });
  document.getElementById('c-name').value   = '';
  document.getElementById('c-phone').value  = '';
  document.getElementById('search-bill').value = '';
  document.getElementById('cosmetic-price').value = '';
  document.getElementById('cosmetic-tax').value   = '';
  document.getElementById('grocery-price').value  = '';
  document.getElementById('grocery-tax').value    = '';
  document.getElementById('drink-price').value    = '';
  document.getElementById('drink-tax').value      = '';
  computed = null;
  currentInvoiceId = null;
  document.getElementById('c-bill-no').value = randBill();
  refreshBillHeader();
}

// ── Print bill ────────────────────────────────────────────────
async function printBill() {
  // If we have a saved invoice, render a proper HTML invoice
  if (currentInvoiceId) {
    try {
      const res  = await fetch(`/api/invoices/${currentInvoiceId}`);
      const data = await res.json();
      if (res.ok) {
        openInvoicePrintWindow(data);
        return;
      }
    } catch (_) { /* fall through to text print */ }
  }

  // Fallback: text-based print (pre-save or search result)
  const content = document.getElementById('bill-area').value;
  if (!content.trim()) {
    showAlert('Info', 'No bill content to print.');
    return;
  }
  const win = window.open('', '_blank', 'width=600,height=700');
  win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:20px;">${content}</pre>`);
  win.document.close();
  win.print();
}

// ── HTML invoice print window ─────────────────────────────────
function openInvoicePrintWindow({ invoice, customer, items, payments }) {
  const itemRows = items.map(it => `
    <tr>
      <td>${it.description || ''}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">Rs.&nbsp;${Number(it.unit_price).toFixed(2)}</td>
      <td style="text-align:right">${it.tax_rate}%</td>
      <td style="text-align:right">Rs.&nbsp;${Number(it.line_total).toFixed(2)}</td>
    </tr>`).join('');

  const paymentNote = payments.length
    ? `<p><strong>Payments received:</strong> ${
        payments.map(p => `Rs.&nbsp;${Number(p.amount).toFixed(2)} via ${p.method}`).join('; ')
      }</p>`
    : '';

  const discountRow = Number(invoice.discount) > 0
    ? `<div>Discount: &minus;Rs.&nbsp;${Number(invoice.discount).toFixed(2)}</div>`
    : '';

  const html = `<!DOCTYPE html><html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invoice.invoice_number}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;margin:40px;color:#333;max-width:700px}
    h1{text-align:center;margin-bottom:4px}
    .subtitle{text-align:center;color:#777;margin-top:0;margin-bottom:24px}
    .meta{display:flex;justify-content:space-between;margin:20px 0;gap:20px}
    .meta div{flex:1}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{background:#f0f0f0;padding:8px 10px;text-align:left;border-bottom:2px solid #ccc}
    td{padding:7px 10px;border-bottom:1px solid #eee}
    .totals{margin-top:12px;text-align:right;line-height:1.8}
    .grand{font-size:1.15em;font-weight:bold;border-top:2px solid #333;padding-top:4px;margin-top:4px}
    .payments{margin-top:20px;font-size:0.95em;color:#555}
    @media print{body{margin:10px}}
  </style>
</head>
<body>
  <h1>&#x1F9FE; Webcode Retail</h1>
  <p class="subtitle">Invoice Receipt</p>
  <div class="meta">
    <div>
      <strong>Invoice No:</strong> ${invoice.invoice_number}<br>
      <strong>Date:</strong> ${invoice.invoice_date}<br>
      <strong>Status:</strong> ${invoice.status}
    </div>
    <div style="text-align:right">
      <strong>Customer:</strong> ${customer.name}<br>
      <strong>Phone:</strong> ${customer.phone}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:right">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Tax</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <div>Subtotal: Rs.&nbsp;${Number(invoice.subtotal).toFixed(2)}</div>
    <div>Tax: Rs.&nbsp;${Number(invoice.tax).toFixed(2)}</div>
    ${discountRow}
    <div class="grand">Grand Total: Rs.&nbsp;${Number(invoice.total).toFixed(2)}</div>
  </div>
  <div class="payments">${paymentNote}</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=700,height=900');
  win.document.write(html);
  win.document.close();
  win.print();
}

// ── Modal helpers ─────────────────────────────────────────────
function showAlert(title, msg) {
  document.getElementById('alert-title').textContent = title;
  document.getElementById('alert-msg').textContent   = msg;
  document.getElementById('alert-modal').classList.add('active');
}

function showConfirm(title, msg, onYes) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  const modal = document.getElementById('confirm-modal');
  modal.classList.add('active');
  const yesBtn = document.getElementById('confirm-yes');
  const newBtn = yesBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newBtn, yesBtn);
  newBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    onYes();
  });
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('active'); });
});
