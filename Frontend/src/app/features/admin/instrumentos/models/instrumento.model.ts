import { TipoInstrumento } from './enums'
import { Categoria } from './categoria.model'

export interface Instrumento {
  id?:     number
  _tempId?: string

  nombre:          string
  tipoInstrumento: TipoInstrumento
  esPlantilla:     boolean
  activo:          boolean
  // procesoId eliminado — la relación vive en Proceso.instrumentoId
  categorias: Categoria[]
}