/**
 * Logic for Sadaqah Jariyah Cards Designer
 * Minimalist Museum-Quality Redesign
 */

var currentTemplate = 'solemn';
var currentCategory = 'duas';
var currentItemId = 'd1';
var canvas, ctx;
var sadaqahData = null;

var SADAQAH_TEMPLATES = {
    solemn: {
        bg: ['#0f172a', '#020617'],
        accent: '#c5a059', // Matte Gold
        text: '#f8fafc',
        font: 'Amiri',
        icon: '🕋'
    },
    elegant: {
        bg: ['#064e3b', '#022c22'],
        accent: '#d4af37', // Traditional Gold
        text: '#f0fdf4',
        font: 'Amiri',
        icon: '🌙'
    },
    peaceful: {
        bg: ['#172554', '#080c1d'],
        accent: '#94a3b8', // Silver/Slate
        text: '#eff6ff',
        font: 'Tajawal',
        icon: '✨'
    }
};

async function initSadaqahDesigner() {
    canvas = document.getElementById('sadaqahCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    try {
        const response = await fetch('data/sadaqah_data.json');
        sadaqahData = await response.json();
        renderCategoryOptions('duas');
        updateSadaqahPreview();
    } catch (err) {
        console.error("Error loading Sadaqah data:", err);
    }
}

window.renderCategoryOptionsInJS = (category) => {
    currentCategory = category;
    const container = document.getElementById('contentOptions');
    const customContainer = document.getElementById('customTextContainer');
    if (!container || !sadaqahData) return;

    if (category === 'custom') {
        container.classList.add('hidden');
        customContainer.classList.remove('hidden');
    } else {
        container.classList.remove('hidden');
        customContainer.classList.add('hidden');

        const items = sadaqahData[category];
        container.innerHTML = items.map(item => `
            <button onclick="setSadaqahContent('${item.id}')" 
                id="item-${item.id}"
                class="content-btn text-right p-4 rounded-2xl bg-black/30 text-gray-400 hover:text-white border border-white/5 hover:border-ramadan-gold/30 transition-all text-sm leading-relaxed">
                ${item.text.length > 70 ? item.text.substring(0, 67) + '...' : item.text}
            </button>
        `).join('');

        // Highlight active
        setSadaqahContent(items[0].id);
    }
    updateSadaqahPreview();
};

