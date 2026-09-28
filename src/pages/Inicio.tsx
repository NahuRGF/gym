import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { formatMoneda, hoyISO, mesActual } from '../lib/format'

interface Kpis {
  activos: number
  vencidos: number
  ingresosMes: number
  sesionesMes: number
}

function useKpis(): Kpis | undefined {
  return useLiveQuery(async () => {
    const hoy = hoyISO()
    const { inicio, fin } = mesActual()

    const [socios, pagos, sesiones] = await Promise.all([
      db.socios.toArray(),
      db.pagos.where('fecha').between(inicio, fin, true, true).toArray(),
      db.sesiones.where('fecha').between(inicio, fin, true, true).toArray(),
    ])

    const activos = socios.filter((s) => s.estado === 'activo')
    const vencidos = activos.filter((s) => s.vence !== null && s.vence < hoy)

    return {
      activos: activos.length,
      vencidos: vencidos.length,
      ingresosMes: pagos.reduce((suma, p) => suma + p.monto, 0),
      sesionesMes: sesiones.length,
    }
  }, [])
}

function Tarjeta({
  etiqueta,
  valor,
  detalle,
  tono = 'neutro',
}: {
  etiqueta: string
  valor: string
  detalle?: string
  tono?: 'neutro' | 'peligro' | 'marca'
}) {
  const color =
    tono === 'peligro'
      ? 'text-peligro'
      : tono === 'marca'
        ? 'text-marca'
        : 'text-zinc-900'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{etiqueta}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{valor}</p>
      {detalle ? <p className="mt-0.5 text-xs text-zinc-500">{detalle}</p> : null}
    </div>
  )
}

export default function Inicio() {
  const kpis = useKpis()
  const { etiqueta } = mesActual()

  if (!kpis) {
    return <p className="py-8 text-center text-sm text-zinc-500">Cargando…</p>
  }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3">
        <Tarjeta
          etiqueta="Socios activos"
          valor={String(kpis.activos)}
          tono="marca"
        />
        <Tarjeta
          etiqueta="Cuotas vencidas"
          valor={String(kpis.vencidos)}
          detalle={kpis.vencidos > 0 ? 'Requieren seguimiento' : 'Todo al día'}
          tono={kpis.vencidos > 0 ? 'peligro' : 'neutro'}
        />
        <Tarjeta
          etiqueta="Ingresos del mes"
          valor={formatMoneda(kpis.ingresosMes)}
          detalle={etiqueta}
        />
        <Tarjeta
          etiqueta="Sesiones registradas"
          valor={String(kpis.sesionesMes)}
          detalle={etiqueta}
        />
      </section>

      {kpis.activos === 0 ? (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center">
          <h2 className="text-sm font-semibold text-zinc-900">Todavía no hay socios</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Andá a <span className="font-medium text-zinc-700">Socios</span> y cargá el primero.
          </p>
        </section>
      ) : null}
    </div>
  )
}
