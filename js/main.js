// PWA Install Logic
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Update UI to show install button if needed
  const installBtn = document.getElementById('installAppBtn');
  if (installBtn) installBtn.classList.remove('hidden');
});

async function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt = null;
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) installBtn.classList.add('hidden');
  }
}

function injectNav(activePage = 'home') {
  // Inject notifications script if not present
  if (!document.querySelector('script[src*="notifications.js"]')) {
    const script = document.createElement('script');
    script.src = 'js/notifications.js?v=v20';
    document.head.appendChild(script);

    // Auto init after load
    script.onload = () => {
      if (typeof initNotifications === 'function') initNotifications();
    };
  }

  const navHTML = `
    <nav class="fixed w-full z-40 bg-ramadan-dark/90 backdrop-blur-md border-b border-ramadan-gold/20" style="padding-top: env(safe-area-inset-top);">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3 group cursor-pointer" onclick="window.location.href='index.html'">
            <i class="fas fa-moon text-ramadan-gold text-2xl animate-float group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all"></i>
            <span class="text-xl md:text-2xl font-bold text-gray-100 font-amiri group-hover:text-ramadan-gold transition-colors">رمضان كريم</span>
          </div>
          
          <div class="hidden xl:flex items-center gap-2">
            ${generateDesktopLinks(activePage)}
          </div>
          
          <button class="xl:hidden text-ramadan-gold p-2 hover:bg-white/5 rounded-lg transition-colors" onclick="toggleMobileMenu()" aria-label="قائمة التنقل">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </div>
      
      <div id="mobileMenu" class="hidden xl:hidden bg-ramadan-dark border-t border-ramadan-gold/20 h-[80vh] overflow-y-auto custom-scrollbar">
        <div class="flex flex-col p-4 gap-2">
            ${generateMobileLinks(activePage)}
        </div>
      </div>
    </nav>`;

  document.getElementById('nav-placeholder').innerHTML = navHTML;

  // FORCE DARK THEME - Remove any dynamic theme classes
  const body = document.body;
  body.classList.remove('theme-morning', 'theme-afternoon', 'theme-sunset', 'theme-night');
}

