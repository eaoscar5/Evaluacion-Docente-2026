namespace saed.api.DTOs.Evaluaciones
{
    // Resumen de maestros evaluados — para la vista de admin de reportes
    public class ResumenMaestroDto
    {
        public string IdMaestro { get; set; } = string.Empty;
        public string NombreMaestro { get; set; } = string.Empty;
        public int TotalEvaluaciones { get; set; }
    }
}