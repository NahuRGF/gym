// Service worker del caparazon PWA.
//
// Estrategia:
// - Navegaciones (el HTML): red primero, cache de respaldo. Así una versión nueva
//   publicada llega siempre que hay internet, y sin internet sigue abriendo.
// - Resto de recursos same-origin: cache primero, porque son iconos estaticos.
//
// Los datos del gym NO pasan por acá: viven en IndexedDB, que el service worker
// no toca. Este archivo solo garantiza que la app abra sin conexion.

const CACHE = 'gym-shell-v2'
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function redPrimero(request) {
  const cache = await caches.open(CACHE)
  try {
    const respuesta = await fetch(request)
    if (respuesta && respuesta.ok) {
      cache.put(request, respuesta.clone())
    }
    return respuesta
  } catch (error) {
    const guardada = await cache.match(request)
    if (guardada) return guardada
    const index = await cache.match('./index.html')
    if (index) return index
    throw error
  }
}

async function cachePrimero(request) {
  const cache = await caches.open(CACHE)
  const guardada = await cache.match(request)
  if (guardada) return guardada
  const respuesta = await fetch(request)
  if (respuesta && respuesta.ok) {
    cache.put(request, respuesta.clone())
  }
  return respuesta
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(redPrimero(request))
    return
  }

  event.respondWith(cachePrimero(request))
})
