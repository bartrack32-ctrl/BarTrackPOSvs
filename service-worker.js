// BarTrack POS Service Worker
// Provides offline capabilities and caching

const CACHE_NAME = 'bartrack-pos-v1';
const RUNTIME_CACHE = 'bartrack-runtime';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API requests - network first, fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          // Clone and cache successful responses
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          // Fallback to cache if network fails
          return cache.match(event.request);
        });
      })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          // Clone and cache the response
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

// Background sync for offline sales
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncSales());
  }
});

async function syncSales() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    const pendingSales = requests.filter(req => req.url.includes('/api/sales') && req.method === 'POST');
    
    for (const request of pendingSales) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync sale:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notification support
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from BarTrack POS',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BarTrack POS', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
