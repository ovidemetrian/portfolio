// PORTFOLOID service worker — bump VERSION when you change files
const VERSION = 'ovi-portfolio-v10';
const SHELL = ['./', 'index.html', 'manifest.json', 'llms.txt', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Hands off other apps that live under this folder (e.g. bliss/): they have their own worker.
  // Without this, a weak signal could answer another app's icon with the portfolio page.
  const url = new URL(e.request.url);
  if (url.origin === location.origin && !url.pathname.startsWith(new URL('./', location).pathname)) return;
  if (url.pathname.startsWith(new URL('./bliss/', location).pathname)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
