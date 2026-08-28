// Clean SW cleanup script to unregister any stale caches and restore direct Vercel CDN serving
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim()).then(() => self.registration.unregister())
  );
});
