// AntiqueRide Progressive Web Application Service Worker
// Version: 2.1.0 (Production San Jose de Buenavista Pilot)

const CACHE_NAME = 'antiqueride-pwa-v2.1.0';
const OFFLINE_URL = '/offline';
const TILE_CACHE_NAME = 'antiqueride-tiles-v1';
const MAX_CACHED_TILES = 120;

// Essential Application Shell Assets
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/commuter',
  '/commuter/login',
  '/commuter/register',
  '/driver',
  '/driver/login',
  '/driver/register',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Install: Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('Pre-caching issue (continuing anyway):', err);
      })
  );
});

// Activate: Clean up stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== TILE_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML pages): Network-first with fallback to offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, clone into cache
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          // If offline, check matching page in cache first
          const cached = await caches.match(event.request);
          if (cached) return cached;

          // Otherwise serve cached offline fallback screen
          const offlineFallback = await caches.match(OFFLINE_URL);
          if (offlineFallback) return offlineFallback;

          return caches.match('/');
        })
    );
    return;
  }

  // 2. OpenStreetMap Tiles: Cache-first / Stale-while-revalidate with LRU purge
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (tileCache) => {
        const cachedTile = await tileCache.match(event.request);
        if (cachedTile) return cachedTile;

        try {
          const networkTile = await fetch(event.request);
          if (networkTile.status === 200) {
            tileCache.put(event.request, networkTile.clone());
            // Trim tile cache if it exceeds max size
            trimCache(TILE_CACHE_NAME, MAX_CACHED_TILES);
          }
          return networkTile;
        } catch {
          return new Response('', { status: 408, statusText: 'Tile Offline' });
        }
      })
    );
    return;
  }

  // 3. Static local assets (JS, CSS, SVGs, PNGs, Web Manifest): Stale-while-revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.json'))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default: Network fetch with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Cache trimmer helper
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

// Push notification listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'AntiqueRide Dispatch Alert',
    body: 'New update on your transportation status.',
    url: '/commuter',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'AntiqueRide', body: event.data.text(), url: '/' };
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [250, 100, 250, 100, 250],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Open Ride' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Push notification click listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Skip waiting message listener (from UI update banner)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