function setSadaqahContent(itemId) {
    currentItemId = itemId;
    document.querySelectorAll('.content-btn').forEach(btn => {
        btn.classList.remove('bg-ramadan-gold', 'text-ramadan-dark', 'font-bold', 'border-ramadan-gold');
        btn.classList.add('bg-black/30', 'text-gray-400', 'border-white/5');
    });

    const activeBtn = document.getElementById(`item-${itemId}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-black/30', 'text-gray-400', 'border-white/5');
        activeBtn.classList.add('bg-ramadan-gold', 'text-ramadan-dark', 'font-bold', 'border-ramadan-gold');
    }
    updateSadaqahPreview();
}

function setSadaqahTemplate(templateId) {
    currentTemplate = templateId;
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-ramadan-gold');
    });
    const activeBtn = document.querySelector(`button[onclick="setSadaqahTemplate('${templateId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('ring-2', 'ring-ramadan-gold');
    }
    updateSadaqahPreview();
}

function updateSadaqahPreview() {
    if (!sadaqahData) return;
    const nameInput = document.getElementById('deceasedName').value;
    const name = nameInput || "اسم المتوفى";
    const gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';

    let content = "";
    if (currentCategory === 'custom') {
        content = document.getElementById('customSadaqahText').value || "اكتب هنا دعاءك أو خاطرتك لروح الفقيد...";
    } else {
        const item = sadaqahData[currentCategory].find(i => i.id === currentItemId);
        content = item ? item.text : "";
    }

    renderSadaqahCard(name, content, SADAQAH_TEMPLATES[currentTemplate], gender);
}

function drawCornerOrnament(x, y, size, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Draw an L-shaped elegant ornament
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    // Draw a small square at the intersection for depth
    ctx.fillStyle = color;
    ctx.fillRect(-5, -5, 10, 10);

    // Additional small detail lines
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sz = size * 0.4;
    ctx.moveTo(15, 15);
    ctx.lineTo(sz, sz);
    ctx.stroke();

    ctx.restore();
}

async function renderSadaqahCard(name, content, theme, gender = 'male') {
    const width = 1080;
    const height = 1920;

    ctx.clearRect(0, 0, width, height);

    // 1. Clean Solid/Gradient Background (NO STARS)
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, theme.bg[0]);
    grad.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Classical Ornamental Frame
    const margin = 80;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    // Outer thin line
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    // Inner thin line
    const innerMargin = margin + 20;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);
    ctx.globalAlpha = 1.0;

    // Corner Ornaments
    const ornSize = 100;
    drawCornerOrnament(margin, margin, ornSize, 0, theme.accent); // Top Left
    drawCornerOrnament(width - margin, margin, ornSize, Math.PI / 2, theme.accent); // Top Right
    drawCornerOrnament(width - margin, height - margin, ornSize, Math.PI, theme.accent); // Bottom Right
    drawCornerOrnament(margin, height - margin, ornSize, -Math.PI / 2, theme.accent); // Bottom Left

    ctx.textAlign = 'center';

    // 3. Header - Minimalist
    ctx.font = `600 60px "${theme.font}"`;
    ctx.fillStyle = theme.accent;
    ctx.letterSpacing = "2px"; // Note: letterSpacing is not a standard CanvasRenderingContext2D property.
    ctx.fillText("صَدَقَة جَارِيَة", width / 2, 350);

    // 4. Focal Point: Deceased Name
    const prefix = gender === 'male' ? "عن روح المغفور له بإذن الله" : "عن روح المغفور لها بإذن الله";
    ctx.font = `bold 65px "${theme.font}"`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(prefix, width / 2, 550);

    // Background plate for name (Very subtle)
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(width / 2 - 450, 620, 900, 200);
    ctx.globalAlpha = 1.0;

    ctx.font = `bold 140px "${theme.font}"`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(name, width / 2, 760);

    // 5. Main Religious Content
    // Use smaller font for Peaceful (blue) template or if text is long
    const isPeaceful = theme.accent === '#94a3b8';
    const baseFontSize = isPeaceful ? 55 : 70;
    ctx.font = `500 ${baseFontSize}px "${theme.font}"`;
    ctx.fillStyle = theme.text;

    const wrapText = (text, maxWidth) => {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const w = ctx.measureText(currentLine + " " + word).width;
            if (w < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const lines = wrapText(content, 850);
    // Increased line height to preventing overlapping (was 90/110)
    const lineHeight = isPeaceful ? 110 : 130;
    const startY = 1050;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });

    // 6. Minimalist Footer
    const footerY = height - 250;
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.6;

    // Decoration Line
    ctx.font = '40px sans-serif';
    ctx.fillText('ــــــــــــــــــــــــــــ   ✧   ــــــــــــــــــــــــــــ', width / 2, footerY - 60);

    // Developer Credit
    ctx.font = '38px sans-serif';
    ctx.fillText('Developed by bnkhlid', width / 2, footerY + 10);

    // Website Link (Smaller font for mobile compatibility)
    ctx.font = '32px sans-serif';
    ctx.globalAlpha = 0.5;
    const domain = window.location ? window.location.host : "ramadan-karim.net";
    ctx.fillText(domain, width / 2, footerY + 55);

    // Removed the duplicate "Developed by bnkhlid" that was here
}

function downloadSadaqahCard() {
    if (!canvas) return;
    canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `sadaqah-jariyah-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        Swal.fire({
            icon: 'success',
            title: 'تم التحميل',
            text: 'تم حفظ البطاقة بنجاح',
            timer: 2000,
            showConfirmButton: false,
            background: '#0f172a',
            color: '#fff'
        });
    });
}

function shareSadaqahCard() {
    if (!canvas) return;
    canvas.toBlob(async blob => {
        const file = new File([blob], 'sadaqah-card.png', { type: 'image/png' });
        const name = document.getElementById('deceasedName').value || "صدقة جارية";

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'صدقة جارية',
                    text: `صدقة جارية عن روح الفقيد ${name}. تقبل الله منا ومنكم.`
                });
            } catch (err) {
                console.log('Share closed');
            }
        } else {
            downloadSadaqahCard();
        }
    });
}
