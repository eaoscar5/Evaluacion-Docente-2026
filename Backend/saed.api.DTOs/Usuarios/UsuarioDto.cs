namespace saed.api.DTOs.Usuarios
{
    public class UsuarioDto
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;

        public bool Activo { get; set; }

        public bool PuedeGestionarUsuarios { get; set; }

        public bool PuedeGestionarInstrumentos { get; set; }

        public bool PuedeGestionarProcesos { get; set; }

        public bool PuedeVerReportes { get; set; }

        public DateTime FechaCreacion { get; set; }

        public DateTime FechaActualizacion { get; set; }
    }
}
