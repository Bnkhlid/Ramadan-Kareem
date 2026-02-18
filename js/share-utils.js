/**
 * Share Utils for Ramadan Karim Website
 * Handles Social Sharing (Text & Image) with multiple themes in Story Format (9:16).
 * Dependencies: SweetAlert2 (must be loaded in the page)
 */

var SHARE_CONFIG = {
    siteName: "رمضان كريم",
    siteUrl: window.location ? window.location.host : "ramadan-karim.net",
    font: "Amiri",
    watermarkText: "Developed by bnkhlid"
};

var THEMES = {
    night: {
        id: 'night',
        name: 'ليلي',
        bg: ['#0f172a', '#1e293b'], // Gradient Top->Bottom
        text: '#ffffff',
        accent: '#fbbf24', // Gold
        watermark: 'rgba(255, 255, 255, 0.5)'
    },
    green: {
        id: 'green',
        name: 'مسجدي',
        bg: ['#064e3b', '#065f46'], // Emerald/Green Dark
        text: '#ecfdf5',
        accent: '#34d399',
        watermark: 'rgba(236, 253, 245, 0.5)'
    },
    white: {
        id: 'white',
        name: 'أبيض',
        bg: ['#ffffff', '#f8fafc'],
        text: '#1e293b',
        accent: '#d97706', // Amber
        watermark: 'rgba(30, 41, 59, 0.5)'
    }
};

var currentTheme = 'night';
var currentShareText = '';
var currentShareSource = '';

/**
 * Main entry point to show share options
 * @param {string} text - The content to share (Verse, Hadith, etc.)
 * @param {string} source - The source/reference (e.g., "Surah Al-Baqarah: 255")
 */
async function showShareOptions(text, source) {
    currentShareText = text;
    currentShareSource = source;
    currentTheme = 'night'; // Reset to default

    // Initial Image Generation for Preview
    const imgBlob = await generateShareImageBlob(text, source, THEMES[currentTheme]);
    const imgUrl = URL.createObjectURL(imgBlob);

    const htmlContent = `
        <div class="flex flex-col gap-4">
            <!-- Preview Container -->
            <div class="relative group rounded-xl overflow-hidden border border-gray-600/30 shadow-xl bg-gray-900/50 flex justify-center items-center min-h-[300px]">
                <img id="sharePreviewImg" src="${imgUrl}" alt="Preview" class="max-w-full h-auto max-h-[400px] rounded-lg object-contain p-2" />
                <div id="previewLoader" class="absolute inset-0 flex items-center justify-center bg-black/50 hidden">
                    <div class="loader"></div>
                </div>
            </div>

            <!-- Theme Selector -->
            <div class="flex justify-center gap-3">
                ${Object.values(THEMES).map(theme => `
                    <button onclick="changeShareTheme('${theme.id}')" 
                            class="w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-ramadan-gold ${currentTheme === theme.id ? 'ring-2 ring-ramadan-gold scale-110 border-transparent' : 'border-gray-500 opacity-70 hover:opacity-100'}"
                            style="background: linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]});"
                            title="${theme.name}">
                        ${currentTheme === theme.id ? '<i class="fas fa-check text-white text-xs drop-shadow-md"></i>' : ''}
                    </button>
                `).join('')}
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-1 gap-3 mt-2">
                <div class="flex gap-2">
                    <button onclick="confirmShareImage()" class="flex-1 btn-share-action bg-ramadan-gold text-ramadan-dark font-bold py-3 px-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2">
                        <i class="fas fa-share-alt"></i> مشاركة
                    </button>
                    <button onclick="downloadImage()" class="flex-1 btn-share-action bg-ramadan-dark border border-ramadan-gold/40 text-ramadan-gold font-bold py-3 px-4 rounded-xl hover:bg-ramadan-gold/10 transition-all flex items-center justify-center gap-2">
                        <i class="fas fa-download"></i> حفظ
                    </button>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                     <button onclick="shareNativeText()" class="btn-share-action bg-white/10 text-white py-2 px-4 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm">
                        <i class="fas fa-quote-right"></i> مشاركة النص
                    </button>
                    <button onclick="copyToClipboard()" class="btn-share-action bg-white/10 text-white py-2 px-4 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm">
                        <i class="fas fa-copy"></i> نسخ النص
                    </button>
                </div>
            </div>
        </div>
    `;

    Swal.fire({
        title: '<span class="text-ramadan-gold font-amiri">مشاركة ستوري</span>',
        html: htmlContent,
        showConfirmButton: false,
        showCloseButton: true,
        background: '#0f172a',
        width: '450px',
        customClass: {
            popup: 'rounded-2xl border border-ramadan-gold/20 glass-effect',
            title: 'text-2xl',
            closeButton: 'text-gray-400 hover:text-white focus:outline-none'
        },
        didOpen: () => {
            // Re-bind theme buttons click events manually if needed or rely on onclick global
            window.changeShareTheme = updateTheme;
            window.confirmShareImage = processImageShare;
            window.downloadImage = processImageDownload;
            window.shareNativeText = processTextShare;
            window.copyToClipboard = copyToClipboard;
        }
    });
}

