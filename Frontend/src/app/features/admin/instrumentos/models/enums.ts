/**
 * Valores numéricos que coinciden con el enum TipoInstrumento del backend C#.
 * El backend serializa como entero (sin JsonStringEnumConverter):
 *   Curricular = 1, Extracurricular = 2
 */
export enum TipoInstrumento {
  Curricular = 1,
  Extracurricular = 2
}

/**
 * Valores numéricos que coinciden con PreguntaTipo del backend C#:
 *   Cerrada = 1, Abierta = 2
 */
export enum TipoPregunta {
  Cerrada = 1,
  Abierta = 2
}

/** Entradas de enum para iterar en mat-select sin hardcodear el HTML */
export const TIPO_INSTRUMENTO_OPTIONS: { value: TipoInstrumento; label: string }[] = [
  { value: TipoInstrumento.Curricular, label: 'Curricular' },
  { value: TipoInstrumento.Extracurricular, label: 'Extracurricular' }
]

export const TIPO_PREGUNTA_OPTIONS: { value: TipoPregunta; label: string }[] = [
  { value: TipoPregunta.Cerrada, label: 'Cerrada' },
  { value: TipoPregunta.Abierta, label: 'Abierta' }
]
