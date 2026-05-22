// Service Worker — Gestión Operativa 1
// v23 — Auto-update agresivo
const CACHE_NAME = 'gop1-v23';
const CACHE_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event) {
  console.log('[SW] Install v23');
  // T23 FIX: NO esperar, activar nueva versión inmediatamente
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES).catch(function(err) {
        console.warn('[SW] Cache parcial:', err);
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activate v23');
  event.waitUntil(
    Promise.all([
      // Borrar caches viejos
      caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(k) {
          if (k !== CACHE_NAME) {
            console.log('[SW] Borrando cache viejo:', k);
            return caches.delete(k);
          }
        }));
      }),
      // Tomar control de todas las pestañas YA
      self.clients.claim()
    ])
  );
});

// Estrategia: NETWORK FIRST para HTML/JS (siempre intentar versión nueva)
// CACHE FIRST para imágenes (íconos)
self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  // Solo manejar requests del mismo origen
  if (!url.startsWith(self.location.origin)) return;
  // Skip POST/PUT etc
  if (event.request.method !== 'GET') return;

  // Network first para HTML/JS/JSON
  if (url.endsWith('.html') || url.endsWith('.js') || url.endsWith('.json') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then(function(res) {
        // Guardar copia fresca en cache
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(event.request, resClone); });
        return res;
      }).catch(function() {
        // Si no hay red, usar cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache first para íconos/imágenes
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(event.request, resClone); });
        return res;
      });
    })
  );
});

// Recibir SKIP_WAITING desde la app para activar nueva versión sin esperar
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
