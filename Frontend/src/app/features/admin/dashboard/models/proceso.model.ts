// DTO de respuesta del backend
export interface ProcesoDto {
  id:                number
  nombre:            string
  anio:              number
  periodo:           number
  fechaInicio:       string
  fechaFin:          string
  activo:            boolean
  instrumentoId?:    number | null
  nombreInstrumento?: string | null
}

// DTO de creación — el nombre lo genera el backend automáticamente
export interface CrearProcesoDto {
  anio:          number
  periodo:       number
  fechaInicio:   string
  fechaFin:      string
  instrumentoId: number
}