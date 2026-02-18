const CACHE_NAME = "ramadan-v28";
const urlsToCache = [
  "/",
  "/index.html",
  "/quran.html",
  "/prayer.html",
  "/tracker.html",
  "/adhkar.html",
  "/names.html",
  "/quiz.html",
  "/tafsir.html",
  "/bookmarks.html",
  "/hadith.html",
  "/reciters.html",
  "/radio.html",
  "/tasbih.html",
  "/verse.html",
  "/cards.html",
  "/zakat.html",
  "/khatma.html",
  "/moshaf.html",
  "/seerah.html",
  "/sadaqah.html",
  "/share.html",
  "/css/style.css?v=v_spa_fixed_v19",
  "/js/main.js?v=v_spa_fixed_v19",
  "/js/notifications.js?v=v_spa_fixed_v19",
  "/js/share-utils.js?v=v_spa_fixed_v19",
  "/data/adkar.json",
  "/data/Allah-99-names.json",
  "/data/seerah.json",
  "/data/prophets.json",
  "/data/sahaba.json",
  "/data/bukhari.json",
  "/data/muslim.json",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache ramadan-v28");
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass for streaming and external APIs
  if (
    url.hostname.includes("radiojar.com") ||
    url.hostname.includes("qurango.net") ||
    url.hostname.includes("mp3quran.net") ||
    url.hostname.includes("api.aladhan.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    return;
  }

  const isJson = url.pathname.endsWith(".json");
  const isAppShell =
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css");

  if (isJson) {
    // Network-First for JSON data: always get fresh data, fallback to cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const cloned = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cloned));
          return networkResponse;
        })
        .catch(() => caches.match(event.request)),
    );
  } else if (isAppShell) {
    // Network-First for HTML/JS/CSS: always get fresh, fallback to cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const cloned = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cloned));
          return networkResponse;
        })
        .catch(() => caches.match(event.request)),
    );
  } else {
    // Cache-First with Network Fallback for images/fonts etc.
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request)),
    );
  }
});

// Push notification event (unchanged)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "رمضان كريم";
  const options = {
    body: data.body || "تذكير من تطبيق رمضان",
    icon: "/images/icon-192.png?v=1",
    badge: "/images/icon-192.png?v=1",
    vibrate: [200, 100, 200],
    tag: data.tag || "ramadan-notification",
    data: { url: data.url || "/index.html" },
    dir: "rtl",
    lang: "ar",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event (unchanged)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || "/index.html";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && "focus" in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      }),
  );
});
