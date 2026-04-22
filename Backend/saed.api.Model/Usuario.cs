using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.Model
{
    public class Usuario
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Rol { get; set; } = "Admin"; // "Admin", "Gestor", "Alumno"

        public bool Activo { get; set; } = true;

        public bool PuedeGestionarUsuarios { get; set; }

        public bool PuedeGestionarInstrumentos { get; set; }

        public bool PuedeGestionarProcesos { get; set; }

        public bool PuedeVerReportes { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
    }
}
