/* Service worker — çevrimdışı oynanabilirlik.
 *
 * Bu yalnız "hoş bir ekstra" değil: Apple 4.2 (Minimum Functionality) altında
 * en sık ret sebebi, uçak modunda beyaz ekran gösteren web sarmalayıcıları.
 * Uygulama kabuğu önbellekte olduğu için oyun ağ olmadan da tam çalışır.
 */
/* SHELL listesi ELLE TUTULMAZ — tools/build.js diskteki gerçek dosyalardan
   üretir. Elle tutulduğunda atlas asset'leri listeye girmemişti ve çevrimdışı
   ilk açılışta oyun prosedürel sanata düşüyordu. */
const CACHE = 'yaban-c3c2abd3';
/* ==SHELL-START== */
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/birds.json',
  './assets/birds.png',
  './assets/dog.json',
  './assets/dog.png',
  './assets/env.json',
  './assets/env.png',
  './icons/icon-1024.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];
/* ==SHELL-END== */

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())   // tek dosya eksikse kurulum yine de bitsin
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Önbellek öncelikli: oyun tek dosya, güncelleme yeni sürümde CACHE adıyla gelir.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
