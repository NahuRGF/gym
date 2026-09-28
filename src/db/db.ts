import Dexie, { type EntityTable } from 'dexie'
import type {
  Config,
  Ejercicio,
  Empleado,
  Pago,
  Plan,
  Programa,
  Rutina,
  RutinaItem,
  Sesion,
  Socio,
} from './schema'

class GymDB extends Dexie {
  planes!: EntityTable<Plan, 'id'>
  socios!: EntityTable<Socio, 'id'>
  pagos!: EntityTable<Pago, 'id'>
  ejercicios!: EntityTable<Ejercicio, 'id'>
  rutinas!: EntityTable<Rutina, 'id'>
  rutinaItems!: EntityTable<RutinaItem, 'id'>
  programas!: EntityTable<Programa, 'id'>
  sesiones!: EntityTable<Sesion, 'id'>
  empleados!: EntityTable<Empleado, 'id'>
  config!: EntityTable<Config, 'id'>

  constructor() {
    super('gym')

    // `documento` queda indexado pero no unico a proposito: muchos socios pueden
    // dejarlo vacio, y un indice unico rechazaria el segundo "".
    this.version(1).stores({
      planes: 'id, nombre',
      socios: 'id, documento, nombre, estado, planId, vence',
      pagos: 'id, socioId, fecha, [socioId+fecha]',
      ejercicios: 'id, nombre, grupoMuscular, tipo',
      rutinas: 'id, nombre',
      rutinaItems: 'id, rutinaId, ejercicioId, [rutinaId+orden]',
      programas: 'id, socioId, rutinaId, [socioId+rutinaId]',
      sesiones: 'id, socioId, fecha, [socioId+fecha]',
      empleados: 'id, nombre',
      config: 'id',
    })
  }
}

export const db = new GymDB()
