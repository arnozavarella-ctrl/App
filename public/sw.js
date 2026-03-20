// ============================
// SERVICE WORKER — LevelUp PWA
// Cache offline basique
// ============================

const CACHE_NOM = 'levelup-v1';
const RESSOURCES_A_CACHER = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Installation : mise en cache des ressources essentielles
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NOM).then((cache) => {
      return cache.addAll(RESSOURCES_A_CACHER).catch(err => {
        console.warn('[SW] Certaines ressources n\'ont pas pu être mises en cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cles) => {
      return Promise.all(
        cles
          .filter((cle) => cle !== CACHE_NOM)
          .map((cle) => {
            console.log('[SW] Suppression ancien cache:', cle);
            return caches.delete(cle);
          })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes — stratégie "Network First, fallback Cache"
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET et les extensions Chrome
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension')) return;

  // Stratégie : réseau d'abord, puis cache
  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        // Mettre en cache les nouvelles ressources
        if (reponse && reponse.status === 200) {
          const reponseClonee = reponse.clone();
          caches.open(CACHE_NOM).then((cache) => {
            cache.put(event.request, reponseClonee);
          });
        }
        return reponse;
      })
      .catch(() => {
        // Pas de réseau — servir depuis le cache
        return caches.match(event.request).then((reponseCache) => {
          if (reponseCache) return reponseCache;
          // Fallback sur index.html pour la navigation SPA
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Hors ligne — reconnecte-toi pour accéder à LevelUp !', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});
