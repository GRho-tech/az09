/* Service worker AZ09 : met le site en cache pour un lancement
   rapide et un fonctionnement hors ligne. Version 1. */
const CACHE = 'az09-v1';
const FICHIERS = [
  './',
  './index.html',
  './tirage-de-chiffres.html',
  './tirage-de-lettres.html',
  './du-bon-compte-au-mot-le-plus-long.html',
  './sudoku-accessible.html',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Réseau d'abord pour les pages (mise à jour immédiate),
  // repli sur le cache si hors ligne.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((r) => {
        const copie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return r;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }
  // Cache d'abord pour le reste (icônes, manifeste…).
  e.respondWith(
    caches.match(e.request).then((r) =>
      r || fetch(e.request).then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
    )
  );
});