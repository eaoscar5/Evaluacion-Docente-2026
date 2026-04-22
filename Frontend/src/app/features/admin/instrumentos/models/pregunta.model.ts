import { TipoPregunta } from './enums'
import { Opcion } from './opcion.model'

export interface Pregunta {
  id?: number
  /** ID temporal para trackBy antes de persistir en BD */
  _tempId?: string
  texto: string
  tipo: TipoPregunta
  orden: number
  opciones: Opcion[]
}