function generateDesktopLinks(active) {
  const allLinks = [
    { id: 'home', href: 'index.html', text: 'الرئيسية', icon: 'fas fa-home' },
    { id: 'quran', href: 'quran.html', text: 'المصحف', icon: 'fas fa-quran' },
    { id: 'adhkar', href: 'adhkar.html', text: 'الأذكار', icon: 'fas fa-praying-hands' },
    { id: 'prayer', href: 'prayer.html', text: 'مواقيت الصلاة', icon: 'fas fa-clock' },
    { id: 'tracker', href: 'tracker.html', text: 'تتبع رمضان', icon: 'fas fa-calendar-check' },
    { id: 'radio', href: 'radio.html', text: 'الإذاعة', icon: 'fas fa-radio' },
    { id: 'sadaqah', href: 'sadaqah.html', text: 'صدقة جارية', icon: 'fas fa-hand-holding-heart' },
    { id: 'quiz', href: 'quiz.html', text: 'مساعد الحفظ', icon: 'fas fa-brain' },
    { id: 'reciters', href: 'reciters.html', text: 'القراء', icon: 'fas fa-microphone' },
    { id: 'bookmarks', href: 'bookmarks.html', text: 'المفضلة', icon: 'fas fa-heart' },
    { id: 'tafsir', href: 'tafsir.html', text: 'التفسير', icon: 'fas fa-book-open-reader' },
    { id: 'hadith', href: 'hadith.html', text: 'الأحاديث', icon: 'fas fa-book' },
    { id: 'seerah', href: 'seerah.html', text: 'السيرة والأنبياء', icon: 'fas fa-book-open' },
    { id: 'names', href: 'names.html', text: 'أسماء الله', icon: 'fas fa-star' },
    { id: 'tasbih', href: 'tasbih.html', text: 'السبحة', icon: 'fas fa-fingerprint' },
    { id: 'verse', href: 'verse.html', text: 'آية عشوائية', icon: 'fas fa-bolt' },
    { id: 'cards', href: 'cards.html', text: 'بطاقات', icon: 'fas fa-id-card' },
    { id: 'zakat', href: 'zakat.html', text: 'الزكاة', icon: 'fas fa-coins' },
    { id: 'khatma', href: 'khatma.html', text: 'الختمة', icon: 'fas fa-check-double' },
    { id: 'moshaf', href: 'moshaf.html', text: 'تحميل المصحف', icon: 'fas fa-download' },
    { id: 'share', href: 'share.html', text: 'نشر التطبيق', icon: 'fas fa-share-nodes' },
  ];

  const mainLinks = allLinks.slice(0, 7);
  const otherLinks = allLinks.slice(7);

  let html = mainLinks.map(link => {
    const isActive = active === link.id;
    const classes = isActive
      ? 'text-ramadan-dark bg-ramadan-gold px-4 py-1.5 rounded-full font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)]'
      : 'text-gray-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-full transition-all';

    return `<a href="${link.href}" class="${classes} text-[0.85rem] whitespace-nowrap flex items-center gap-1">
      <i class="${link.icon}"></i> ${link.text}
    </a>`;
  }).join('');

  // Add "More" Dropdown
  const isOtherActive = otherLinks.some(l => l.id === active);
  const moreBtnClasses = isOtherActive
    ? 'text-ramadan-dark bg-ramadan-gold px-4 py-1.5 rounded-full font-bold'
    : 'text-gray-300 hover:text-white hover:bg-white/5 px-4 py-1.5 rounded-full transition-all';

  html += `
    <div class="relative group">
      <button class="${moreBtnClasses} text-[0.85rem] flex items-center gap-2">
        <i class="fas fa-ellipsis-h"></i>
        <span>المزيد</span>
      </button>
      <div class="absolute top-full left-0 mt-2 w-56 bg-ramadan-dark/95 backdrop-blur-xl border border-ramadan-gold/20 rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl overflow-hidden scale-95 group-hover:scale-100 origin-top-left">
        <div class="max-h-[70vh] overflow-y-auto custom-scrollbar">
          ${otherLinks.map(link => `
            <a href="${link.href}" class="flex items-center gap-3 px-4 py-2.5 text-sm ${active === link.id ? 'text-ramadan-gold bg-white/5' : 'text-gray-300'} hover:bg-white/10 hover:text-white transition-colors">
              <i class="${link.icon} w-5 text-center opacity-70"></i>
              <span>${link.text}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return html;
}

