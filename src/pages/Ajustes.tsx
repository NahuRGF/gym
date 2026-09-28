import { useEffect, useState } from 'react'
import { ensurePersistentStorage, formatBytes, type StorageStatus } from '../lib/storage'
import { CONFIG_POR_DEFECTO, useConfig } from '../lib/useConfig'
import { db } from '../db/db'
import { CONFIG_ID } from '../db/schema'
import { formatFechaHora } from '../lib/format'

function CampoGymNombre({
  valor,
  onGuardar,
}: {
  valor: string
  onGuardar: (nombre: string) => void | Promise<void>
}) {
  const [borrador, setBorrador] = useState(valor)
  const [guardado, setGuardado] = useState(false)
  const sucio = borrador.trim() !== valor

  async function guardar() {
    await onGuardar(borrador)
    setGuardado(true)
    window.setTimeout(() => setGuardado(false), 1800)
  }

  return (
    <div className="mt-3 flex gap-2">
      <input
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        placeholder="Nombre del gimnasio"
        aria-label="Nombre del gimnasio"
        className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none focus:border-marca"
      />
      <button
        type="button"
        onClick={guardar}
        disabled={!sucio && !guardado}
        className="tap shrink-0 rounded-xl bg-marca px-4 font-semibold text-white active:bg-marca-fuerte disabled:opacity-40"
      >
        {guardado ? 'Listo' : 'Guardar'}
      </button>
    </div>
  )
}

export default function Ajustes() {
  const config = useConfig()
  const [almacenamiento, setAlmacenamiento] = useState<StorageStatus | null>(null)

  useEffect(() => {
    let vigente = true
    ensurePersistentStorage().then((estado) => {
      if (vigente) setAlmacenamiento(estado)
    })
    return () => {
      vigente = false
    }
  }, [])

  async function guardarNombre(nombre: string) {
    const limpio = nombre.trim() || CONFIG_POR_DEFECTO.gymNombre
    await db.config.put({
      id: CONFIG_ID,
      gymNombre: limpio,
      moneda: config?.moneda ?? CONFIG_POR_DEFECTO.moneda,
      ultimoBackup: config?.ultimoBackup ?? null,
    })
  }

  const nombreActual = config?.gymNombre ?? CONFIG_POR_DEFECTO.gymNombre

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Gimnasio</h2>
        <CampoGymNombre
          key={nombreActual}
          valor={nombreActual}
          onGuardar={guardarNombre}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Almacenamiento</h2>

        {almacenamiento === null ? (
          <p className="mt-2 text-sm text-zinc-500">Consultando…</p>
        ) : !almacenamiento.supported ? (
          <p className="mt-2 text-sm text-peligro">
            Este navegador no expone la API de almacenamiento. La app puede no guardar los datos.
          </p>
        ) : (
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-600">Modo persistente</span>
              <span
                className={`font-semibold ${
                  almacenamiento.persisted ? 'text-marca' : 'text-peligro'
                }`}
              >
                {almacenamiento.persisted ? 'Sí' : 'No'}
              </span>
            </div>

            {almacenamiento.usage !== null && almacenamiento.quota !== null ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-600">Espacio usado</span>
                <span className="font-semibold tabular-nums text-zinc-900">
                  {formatBytes(almacenamiento.usage)} de {formatBytes(almacenamiento.quota)}
                </span>
              </div>
            ) : null}

            {!almacenamiento.persisted ? (
              <p className="rounded-xl bg-amber-50 p-3 text-amber-900">
                iOS puede borrar los datos si no abrís la app por 7 días. Instalala en la pantalla
                de inicio (Compartir → Agregar a pantalla de inicio) y exportá un backup seguido.
              </p>
            ) : null}
          </div>
        )}

        <p className="mt-3 text-xs text-zinc-500">
          Último backup: {formatFechaHora(config?.ultimoBackup ?? null)}
        </p>
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Próximos pasos</h2>
        <ul className="mt-2 space-y-1 text-sm text-zinc-500">
          <li>• Backup y restauración de datos</li>
          <li>• Empleados</li>
          <li>• Reportes de pagos</li>
        </ul>
      </section>
    </div>
  )
}
