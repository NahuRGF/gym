export type EstadoSocio = 'activo' | 'pausado' | 'baja'
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta'
export type ConceptoPago = 'renovacion' | 'cuota' | 'rutina' | 'extra'
export type GrupoMuscular =
  | 'pecho'
  | 'espalda'
  | 'hombro'
  | 'pierna'
  | 'brazo'
  | 'core'
  | 'cardio'
  | 'cuerpo_completo'
export type TipoEjercicio = 'maquina' | 'peso_libre' | 'polea' | 'corporal' | 'cardio'
export type TipoSesion = 'entrenamiento' | 'visita'

export interface Plan {
  id: string
  nombre: string
  precio: number
  periodoDias: number
  activo: boolean
}

export interface Socio {
  id: string
  nombre: string
  documento: string
  telefono: string
  email: string
  fechaAlta: string
  estado: EstadoSocio
  planId: string | null
  /** ISO YYYY-MM-DD. Se recalcula al cobrar un pago de tipo renovacion. */
  vence: string | null
  notas: string
}

export interface Pago {
  id: string
  socioId: string
  fecha: string
  monto: number
  metodo: MetodoPago
  concepto: ConceptoPago
  notas: string
}

export interface Ejercicio {
  id: string
  nombre: string
  grupoMuscular: GrupoMuscular
  tipo: TipoEjercicio
  equipo: string
  notas: string
}

export interface Rutina {
  id: string
  nombre: string
  descripcion: string
}

export interface RutinaItem {
  id: string
  rutinaId: string
  ejercicioId: string
  orden: number
  series: number
  repeticiones: string
  cargaKg: number | null
  descansoSeg: number
  notas: string
}

export interface Programa {
  id: string
  socioId: string
  rutinaId: string
  fechaInicio: string
  activo: boolean
}

export interface SerieRealizada {
  n: number
  reps: number | null
  cargaKg: number | null
}

export interface DetalleEjercicio {
  ejercicioId: string
  nombre: string
  series: SerieRealizada[]
}

export interface Sesion {
  id: string
  socioId: string
  fecha: string
  tipo: TipoSesion
  duracionMin: number | null
  /** 1-10 */
  sensacion: number | null
  notas: string
  detalle: DetalleEjercicio[]
}

export interface Empleado {
  id: string
  nombre: string
  rol: string
  telefono: string
  activo: boolean
}

export interface Config {
  id: string
  gymNombre: string
  moneda: string
  ultimoBackup: string | null
}

export const CONFIG_ID = 'config'
