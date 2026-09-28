/**
 * Registra el service worker del caparazon.
 *
 * Solo se registra en produccion: en dev el SW cachea el bundle y termina
 * mostrando versiones viejas, que durante el desarrollo es una pesadilla.
 *
 * El path sale de import.meta.env.BASE_URL porque la app vive en el subpath
 * /gym/ de GitHub Pages; un '/sw.js' hardcodeado daria 404.
 */
export function registrarServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  const url = `${import.meta.env.BASE_URL}sw.js`

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(url).catch(() => {
      // Sin SW la app sigue funcionando en linea, solo pierde el arranque
      // offline. No vale la pena romper nada por esto.
    })
  })
}
