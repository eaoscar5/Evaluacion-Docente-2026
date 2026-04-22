export interface Opcion {
  id?: number
  /** ID temporal para trackBy antes de persistir en BD */
  _tempId?: string
  texto: string
  valor: number
}

// Opciones predeterminadas para preguntas cerradas
// Modifica estos valores si quieres cambiar la escala de evaluación
export const OPCIONES_PREDETERMINADAS = [
  { texto: 'Nunca',          valor: 1 },
  { texto: 'Casi nunca',     valor: 2 },
  { texto: 'Algunas veces',  valor: 3 },
  { texto: 'Casi siempre',   valor: 4 },
  { texto: 'Siempre',        valor: 5 },
];