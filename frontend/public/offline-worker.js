/* KisanGyan caches only app assets. Private API data is scoped in IndexedDB, never in this cache. */
const CACHE = 'kisangyan-shell-v3';
let dataSaver = false;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/', '/assets/farmer.jpg', '/assets/field-aerial.jpg'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('kisangyan-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'DATA_SAVER') { dataSaver = event.data.enabled; return; }
  if (event.data?.type !== 'CACHE_ASSETS') return;
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await Promise.allSettled(event.data.urls.filter(value => { const url = new URL(value); return url.origin === self.location.origin && !url.pathname.startsWith('/api') && !url.pathname.includes('hot-update'); }).map(async url => { const response = await fetch(url); if (response.ok) await cache.put(url, response); }));
    event.ports[0]?.postMessage({ ready: true });
  }));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api') || url.pathname.includes('hot-update') || url.pathname.includes('/ws')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put('/', copy)); } return response; }).catch(() => caches.match('/')));
  } else if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    const getAsset = () => fetch(request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(request, copy)); } return response; }).catch(() => caches.match(request));
    event.respondWith(dataSaver ? caches.match(request).then(cached => cached || getAsset()) : getAsset());
  }
});