namespace saed.api.Services.Universidad
{
    public class AlumnoUniversidad
    {
        public string Matricula { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string ApellidoPaterno { get; set; } = "";
        public string ApellidoMaterno { get; set; } = "";
        public string Correo { get; set; } = "";
    }

    public class MaestroUniversidad
    {
        public string IdMaestro { get; set; } = "";
        public string Nombre { get; set; } = "";
    }
}