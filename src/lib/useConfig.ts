import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { CONFIG_ID, type Config } from '../db/schema'

export const CONFIG_POR_DEFECTO: Config = {
  id: CONFIG_ID,
  gymNombre: 'Mi Gimnasio',
  moneda: '$',
  ultimoBackup: null,
}

export function useGymNombre(): string {
  const nombre = useLiveQuery(async () => {
    const config = await db.config.get(CONFIG_ID)
    return config?.gymNombre || CONFIG_POR_DEFECTO.gymNombre
  }, [])

  // useLiveQuery devuelve undefined mientras carga la primera vez.
  return nombre ?? CONFIG_POR_DEFECTO.gymNombre
}

export function useConfig(): Config | undefined {
  return useLiveQuery(() => db.config.get(CONFIG_ID), [])
}
