console.log('[service-worker]')

self.addEventListener('install', event => {
  console.log('[service-worker install handler]')
  console.dir(event)
})

self.addEventListener('activate', event => {
  console.log('[service-worker activate handler]')
  console.dir(event)
})
