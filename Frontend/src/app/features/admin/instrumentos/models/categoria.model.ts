import { Pregunta } from './pregunta.model'

export interface Categoria {
  id?:     number
  _tempId?: string

  // El backend usa "nombre", el template usa "titulo"
  // Mantenemos "titulo" en el frontend pero lo mapeamos al enviar
  nombre: string
  orden:  number

  preguntas: Pregunta[]
}