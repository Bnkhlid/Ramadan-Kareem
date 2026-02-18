/**
 * Logic for Greeting Cards Designer
 * Uses HTML5 Canvas to render templates and text.
 */

var currentTemplate = 'lantern';
var canvas, ctx;
var logoImage = null; // We can load a logo image if needed

var CARD_TEMPLATES = {
    lantern: {
        bg: ['#0f172a', '#1e293b'],
        accent: '#fbbf24',
        text: '#ffffff',
        graphic: 'lantern',
        font: 'Amiri'
    },
    mosque: {
        bg: ['#064e3b', '#065f46'],
        accent: '#34d399',
        text: '#ecfdf5',
        graphic: 'mosque',
        font: 'Amiri'
    },
    modern: {
        bg: ['#ffffff', '#f1f5f9'],
        accent: '#4f46e5',
        text: '#1e293b',
        graphic: 'moon',
        font: 'Reem Kufi'
    }
};

function initCardDesigner() {
    canvas = document.getElementById('cardCanvas');
    ctx = canvas.getContext('2d');
    updateCardPreview();
}

function setCardTemplate(templateId) {
    currentTemplate = templateId;

    // Update UI Selection
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-ramadan-gold');
        btn.classList.add('border-gray-600');
    });

    // Find the button inside the onclick handler
    // (Simplification: re-query by onclick value match)
    const activeBtn = document.querySelector(`button[onclick="setCardTemplate('${templateId}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('border-gray-600');
        activeBtn.classList.add('ring-2', 'ring-ramadan-gold');
    }

    updateCardPreview();
}

function updateCardPreview() {
    const name = document.getElementById('userNameInput').value || "اكتب اسمك هنا";
    renderCard(name, CARD_TEMPLATES[currentTemplate]);
}

async function renderCard(name, theme) {
    const width = 1080;
    const height = 1920;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, theme.bg[0]);
    grad.addColorStop(1, theme.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Pattern / Noise
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = theme.text === '#ffffff' || theme.text === '#ecfdf5' ? '#ffffff' : '#000000';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 40 + 5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // -- Graphics --
    ctx.textAlign = 'center';

    // 1. Top Graphic (Center) - Simplified Shapes for now (Using text icons or basic drawing)
    ctx.save();
    if (theme.graphic === 'lantern') {
        // Draw simple lantern line
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, 300);
        ctx.stroke();

        ctx.fillStyle = theme.accent;
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 40;
        ctx.font = '250px serif';
        // Using emoji/unicode for simplicity in canvas without external assets
        // Or simple circle 
        ctx.beginPath();
        ctx.arc(width / 2, 400, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = theme.bg[0];
        ctx.shadowBlur = 0;
        ctx.font = '100px serif';
        ctx.fillText('☪', width / 2, 430);
    } else if (theme.graphic === 'mosque') {
        ctx.fillStyle = theme.accent;
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 30;
        ctx.font = '200px serif';
        ctx.fillText('🕌', width / 2, 450);
    } else {
        ctx.fillStyle = theme.accent;
        ctx.font = '200px serif';
        ctx.fillText('🌙', width / 2, 450);
    }
    ctx.restore();

    // 2. Main Title "Ramadan Karim"
    const titleY = 750;
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 120px "${theme.font}"`;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText("رمضان كريم", width / 2, titleY);

    // Subtitle
    ctx.font = `60px "${theme.font}"`;
    ctx.fillStyle = theme.text;
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.8;
    ctx.fillText("أعاد الله عليكم الشهر بالخير والبركات", width / 2, titleY + 160); // Increased spacing from 100 to 160
    ctx.globalAlpha = 1.0;

    // 3. "Congratulation From" Section
    const fromY = 1200; // Moved down to prevent overlap
    ctx.font = `50px "${theme.font}"`;
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.7;
    ctx.fillText("تهنئة خاصة من", width / 2, fromY);
    ctx.globalAlpha = 1.0;

    // 4. User Name (The Star)
    const nameY = fromY + 150;
    ctx.font = `bold 100px "${theme.font}"`;
    ctx.fillStyle = theme.accent;
    // Add glow
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 20;
    ctx.fillText(name, width / 2, nameY);
    ctx.shadowBlur = 0;

    // 5. Footer Layout (Matched to Sadaqah Style)
    const footerY = height - 150;

    // Decoration Line
    ctx.font = '40px sans-serif'; // Matched size
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.6;
    ctx.fillText('ــــــــــــــــــــــــــــ   ✧   ــــــــــــــــــــــــــــ', width / 2, footerY - 60);

    // Footer Text
    ctx.font = `30px sans-serif`;
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.8;

    // Dynamic Watermark
    const domain = window.location ? window.location.host : "ramadan-karim.net";
    const footerText = `Developed by bnkhlid | ${domain}`;
    ctx.fillText(footerText, width / 2, footerY + 20);
}

function downloadCard() {
    canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ramadan-card-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        Swal.fire({
            icon: 'success',
            title: 'تم التحميل',
            text: 'تم حفظ البطاقة في جهازك',
            timer: 2000,
            showConfirmButton: false,
            background: '#0f172a',
            color: '#fff'
        });
    });
}

function shareCard() {
    canvas.toBlob(async blob => {
        const file = new File([blob], 'ramadan-card.png', { type: 'image/png' });
        const name = document.getElementById('userNameInput').value;
        const text = `بطاقة تهنئة من: ${name || 'فاعل خير'}`;

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'تهنئة رمضان',
                    text: `${text}\n\nصمم بطاقتك من هنا: ramadan-karim.net`
                });
            } catch (err) {
                console.log('Share closed');
            }
        } else {
            downloadCard();
        }
    });
}
