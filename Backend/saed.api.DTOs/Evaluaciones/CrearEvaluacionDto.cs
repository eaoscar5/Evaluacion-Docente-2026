namespace saed.api.DTOs.Evaluaciones
{
    // DTO de entrada para crear una evaluación completa
    public class CrearEvaluacionDto
    {
        // El ProcesoId lo obtiene el servicio del proceso activo — no viene del cliente
        public string IdMaestro { get; set; } = string.Empty;
        public string NombreMaestro { get; set; } = string.Empty; // ← desnormalizado
        public string MateriaId { get; set; } = string.Empty;
        public string NombreMateria { get; set; } = string.Empty; // ← desnormalizado
        public string Grupo { get; set; } = string.Empty; // ← desnormalizado

        public List<RespuestaDto> Respuestas { get; set; } = new();

        public string? Comentario { get; set; }
    }

    public class RespuestaDto
    {
        public int PreguntaId { get; set; }
        public int OpcionId { get; set; }
    }

    // DTO de salida al crear — devuelve el ID y clave de comprobante
    public class EvaluacionCreadaDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
    }

    // DTO de disponibles — sin cambios, ya estaba bien
    public class EvaluacionDisponibleDto
    {
        public string IdMaestro { get; set; } = string.Empty;
        public string NombreMaestro { get; set; } = string.Empty;
        public string MateriaId { get; set; } = string.Empty;
        public string Materia { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public bool YaEvaluado { get; set; }
    }

    // DTO de reporte por maestro
    public class ReporteMaestroDto
    {
        public string IdMaestro { get; set; } = string.Empty;
        public string NombreMaestro { get; set; } = string.Empty;
        public int ProcesoId { get; set; }
        public string NombreProceso { get; set; } = string.Empty;
        public int TotalEvaluaciones { get; set; }

        public List<ReportePreguntaDto> Preguntas { get; set; } = new();
        public List<string> Comentarios { get; set; } = new();
    }

    public class ReportePreguntaDto
    {
        public int PreguntaId { get; set; }
        public string TextoPregunta { get; set; } = string.Empty;
        public double Promedio { get; set; }
        public Dictionary<string, int> Distribucion { get; set; } = new(); // texto opcion → conteo
    }
}