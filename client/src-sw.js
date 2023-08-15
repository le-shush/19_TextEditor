const { offlineFallback, warmStrategyCache } = require('workbox-recipes');
const { CacheFirst, StaleWhileRevalidate } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Register a route to handle caching of specific asset types using Workbox.
registerRoute(
  // Callback function to determine which requests should be considered for caching.
  // Only requests with a destination of 'style', 'script', or 'worker' will be cached.
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  
  // Use the StaleWhileRevalidate caching strategy.
  // This strategy serves cached content (even if stale) immediately and then updates 
  // the cache in the background with fresh content from the network.
  new StaleWhileRevalidate({
    // Name of the cache where the assets will be stored.
    cacheName: 'asset-cache',
    
    // Plugins to enhance the caching strategy.
    plugins: [
      // Plugin to determine which responses are cacheable.
      // Only responses with a status code of 0 (opaque responses) or 200 (OK) will be cached.
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);


