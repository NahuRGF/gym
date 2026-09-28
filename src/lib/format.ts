export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Fecha local en formato ISO YYYY-MM-DD. Evita `toISOString()` porque devuelve
 *  UTC, y en Argentina (UTC-3) eso correria la fecha al dia anterior. */
export function hoyISO(): string {
  return aISO(new Date())
}

export function aISO(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = desdeISO(iso)
  fecha.setDate(fecha.getDate() + dias)
  return aISO(fecha)
}

export function desdeISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Positivo = faltan dias para vencer. Negativo = vencida hace N dias. */
export function diasHasta(iso: string): number {
  const hoy = desdeISO(hoyISO()).getTime()
  const objetivo = desdeISO(iso).getTime()
  return Math.round((objetivo - hoy) / 86_400_000)
}

export function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatMoneda(monto: number, simbolo = '$'): string {
  return `${simbolo} ${monto.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatFechaHora(iso: string | null): string {
  if (!iso) return 'Nunca'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return 'Nunca'
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mesActual(): { inicio: string; fin: string; etiqueta: string } {
  const ahora = new Date()
  const inicio = aISO(new Date(ahora.getFullYear(), ahora.getMonth(), 1))
  const fin = aISO(new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0))
  return {
    inicio,
    fin,
    etiqueta: ahora.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
  }
}
