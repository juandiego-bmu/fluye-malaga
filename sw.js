// Red primero, caché de respaldo: siempre lo último y la app abre sin conexión.
// Solo ficheros propios: las teselas del mapa (tiles.openfreemap.org) y cualquier API externa nunca se cachean.
const C = 'fluye-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png'];  // el JS/CSS con hash se cachea al vuelo
if (location.hostname !== 'localhost') {  // dentro del APK (Capacitor sirve en https://localhost) no hace falta
  self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
  self.addEventListener('activate', e => e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
  self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(C).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request)));
  });
}
