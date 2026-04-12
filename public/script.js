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

  saveBillPrompt(billText);
}

// ── API base URL (same origin when served by Express) ─────────
const API = '/api/bills';

// ── Save bill  →  POST /api/bills ─────────────────────────────
function saveBillPrompt(billText) {
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
        bill_text:     billText
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
  document.getElementById('c-bill-no').value = randBill();
  refreshBillHeader();
}

// ── Print bill ────────────────────────────────────────────────
function printBill() {
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
