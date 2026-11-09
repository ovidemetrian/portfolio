// Ovi portfolio service worker — bump VERSION when you change files
const VERSION = 'ovi-portfolio-v7';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  'card.jpg', 'room-1.jpg', 'room-2.jpg', 'room-3.jpg', 'room-4.jpg', 'room-5.jpg', 'ggi-room.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