function generateMobileLinks(active) {
  const links = [
    { id: 'home', href: 'index.html', text: 'الرئيسية', icon: 'fas fa-home' },
    { id: 'quran', href: 'quran.html', text: 'المصحف الكريم', icon: 'fas fa-quran' },
    { id: 'adhkar', href: 'adhkar.html', text: 'الأذكار اليومية', icon: 'fas fa-praying-hands' },
    { id: 'prayer', href: 'prayer.html', text: 'مواقيت الصلاة', icon: 'fas fa-clock' },
    { id: 'tracker', href: 'tracker.html', text: 'تتبع عبادتك', icon: 'fas fa-calendar-check' },
    { id: 'radio', href: 'radio.html', text: 'إذاعة القرآن', icon: 'fas fa-radio' },
    { id: 'sadaqah', href: 'sadaqah.html', text: 'صدقة جارية', icon: 'fas fa-hand-holding-heart' },
    { id: 'quiz', href: 'quiz.html', text: 'مساعد الحفظ', icon: 'fas fa-brain' },
    { id: 'reciters', href: 'reciters.html', text: 'قراء القرآن', icon: 'fas fa-microphone' },
    { id: 'bookmarks', href: 'bookmarks.html', text: 'المفضلة', icon: 'fas fa-heart' },
    { id: 'tafsir', href: 'tafsir.html', text: 'تفسير القرآن', icon: 'fas fa-book-open-reader' },
    { id: 'hadith', href: 'hadith.html', text: 'الأحاديث النبوية', icon: 'fas fa-clapperboard' },
    { id: 'seerah', href: 'seerah.html', text: 'السيرة والأنبياء والصحابة', icon: 'fas fa-book-open' },
    { id: 'names', href: 'names.html', text: 'أسماء الله الحسنى', icon: 'fas fa-star' },
    { id: 'tasbih', href: 'tasbih.html', text: 'السبحة الإلكترونية', icon: 'fas fa-fingerprint' },
    { id: 'verse', href: 'verse.html', text: 'آية عشوائية', icon: 'fas fa-bolt' },
    { id: 'cards', href: 'cards.html', text: 'بطاقات التهنئة', icon: 'fas fa-id-card' },
    { id: 'zakat', href: 'zakat.html', text: 'حاسبة الزكاة', icon: 'fas fa-coins' },
    { id: 'khatma', href: 'khatma.html', text: 'الختمة الجماعية', icon: 'fas fa-check-double' },
    { id: 'moshaf', href: 'moshaf.html', text: 'تحميل المصحف', icon: 'fas fa-download' },
    { id: 'share', href: 'share.html', text: 'نشر التطبيق', icon: 'fas fa-share-nodes' },
  ];

  const linkHTML = links.map(link => {
    const isActive = active === link.id;
    const classes = isActive
      ? 'bg-ramadan-gold text-ramadan-dark font-bold'
      : 'text-gray-300 hover:bg-white/5 hover:text-white';

    return `<a href="${link.href}" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${classes}">
      <i class="${link.icon} w-6 text-center"></i>
      <span>${link.text}</span>
    </a>`;
  }).join('');

  // Add Install Button (Hidden by default, shown via JS)
  return linkHTML + `
    <button id="installAppBtn" onclick="installPWA()" class="hidden w-full text-right px-4 py-3 rounded-lg text-ramadan-gold hover:bg-white/5 transition-all font-bold border-t border-ramadan-gold/10 mt-2">
      <i class="fas fa-download ml-2"></i> تثبيت التطبيق
    </button>
  `;
}



function injectFooter() {
  const footerHTML = `
    <footer class="bg-ramadan-dark border-t border-ramadan-gold/20 py-12 relative overflow-hidden mt-20">
      <div class="absolute inset-0 stars opacity-30"></div>
      <div class="container mx-auto px-4 relative z-10">
        <div class="text-center">
          <div class="flex justify-center items-center gap-3 mb-6">
            <i class="fas fa-moon text-ramadan-gold text-2xl md:text-3xl"></i>
            <span class="text-2xl md:text-3xl font-bold text-ramadan-gold font-amiri">رمضان كريم</span>
          </div>
          <p class="text-gray-400 mb-6 text-sm md:text-base">تقبل الله صيامكم وقيامكم</p>
          <div class="mb-6 py-4 border-t border-b border-white/10 inline-block px-4 md:px-8">
            <p class="text-ramadan-gold font-bold text-base md:text-lg">
              <i class="fas fa-code ml-2"></i> Developed by <span class="text-xl md:text-2xl mx-2">bnkhlid</span>
            </p>
          </div>

          <div class="border-t border-white/10 pt-8 text-xs md:text-sm text-gray-500">

            <div class="flex justify-center gap-6 mb-8">
              <a href="https://www.facebook.com/mhmd.khald.555303" target="_blank" class="text-gray-400 hover:text-[#1877F2] transition-colors text-2xl transform hover:scale-110">
                  <i class="fab fa-facebook"></i>
              </a>
              <a href="https://www.tiktok.com/@zerocodex_?_r=1&_t=ZS-93d1dh1dsIc" target="_blank" class="text-gray-400 hover:text-[#ff0050] transition-colors text-2xl transform hover:scale-110">
                  <i class="fab fa-tiktok"></i>
              </a>
              <a href="https://instagram.com/bnkhlid_" target="_blank" class="text-gray-400 hover:text-[#E4405F] transition-colors text-2xl transform hover:scale-110">
                  <i class="fab fa-instagram"></i>
              </a>
            </div>
            <p>© 2026 رمضان كريم - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>`;

  document.getElementById('footer-placeholder').innerHTML = footerHTML;
}

