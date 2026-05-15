// ═══════════════════════════════════════════════════════════════
// GEAT CONTRATISTAS — SERVICE WORKER MÍNIMO
// Solo para hacer la app instalable (sin push, sin caché agresivo)
// ═══════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through total
});
