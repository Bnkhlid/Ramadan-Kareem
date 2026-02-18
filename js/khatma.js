/**
 * Logic for Community Khatma
 * Simulates a global counter and tracks local user progress.
 */

// Base count (e.g., started from 1500)
const BASE_COUNT = 1520;
// Simulate increments based on time (approx 1 khatma every few minutes globally)
const START_DATE = new Date('2024-03-01T00:00:00').getTime();

function initKhatma() {
    renderJuzGrid();
    updateGlobalCounter();
    setInterval(updateGlobalCounter, 10000); // Check every 10s
    loadUserProgress();
}

/**
 * Simulates a live global counter
 * Since we don't have a backend, we use a time-based algorithm + random variance
 */
function updateGlobalCounter() {
    const now = Date.now();
    // Logic: (Hours passed since start) * (Avg khatmas per hour ~ 50) 
    // This is just a simulation for the user
    // Assume start date is Ramadan start or recent. Let's base it on daily progress.

    // Simple simulation: Base + (Minutes since page load? No, inconsistent)
    // Let's use Date based.
    // Hours since Jan 1 2024 (Just as an anchor)
    const hoursDiff = (now - 1704067200000) / (1000 * 60 * 60);
    const simulatedCount = Math.floor(BASE_COUNT + (hoursDiff * 2.5)); // 2.5 khatmas per hour globally check

    // Add local user submission effect (stored in localStorage global offset)
    const userGlobalContrib = parseInt(localStorage.getItem('userTotalContrib') || '0');

    const element = document.getElementById('globalKhatmaCount');
    animateValue(element, parseInt(element.innerText.replace(/,/g, '')), simulatedCount + userGlobalContrib, 2000);
}

function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * User Progress Logic
 */
function renderJuzGrid() {
    const grid = document.getElementById('juzGrid');
    grid.innerHTML = '';
    const readJuzs = JSON.parse(localStorage.getItem('myReadJuzs') || '[]');

    for (let i = 1; i <= 30; i++) {
        const div = document.createElement('div');
        const isRead = readJuzs.includes(i);
        div.className = `aspect-square rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${isRead ? 'bg-ramadan-gold text-ramadan-dark shadow-lg shadow-ramadan-gold/30' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`;
        div.innerText = i;
        div.onclick = () => toggleJuz(i);
        grid.appendChild(div);
    }
    document.getElementById('userJuzCount').innerText = readJuzs.length;
}

function toggleJuz(juzNum) {
    let readJuzs = JSON.parse(localStorage.getItem('myReadJuzs') || '[]');
    if (readJuzs.includes(juzNum)) {
        readJuzs = readJuzs.filter(j => j !== juzNum);
    } else {
        readJuzs.push(juzNum);
        triggerConfetti();
    }
    localStorage.setItem('myReadJuzs', JSON.stringify(readJuzs));
    renderJuzGrid();
}

function submitJuz() {
    // This button just meant to "Visualize" the act of submission for the user
    // In reality, clicking the grid toggles it. But this button can "Confirm" unsubmitted ones?
    // Let's make it simple: It adds a "contribution" to the simulated global counter locally.

    const readJuzs = JSON.parse(localStorage.getItem('myReadJuzs') || '[]');
    if (readJuzs.length === 0) {
        Swal.fire({ icon: 'info', title: 'تنبيه', text: 'حدد الأجزاء التي قرأتها من الجدول أولاً', background: '#0f172a', color: '#fff' });
        return;
    }

    // Fake submission effect
    const btn = document.querySelector('button[onclick="submitJuz()"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسليم...';

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> تم التسليم';
        btn.classList.replace('bg-ramadan-gold', 'bg-green-600');

        // Update user total contribution count (just for ego)
        let currentContrib = parseInt(localStorage.getItem('userTotalContrib') || '0');
        localStorage.setItem('userTotalContrib', currentContrib + 1); // Increment fake global

        updateGlobalCounter(); // Refresh to see number go up

        const msg = document.getElementById('submitMsg');
        msg.classList.remove('opacity-0');

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plus"></i> تسليم جزء آخر';
            btn.classList.replace('bg-green-600', 'bg-ramadan-gold');
            msg.classList.add('opacity-0');
        }, 3000);

    }, 1500);
}

function triggerConfetti() {
    // Simple confetti effect could be added here if canvas-confetti lib was loaded
    // Since we don't have it, we skip or use basic CSS animation logic if desired
    // For now, no-op
}

function loadUserProgress() {
    renderJuzGrid();
}
