console.log('[service-worker]')

const CACHE_NAME = 'cache-v1'

const urlsToCache = [
  '/',
  '/styles.css',
  '/VectorBattle-e9XO.ttf',
  '/bundle.js',
  '/stream-processor.js'
]

self.addEventListener('install', event => {
  console.log('[service-worker install handler]')
  console.dir(event)
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[service-worker install handler] cache open')
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('activate', event => {
  console.log('[service-worker activate handler]')
  console.dir(event)
})

self.addEventListener('fetch', event =>
  event.respondWith(
    caches.match(event.request)
      .then(response => response ? response : fetch(event.request))))
