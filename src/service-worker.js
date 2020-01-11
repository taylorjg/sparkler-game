const CACHE_NAME = 'cache-v1'

const urlsToCache = [
  '/',
  '/styles.css',
  '/VectorBattle-e9XO.ttf',
  '/bundle.js',
  '/stream-processor.js'
]

self.addEventListener('install', event =>
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))))

self.addEventListener('fetch', event =>
  event.respondWith(
    caches.match(event.request)
      .then(response => response ? response : fetch(event.request))))
