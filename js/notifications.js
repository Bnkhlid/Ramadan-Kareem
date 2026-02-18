// Notifications Module for Ramadan App

var notificationPermission = 'default';
var prayerTimes = null;
var adhkarList = [];
var hadithList = [];

// Content Lists
var meaningfulVerses = [
    { text: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", source: "الشرح: 5" },
    { text: "إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ", source: "البقرة: 153" },
    { text: "وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ", source: "غافر: 60" },
    { text: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", source: "الرعد: 28" },
    { text: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهو حَسْبُهُۥ", source: "الطلاق: 3" },
    { text: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", source: "إبراهيم: 7" },
    { text: "وَٱللَّهُ يُحِبُّ ٱلْمُحْسِنِينَ", source: "آل عمران: 134" },
    { text: "قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُواْ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُواْ مِن رَّحْمَةِ ٱللَّهِ", source: "الزمر: 53" },
    { text: "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ", source: "البقرة: 186" },
    { text: "إِنَّ ٱلْحَسَنَٰتِ يُذْهِبْنَ ٱلسَّيِّـَٔاتِ", source: "هود: 114" }
];

var dailyTasks = [
    "تصدق اليوم ولو بالقليل",
    "اتصل بقريب لك لم تكلمه منذ فترة",
    "اقرأ صفحة من القرآن الكريم",
    "استغفر الله 100 مرة",
    "صل ركعتي الضحى",
    "أطعم مسكيناً أو سقِ طائراً",
    "ابتسم في وجه أخيك",
    "زر مريضاً إن استطعت",
    "قل كلمة طيبة لمن حولك",
    "رطب لسانك بذكر الله",
    "ساعد محتاجاً اليوم",
    "ادع لوالديك بالرحمة والمغفرة"
];

// Initialize notifications
async function initNotifications() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    notificationPermission = Notification.permission;

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    // Load content
    await loadContentData();

    if (notificationPermission === 'granted') {
        startNotificationScheduling();
    }

    return true;
}

async function loadContentData() {
    try {
        // Load Adhkar
        const adkarRes = await fetch('data/adkar.json?v=v_spa_fixed_v15');
        adhkarList = await adkarRes.json();
    } catch (e) { console.error('Error loading adkar', e); }

    try {
        // Load Hadith (using smaller dummy list if big file fails or takes too long, but try fetching)
        const hadithResponse = await fetch('data/bukhari.json');
        const hadithJson = await hadithResponse.json();
        const data = hadithJson.hadiths || hadithJson; // Handle both array and object {hadiths: []}

        if (Array.isArray(data)) {
            data.forEach(h => {
                if (h.text && h.text.length < 200) {
                    hadithList.push({ text: h.text, source: "صحيح البخاري" });
                }
            });
        }
    } catch (e) {
        console.error('Error loading hadith, utilizing backup', e);
        hadithList = [
            { text: "الدين النصيحة", source: "حديث شريف" },
            { text: "من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه", source: "متفق عليه" },
            { text: "الكلمة الطيبة صدقة", source: "متفق عليه" }
        ];
    }
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;

    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;

        if (permission === 'granted') {
            showNotification('تم تفعيل الإشعارات', 'سنرسل لك تذكيرات بمواقيت الصلاة وفوائد يومية', 'welcome', '/index.html');
            startNotificationScheduling();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error requesting permission:', error);
        return false;
    }
}

function showNotification(title, body, tag = 'ramadan', url = '/index.html') {
    if (notificationPermission !== 'granted') return;

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body: body,
                icon: 'images/icon-192.png?v=v_spa_fixed_v15',
                badge: 'images/icon-192.png?v=v_spa_fixed_v15',
                vibrate: [200, 100, 200],
                tag: tag,
                data: { url: url },
                dir: 'rtl',
                lang: 'ar'
            });
        });
    } else {
        new Notification(title, {
            body: body,
            icon: '/images/icon-192.png?v=1',
            tag: tag,
            dir: 'rtl',
            lang: 'ar'
        });
    }
}

async function fetchPrayerTimesForNotifications() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await getPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        }, () => {
            getPrayerTimes(30.0444, 31.2357); // Valid Cairo Fallback
        });
    } else {
        getPrayerTimes(30.0444, 31.2357);
    }
}

async function getPrayerTimes(lat, lng) {
    try {
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1000);
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=5`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200) {
            prayerTimes = data.data.timings;
            schedulePrayerNotifications();
        }
    } catch (e) { console.error(e); }
}

function schedulePrayerNotifications() {
    if (!prayerTimes) return;

    const prayers = [
        { name: 'الفجر', time: prayerTimes.Fajr, icon: '🌅' },
        { name: 'الظهر', time: prayerTimes.Dhuhr, icon: '☀️' },
        { name: 'العصر', time: prayerTimes.Asr, icon: '🌤️' },
        { name: 'المغرب', time: prayerTimes.Maghrib, icon: '🌆' },
        { name: 'العشاء', time: prayerTimes.Isha, icon: '🌙' }
    ];

    const now = new Date();
    prayers.forEach(p => {
        const [h, m] = p.time.split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);

        if (pDate > now) {
            setTimeout(() => {
                showNotification(`حان وقت ${p.name}`, `حي على الصلاة، حي على الفلاح`, `prayer-${p.name}`, '/prayer.html');
            }, pDate - now);
        }
    });
}

function scheduleRandomReminders() {
    // Check every hour
    setInterval(() => {
        const now = new Date();
        if (now.getHours() >= 9 && now.getHours() <= 22) { // Only between 9 AM and 10 PM
            // 20% chance every hour to send a notification (approx 2-3 times a day)
            if (Math.random() < 0.2) {
                sendRandomNotification();
            }
        }
    }, 60 * 60 * 1000);
}

function sendRandomNotification() {
    const types = ['verse', 'hadith', 'dhikr', 'task'];
    const type = types[Math.floor(Math.random() * types.length)];

    let title = '';
    let body = '';
    let url = '/index.html';

    switch (type) {
        case 'verse':
            const v = meaningfulVerses[Math.floor(Math.random() * meaningfulVerses.length)];
            title = '📖 آية قرآنية';
            body = `${v.text} (${v.source})`;
            url = '/quran.html';
            break;
        case 'hadith':
            if (hadithList.length > 0) {
                const h = hadithList[Math.floor(Math.random() * hadithList.length)];
                title = '🕌 حديث نبوي';
                body = h.text.substring(0, 100) + (h.text.length > 100 ? '...' : '');
                url = '/hadith.html';
            }
            break;
        case 'dhikr':
            if (adhkarList.length > 0) {
                const d = adhkarList[Math.floor(Math.random() * adhkarList.length)];
                title = '📿 ذكر';
                body = d.content || d.text || 'سبحان الله';
                url = '/adhkar.html';
            }
            break;
        case 'task':
            title = '🌟 مهمة اليوم';
            body = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
            url = '/tracker.html';
            break;
    }

    if (title && body) {
        showNotification(title, body, `daily-${Date.now()}`, url);
    }
}

function startNotificationScheduling() {
    fetchPrayerTimesForNotifications();
    scheduleRandomReminders();

    // Refresh times daily
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 12:01 AM
    setTimeout(() => {
        fetchPrayerTimesForNotifications();
        setInterval(fetchPrayerTimesForNotifications, 24 * 60 * 60 * 1000);
    }, tomorrow - now);
}

function areNotificationsEnabled() {
    return notificationPermission === 'granted';
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initNotifications, requestNotificationPermission, showNotification, areNotificationsEnabled };
}