function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("hidden");
}

// Common Tailwind Config
tailwind.config = {
  theme: {
    extend: {
      colors: {
        "ramadan-dark": "#0f172a",
        "ramadan-blue": "#1e3a8a",
        "ramadan-gold": "#fbbf24",
        "ramadan-gold-light": "#fcd34d",
        "ramadan-purple": "#7c3aed",
        "ramadan-emerald": "#059669",
        "ramadan-teal": "#14b8a6",
      },
      fontFamily: {
        amiri: ["Amiri", "serif"],
        tajawal: ["Tajawal", "sans-serif"],
        quran: ["Scheherazade New", "serif"],
      },
    },
  },
};

function normalizeArabic(text) {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove tashkeel
    .replace(/[أإآ]/g, "ا") // Normalize Alif
    .replace(/ة/g, "ه") // Normalize Teh Marbuta
    .replace(/ى/g, "ي") // Normalize Alif Maksura
    .trim();
}

/**
 * Log a user activity locally
 * @param {string} icon - FontAwesome icon class
 * @param {string} text - Description of activity
 * @param {string} category - Activity category (e.g., 'الأذكار')
 */
function addActivity(icon, text, category) {
  try {
    const activities = JSON.parse(localStorage.getItem('ramadan_activities') || '[]');
    const newActivity = {
      id: Date.now(),
      icon,
      text,
      category,
      timestamp: new Date().toISOString()
    };

    // Add to start of list
    activities.unshift(newActivity);

    // Keep only last 50
    if (activities.length > 50) {
      activities.pop();
    }

    localStorage.setItem('ramadan_activities', JSON.stringify(activities));

    // Dispatch custom event so other pages can react if needed
    window.dispatchEvent(new CustomEvent('activityAdded', { detail: newActivity }));
  } catch (error) {
    console.warn("Could not log activity:", error);
  }
}

/**
 * LEGENDARY UPDATE: PERSISTENT AUDIO & SPA CORE
 */