/**
 * Updates the theme and regenerates the preview
 */
async function updateTheme(themeId) {
    currentTheme = themeId;
    const loader = document.getElementById('previewLoader');
    const img = document.getElementById('sharePreviewImg');

    // Update theme button states
    const buttons = document.querySelectorAll('button[onclick^="changeShareTheme"]');
    buttons.forEach(btn => {
        const isTarget = btn.getAttribute('onclick').includes(`'${themeId}'`);
        if (isTarget) {
            btn.classList.add('ring-2', 'ring-ramadan-gold', 'scale-110', 'border-transparent');
            btn.classList.remove('border-gray-500', 'opacity-70');
            btn.innerHTML = '<i class="fas fa-check text-white text-xs drop-shadow-md"></i>';
        } else {
            btn.classList.remove('ring-2', 'ring-ramadan-gold', 'scale-110', 'border-transparent');
            btn.classList.add('border-gray-500', 'opacity-70');
            btn.innerHTML = '';
        }
    });

    if (loader && img) {
        loader.classList.remove('hidden');
        const theme = THEMES[themeId];
        const blob = await generateShareImageBlob(currentShareText, currentShareSource, theme);
        img.src = URL.createObjectURL(blob);
        img.onload = () => loader.classList.add('hidden');
    }
}

/**
 * Generates the image blob (Story Format 1080x1920)
 */
async function generateShareImageBlob(text, source, theme) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Story Dimensions
    const width = 1080;
    const minHeight = 1920;

    const padding = 120;
    const lineHeight = 2.2; // Increased for Arabic diacritics
    const fontSize = 52; // Slightly smaller to accommodate larger line height
    const footerHeight = 250;
    const headerHeight = 300; // Slightly smaller header to give more room to text

    // Font setup
    ctx.font = `bold ${fontSize}px "${SHARE_CONFIG.font}", serif`;

    // Measure Text & Calculate Height
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > width - (padding * 2) && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Dynamic Height calculation
    const textBlockHeight = lines.length * (fontSize * lineHeight);
    const contentTotalHeight = headerHeight + textBlockHeight + footerHeight + 100; // 100 spacer

    // If text is super long, extend canvas. Otherwise keep 1920 (Story standard).
    const height = Math.max(minHeight, contentTotalHeight);

    canvas.width = width;
    canvas.height = height;

    // Draw Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, theme.bg[0]);
    gradient.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw Decorative Pattern (Optional - Simple Circles/Stars)
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 80 + 20;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // -- Drawing Content --
    // We center everything vertically if it fits within minHeight
    // If it's taller, we start with padding
    let startY = (height - contentTotalHeight) / 2;
    if (startY < 50) startY = 50; // top padding minimum

    // 1. Header (Ramadan Karim)
    const logoY = startY + 150;
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 80px "${SHARE_CONFIG.font}", serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.fillText("رمضان كريم", width / 2, logoY);

    // 2. Quote Icon
    const quoteY = logoY + 120;
    ctx.font = '80px sans-serif'; // For standard quote
    ctx.fillStyle = theme.accent;
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.4;
    ctx.fillText("❝", width / 2, quoteY);
    ctx.globalAlpha = 1.0;

    // 3. Text Body
    const textStartY = quoteY + 60;
    ctx.fillStyle = theme.text;
    ctx.font = `bold ${fontSize}px "${SHARE_CONFIG.font}", serif`;
    // ctx.shadowColor = 'rgba(0,0,0,0.5)';
    // ctx.shadowBlur = 4;

    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), width / 2, textStartY + (i * fontSize * lineHeight));
    });

    // 4. Reference/Source
    const sourceY = textStartY + (lines.length * fontSize * lineHeight) + 40;
    ctx.fillStyle = theme.accent;
    ctx.font = `bold ${fontSize * 0.7}px "${SHARE_CONFIG.font}", serif`;
    ctx.fillText(source, width / 2, sourceY);

    // 5. Footer / Watermark
    const footerY = height - 80;
    ctx.fillStyle = theme.watermark;
    ctx.font = `500 30px sans-serif`;
    // Combine Developer Credit + Dynamic Domain
    const domain = window.location ? window.location.host : "ramadan-karim.net";
    const footerText = `${SHARE_CONFIG.watermarkText} | ${domain}`;
    ctx.fillText(footerText, width / 2, footerY);

    // Return Blob
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

/**
 * Generates a Quiz Result Card
 * @param {string} surahName - Name of the Surah
 * @param {number} score - Percentage score
 * @param {string} difficulty - Difficulty level text
 * @returns {Promise<Blob>}
 */
