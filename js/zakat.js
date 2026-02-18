/**
 * Logic for Zakat Calculator
 */

// Configuration Defaults (Editable by Developer)
const ZAKAT_DEFAULTS = {
    GOLD_PRICE_24K: 4000,    // Price per gram (24K) in Local Currency (e.g., EGP)
    FITR_PER_PERSON: 35,     // Zakat Fitr per person
    CURRENCY_SYMBOL: 'ج.م'   // Currency symbol display
};

// State
let currentTab = 'mal';

// Load values on init
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check LocalStorage for User Overrides or use Defaults
    const savedGold = localStorage.getItem('zakat_goldPrice');
    const savedFitr = localStorage.getItem('zakat_fitrPrice');

    const goldInput = document.getElementById('goldPrice');
    const fitrInput = document.getElementById('fitrPrice');

    if (goldInput) {
        goldInput.value = savedGold || ZAKAT_DEFAULTS.GOLD_PRICE_24K;
        // Add listener to save on change
        goldInput.addEventListener('change', (e) => {
            localStorage.setItem('zakat_goldPrice', e.target.value);
            calculateZakatMal();
        });
    }

    if (fitrInput) {
        fitrInput.value = savedFitr || ZAKAT_DEFAULTS.FITR_PER_PERSON;
        // Add listener to save on change
        fitrInput.addEventListener('change', (e) => {
            localStorage.setItem('zakat_fitrPrice', e.target.value);
            calculateZakatFitr();
        });
    }

    // 2. Initial Calc
    if (goldInput) calculateZakatMal();
    if (fitrInput) calculateZakatFitr();
});

function switchTab(tab) {
    currentTab = tab;

    // Toggle Tabs UI
    document.getElementById('tab-mal').className = tab === 'mal'
        ? 'flex-1 py-3 text-ramadan-gold border-b-2 border-ramadan-gold font-bold transition-all'
        : 'flex-1 py-3 text-gray-400 border-b-2 border-transparent hover:text-white transition-all';

    document.getElementById('tab-fitr').className = tab === 'fitr'
        ? 'flex-1 py-3 text-green-400 border-b-2 border-green-400 font-bold transition-all'
        : 'flex-1 py-3 text-gray-400 border-b-2 border-transparent hover:text-white transition-all';

    // Toggle Forms
    document.getElementById('zakat-mal-form').classList.toggle('hidden', tab !== 'mal');
    document.getElementById('zakat-fitr-form').classList.toggle('hidden', tab !== 'fitr');

    // Toggle Results
    document.getElementById('result-mal').classList.toggle('hidden', tab !== 'mal');
    document.getElementById('result-fitr').classList.toggle('hidden', tab !== 'fitr');
}

function formatCurrency(num) {
    return new Intl.NumberFormat('ar-EG').format(num);
}

function calculateZakatMal() {
    // Inputs
    const goldPrice = parseFloat(document.getElementById('goldPrice').value) || 0;
    const cash = parseFloat(document.getElementById('cashAmount').value) || 0;
    const invest = parseFloat(document.getElementById('investAmount').value) || 0;
    const goldSaved = parseFloat(document.getElementById('goldAmount').value) || 0; // This is Value directly? Or grams? 
    // Let's assume input is Value for simplicity, or we should ask for grams.
    // The placeholder says "Amount", usually implies value in form context combined with Cash. 
    // Wait, the label says "قيمة الذهب". So it is value.
    const debtsToYou = parseFloat(document.getElementById('debtsToYou').value) || 0;
    const debtsOnYou = parseFloat(document.getElementById('debtsOnYou').value) || 0;

    // Nisab = 85g gold 24k
    const nisab = goldPrice * 85;
    document.getElementById('nisabValue').innerText = formatCurrency(nisab);

    // Total Assets
    const totalAssets = cash + invest + goldSaved + debtsToYou;
    document.getElementById('totalAssets').innerText = formatCurrency(totalAssets);

    // Total Liabilities
    document.getElementById('totalLiabilities').innerText = formatCurrency(debtsOnYou);

    // Net Wealth
    const netWealth = totalAssets - debtsOnYou;
    document.getElementById('netWealth').innerText = formatCurrency(netWealth);

    // Check Nisab
    const statusDiv = document.getElementById('zakatStatus');
    const dueDiv = document.getElementById('zakatDue');

    if (netWealth >= nisab) {
        const zakat = netWealth * 0.025;
        statusDiv.className = "bg-green-900/30 p-3 rounded-lg text-center text-sm text-green-300 border border-green-500/30 mb-6";
        statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> بلغ النصاب ووجبت الزكاة`;
        dueDiv.innerText = formatCurrency(zakat.toFixed(2));
    } else {
        statusDiv.className = "bg-red-900/20 p-3 rounded-lg text-center text-sm text-red-300 border border-red-500/30 mb-6";
        statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> لم يبلغ النصاب (${formatCurrency(nisab)})`;
        dueDiv.innerText = "0";
    }
}

// Fitr Logic
let familyMembers = 1;

function adjustFamily(change) {
    familyMembers += change;
    if (familyMembers < 1) familyMembers = 1;
    document.getElementById('familyCount').value = familyMembers;
    calculateZakatFitr();
}

function calculateZakatFitr() {
    const price = parseFloat(document.getElementById('fitrPrice').value) || 0;
    const total = price * familyMembers;
    document.getElementById('fitrTotal').innerText = formatCurrency(total);
}