// 1. Persistent Player Manager
window.persistentPlayer = {
  audio: new Audio(),
  currentTrack: null, // { title, subtitle, icon, category, src }
  isPlaying: false,

  init() {
    this.audio.preload = "auto";
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUI();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUI();
    });
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updateUI();
    });

    this.injectUI();
  },

  play(track) {
    if (this.currentTrack?.src === track.src) {
      if (this.audio.paused) this.audio.play();
      return;
    }

    this.currentTrack = track;
    this.audio.src = track.src;
    this.audio.load();
    this.audio.play().catch(e => console.log("Playback error:", e));
    this.showUI();
    this.updateUI();
  },

  pause() {
    this.audio.pause();
  },

  toggle() {
    if (this.audio.paused) this.audio.play();
    else this.audio.pause();
  },

  seek(pct) {
    if (this.audio.duration) {
      this.audio.currentTime = this.audio.duration * pct;
    }
  },

  injectUI() {
    if (document.getElementById('global-mini-player')) return;

    const playerHTML = `
      <div id="global-mini-player" class="fixed bottom-0 left-0 right-0 z-50 transform translate-y-full transition-transform duration-500 ease-out">
        <div class="bg-ramadan-dark/95 backdrop-blur-xl border-t border-ramadan-gold/30 px-4 py-3 md:py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div class="container mx-auto flex items-center gap-4">
            <!-- Info -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ramadan-gold/20 flex items-center justify-center flex-shrink-0 border border-ramadan-gold/30">
                <i id="mini-player-icon" class="fas fa-microphone text-ramadan-gold text-sm md:text-base"></i>
              </div>
              <div class="min-w-0">
                <h5 id="mini-player-title" class="text-white text-sm md:text-base font-bold truncate">جاري التشغيل...</h5>
                <p id="mini-player-subtitle" class="text-gray-400 text-xs truncate">تلاوات قرآنية</p>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-3 md:gap-5">
              <button onclick="window.persistentPlayer.toggle()" class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ramadan-gold text-ramadan-dark flex items-center justify-center hover:scale-105 transition-transform">
                <i id="mini-player-play-icon" class="fas fa-play"></i>
              </button>
              <button onclick="window.persistentPlayer.hideUI()" class="text-gray-500 hover:text-white transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <!-- Progress -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-white/5 cursor-pointer" onclick="window.persistentPlayer.handleSeek(event)">
            <div id="mini-player-progress" class="h-full bg-ramadan-gold transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', playerHTML);
  },

  showUI() {
    const el = document.getElementById('global-mini-player');
    if (el) el.classList.remove('translate-y-full');
  },

  hideUI() {
    const el = document.getElementById('global-mini-player');
    if (el) el.classList.add('translate-y-full');
    this.pause();
  },

  updateUI() {
    if (!this.currentTrack) return;
    document.getElementById('mini-player-title').textContent = this.currentTrack.title;
    document.getElementById('mini-player-subtitle').textContent = this.currentTrack.subtitle;
    document.getElementById('mini-player-icon').className = this.currentTrack.icon;
    document.getElementById('mini-player-play-icon').className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';

    // Sync with page-specific UI if exists (e.g., Radio or Reciters buttons)
    window.dispatchEvent(new CustomEvent('persistentAudioStateChange', {
      detail: { isPlaying: this.isPlaying, track: this.currentTrack }
    }));
  },

  updateProgress() {
    if (!this.audio.duration) return;
    const pct = (this.audio.currentTime / this.audio.duration) * 100;
    const progress = document.getElementById('mini-player-progress');
    if (progress) progress.style.width = pct + '%';
  },

  handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    this.seek(pct);
  }
};

// 2. SPA Core Manager
window.spaCore = {
  contentId: 'page-content-wrapper',
  isLoading: false,

  init() {
    // 1. Better link hijacking with delegation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link || !link.href) return;

      const url = new URL(link.href, window.location.origin);

      // Only hijack internal HTML links
      const isInternal = url.origin === window.location.origin;
      const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/') || !url.pathname.includes('.');
      const isSpecial = link.hash || link.target === '_blank' || link.hasAttribute('download');

      if (isInternal && isHTML && !isSpecial) {
        e.preventDefault();
        this.navigateTo(link.href);
      }
    });

    window.addEventListener('popstate', () => {
      this.loadPage(window.location.href, false);
    });

    this.ensureWrapper();
  },

  ensureWrapper() {
    const placeholder = document.getElementById('nav-placeholder');
    const footer = document.getElementById('footer-placeholder');
    if (placeholder && footer && !document.getElementById(this.contentId)) {
      console.log("SPA: Creating dynamic wrapper");
      const wrapper = document.createElement('div');
      wrapper.id = this.contentId;
      let node = placeholder.nextSibling;
      while (node && node !== footer) {
        let next = node.nextSibling;
        wrapper.appendChild(node);
        node = next;
      }
      placeholder.parentNode.insertBefore(wrapper, footer);
    }
  },

  async navigateTo(url) {
    if (url === window.location.href) return;
    if (this.isLoading) return;
    return this.loadPage(url, true);
  },

  async loadPage(url, push = true) {
    console.log("SPA: Starting load...", url);
    this.isLoading = true;
    if (typeof NProgress !== 'undefined') NProgress.start();

    // Create a timeout to avoid getting stuck
    const timeout = setTimeout(() => {
      console.warn("SPA: Load timed out, forcing hard reload");
      window.location.href = url;
    }, 5000);

    try {
      const response = await fetch(url);
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // 1. Update Title & Meta
      document.title = newDoc.title;

      // 2. Swapping Content
      let currentWrapper = document.getElementById(this.contentId);
      if (!currentWrapper) {
        this.ensureWrapper();
        currentWrapper = document.getElementById(this.contentId);
      }

      if (!currentWrapper) {
        window.location.href = url;
        return;
      }

      const newWrapper = newDoc.getElementById(this.contentId);
      if (newWrapper) {
        // Fire unload event BEFORE replacing content so pages can cleanup (e.g. stop mic)
        window.dispatchEvent(new Event('spaPageUnload'));
        currentWrapper.innerHTML = newWrapper.innerHTML;
      } else {
        // Fallback content extraction
        const temp = document.createElement('div');
        window.dispatchEvent(new Event('spaPageUnload'));
        newDoc.body.querySelectorAll('nav, footer, #nav-placeholder, #footer-placeholder').forEach(el => el.remove());
        currentWrapper.innerHTML = newDoc.body.innerHTML;
      }

      // 3. Re-execute Scripts
      await this.executeScripts(newDoc);

      // 4. Update Nav
      const activeId = this.detectActivePage(url);
      injectNav(activeId);
      injectFooter();

      // 5. Cleanup & State
      window.scrollTo(0, 0);
      if (push) history.pushState(null, '', url);
      if (typeof NProgress !== 'undefined') NProgress.done();

      this.isLoading = false;
      window.dispatchEvent(new Event('spaPageLoaded'));
      console.log("SPA: Load complete");

    } catch (e) {
      console.error("SPA Critical Error:", e);
      clearTimeout(timeout);
      // DEFINTIVE FALLBACK: If anything goes wrong, just do a normal link click
      window.location.href = url;
    }
  },

  detectActivePage(url) {
    const path = url.split('/').pop().split('?')[0];
    if (!path || path === 'index.html') return 'home';
    return path.replace('.html', '');
  },

  async executeScripts(newDoc) {
    document.querySelectorAll('script[data-page-script]').forEach(s => s.remove());

    const originalAddEventListener = document.addEventListener;
    document.addEventListener = function (type, listener, options) {
      if (type === 'DOMContentLoaded') {
        // Use setTimeout to ensure the rest of the script block (declarations) executes first
        setTimeout(() => {
          try { listener(); } catch (e) { console.error("SPA: DOMContentLoaded error", e); }
        }, 1);
      } else {
        originalAddEventListener.call(document, type, listener, options);
      }
    };

    const scripts = Array.from(newDoc.querySelectorAll('script'));
    for (const oldScript of scripts) {
      const src = oldScript.getAttribute('src');
      if (src && (
        src.includes('main.js') ||
        src.includes('tailwindcss') ||
        src.includes('font-awesome') ||
        src.includes('nprogress') ||
        src.includes('sweetalert') ||
        src.includes('share-utils.js') ||
        src.includes('notifications.js')
      )) continue;

      try {
        await new Promise((resolve) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.innerHTML = oldScript.innerHTML;
          newScript.setAttribute('data-page-script', 'true');

          if (newScript.src) {
            newScript.onload = resolve;
            newScript.onerror = resolve; // Continue on error
            document.body.appendChild(newScript);
          } else {
            document.body.appendChild(newScript);
            resolve();
          }
        });
      } catch (err) {
        console.warn("SPA: Script failed", err);
      }
    }
    document.addEventListener = originalAddEventListener;
  }
};

// Initialize both
document.addEventListener('DOMContentLoaded', () => {
  window.persistentPlayer.init();
  window.spaCore.init();
});