async function generateQuizCard(surahName, score, difficultyText) {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1920; // Changed to Story format to match other cards
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Load fonts
    await document.fonts.ready;

    // Theme Colors (Night Theme Standard)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Pattern Overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 60) {
        ctx.beginPath();
        ctx.arc(i, 0, i, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Border Frame
    const margin = 50;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 4;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner Frame
    const innerMargin = margin + 20;
    ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

    // Header Icon
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.font = '80px "Font Awesome 6 Free"';
    ctx.fillText('\uf5a2', width / 2, 350); // Award Icon

    // Title
    ctx.font = 'bold 70px "Amiri", sans-serif';
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("نتيجة اختبار الحفظ", width / 2, 500);

    // Surah Name
    ctx.font = '500 60px "Amiri", sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`سورة ${surahName}`, width / 2, 620);

    // Score Circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 250;

    // Glow
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 50;

    // Circle Background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(251, 191, 36, 0.05)";
    ctx.fill();

    // Circle Border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Score
    ctx.font = 'bold 200px sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(`${score}%`, centerX, centerY + 20);

    // Reset Baseline
    ctx.textBaseline = "alphabetic";

    // Difficulty
    ctx.font = '40px "Amiri", sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(`المستوى: ${difficultyText}`, centerX, centerY + 350);

    // Footer Layout
    const footerY = height - 150;

    // Decoration Line
    ctx.font = '40px sans-serif';
    ctx.fillStyle = "#fbbf24";
    ctx.globalAlpha = 0.6;
    ctx.fillText('ــــــــــــــــــــــــــــ   ✧   ــــــــــــــــــــــــــــ', width / 2, footerY - 60);

    // Footer Text
    ctx.font = '30px sans-serif';
    ctx.fillStyle = "#fbbf24";
    ctx.globalAlpha = 0.8;

    // Dynamic Watermark
    const domain = window.location ? window.location.host : "ramadan-karim.net";
    const footerText = `Developed by bnkhlid | ${domain}`;
    ctx.fillText(footerText, width / 2, footerY + 20);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

/**
 * Logic to share the image
 */
async function processImageShare() {
    try {
        const theme = THEMES[currentTheme];
        const blob = await generateShareImageBlob(currentShareText, currentShareSource, theme);
        const file = new File([blob], 'ramadan-story.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'رمضان كريم',
                text: `${currentShareText}\n\n${currentShareSource}\n${SHARE_CONFIG.siteUrl}`
            });
        } else {
            // Fallback: Download
            await processImageDownload();
        }
    } catch (error) {
        console.error("Error sharing image:", error);
        // Fallback
        await processImageDownload();
    }
}

/**
 * Logic to download the image
 */
async function processImageDownload() {
    try {
        const theme = THEMES[currentTheme];
        const blob = await generateShareImageBlob(currentShareText, currentShareSource, theme);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ramadan-karim-${Date.now()}.png`; // Unique name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        Swal.fire({
            icon: 'success',
            title: 'تم الحفظ',
            text: 'تم حفظ الصورة في جهازك',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            background: '#0f172a',
            color: '#fff'
        });
    } catch (e) {
        console.error(e);
        Swal.fire({ icon: 'error', title: 'عذراً', text: 'حدث خطأ أثناء تحميل الصورة' });
    }
}

function processTextShare() {
    const fullText = `${currentShareText}\n\n${currentShareSource}\n\n${SHARE_CONFIG.siteUrl}`;
    if (navigator.share) {
        navigator.share({
            title: 'رمضان كريم',
            text: fullText
        }).catch(err => console.log('Share canceled'));
    } else {
        copyToClipboard();
    }
}

function copyToClipboard() {
    const fullText = `${currentShareText}\n\n${currentShareSource}\n\n${SHARE_CONFIG.siteUrl}`;
    navigator.clipboard.writeText(fullText).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'تم النسخ',
            showConfirmButton: false,
            timer: 1000,
            toast: true,
            position: 'top-end',
            background: '#0f172a',
            color: '#fff'
        });
    });
}

/**
 * Setup Long Press detection for an element
 * @param {HTMLElement} element - The element to attach the listener to
 * @param {Function} callback - Function to call on long press
 */
function setupLongPress(element, callback) {
    let timer;
    const duration = 800; // ms

    const start = (e) => {
        if (e.type === 'click' && e.button !== 0) return; // Only left click
        timer = setTimeout(() => {
            callback(e);
        }, duration);
    };

    const end = () => {
        if (timer) clearTimeout(timer);
    };

    // Mouse
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', end);
    element.addEventListener('mouseleave', end);

    // Touch
    element.addEventListener('touchstart', (e) => {
        start(e);
    }, { passive: true });
    element.addEventListener('touchend', end);
    element.addEventListener('touchmove', end);

    // Prevent Context Menu on long press
    element.addEventListener('contextmenu', (e) => {
        if (timer) {
            // Let default behavior happen or block it if we want to force share only?
            // Usually long-press on mobile text brings up native copy.
            // We want our share menu.
            // e.preventDefault(); 
        }
    });
}
