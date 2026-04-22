namespace saed.api.DTOs.Evaluaciones
{
    public class CalificacionMaestroDto
    {
        public string IdMaestro { get; set; } = string.Empty;
        public string NombreMaestro { get; set; } = string.Empty;
        public int ProcesoId { get; set; }
        public int TotalEvaluaciones { get; set; }
        public double CalificacionGlobal { get; set; }

        // Una entrada por cada materia+grupo que imparte el maestro en el proceso
        public List<CalificacionPorMateriaDto> PorMateria { get; set; } = new();
    }

    public class CalificacionPorMateriaDto
    {
        public string MateriaId { get; set; } = string.Empty;
        public string NombreMateria { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public int TotalEvaluaciones { get; set; }
        public double Calificacion { get; set; }

        public List<CalificacionPreguntaDto> PorPregunta { get; set; } = new();
        public List<string> Comentarios { get; set; } = new();
    }

    public class CalificacionPreguntaDto
    {
        public int PreguntaId { get; set; }
        public string TextoPregunta { get; set; } = string.Empty;
        public double Promedio { get; set; }
        public int TotalRespuestas { get; set; }
        public Dictionary<string, int> Distribucion { get; set; } = new();
    }

    public class ResumenCalificacionDto
    {
        public string IdMaestro { get; set; } = string.Empty;
        public string NombreMaestro { get; set; } = string.Empty;
        public int TotalEvaluaciones { get; set; }
        public double CalificacionGlobal { get; set; }
        public int TotalMaterias { get; set; }
    }
}