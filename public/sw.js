const CACHE_NAME = 'pr-youth-v3';

// Install Event: Activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event: Clear old caches and claim clients instantly
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network First for Navigations to guarantee ZERO blank screens
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore API requests to Google Apps Script
  if (url.hostname.includes('script.google.com') || url.pathname.includes('/exec')) {
    return;
  }

  // HTML Page Navigation: Network First with graceful fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Static Assets (Images, CSS, JS): Cache First with background revalidation
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request);
    })
  );
});
