'use strict';

// Set a cache version using the current timestamp
const CACHE_VERSION = 'v1.0.0-' + Date.now();
const CACHE_NAME = `my-app-cache-${CACHE_VERSION}`;

// Files to cache
const urlsToCache = [
  '/index.html',
  '/styles.css',
  '/script.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache: ', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache control header for HTML files
        if (event.request.destination === 'document') {
          const headers = new Headers();
          headers.append('Cache-Control', 'no-cache');
          return new Response(response.body, { headers });
        }
        return response || fetch(event.request);
      })
  );
});
