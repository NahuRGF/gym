export interface StorageStatus {
  supported: boolean
  persisted: boolean
  usage: number | null
  quota: number | null
}

const UNKNOWN: StorageStatus = {
  supported: false,
  persisted: false,
  usage: null,
  quota: null,
}

function hasStorageApi(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.storage !== 'undefined'
}

/**
 * Safari borra el IndexedDB de una PWA que no se abre por 7 dias, salvo que el
 * origen quede en modo persistente. WebKit concede persist() por heuristica cuando
 * la app se instalo en la pantalla de inicio, pero no esta garantizado: por eso
 * devolvemos el estado real para poder avisarle al usuario en la UI.
 */
export async function ensurePersistentStorage(): Promise<StorageStatus> {
  if (!hasStorageApi()) return UNKNOWN

  try {
    let persisted = await navigator.storage.persisted()

    if (!persisted && typeof navigator.storage.persist === 'function') {
      persisted = await navigator.storage.persist()
    }

    let usage: number | null = null
    let quota: number | null = null

    if (typeof navigator.storage.estimate === 'function') {
      const estimate = await navigator.storage.estimate()
      usage = estimate.usage ?? null
      quota = estimate.quota ?? null
    }

    return { supported: true, persisted, usage, quota }
  } catch {
    return { supported: false, persisted: false, usage: null, quota: null }
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}
