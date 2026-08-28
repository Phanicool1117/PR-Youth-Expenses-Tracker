const CACHE_NAME = 'pr-youth-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/Favicon.png',
  '/Logo.png',
  '/manifest.json'
];

// Install Event: Cache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache First for Static Assets, Network First for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore Google Apps Script API calls (handled dynamically with SWR in app)
  if (url.hostname.includes('script.google.com') || url.pathname.includes('/exec')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately, fetch update in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* offline fallback */});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
