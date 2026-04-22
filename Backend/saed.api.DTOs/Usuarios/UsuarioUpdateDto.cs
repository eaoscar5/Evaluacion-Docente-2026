namespace saed.api.DTOs.Usuarios
{
    public class UsuarioUpdateDto
    {
        public string Username { get; set; } = string.Empty;

        public string? Password { get; set; }

        public string Rol { get; set; } = "Gestor";

        public bool Activo { get; set; } = true;

        public bool PuedeGestionarUsuarios { get; set; }

        public bool PuedeGestionarInstrumentos { get; set; }

        public bool PuedeGestionarProcesos { get; set; }

        public bool PuedeVerReportes { get; set; }
    }
}
