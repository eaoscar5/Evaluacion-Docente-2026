using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.DTOs.Procesos
{
    public class ProcesoDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public int Anio { get; set; }

        public int Periodo { get; set; }

        public DateOnly FechaInicio { get; set; }

        public DateOnly FechaFin { get; set; }

        public bool Activo { get; set; }

        public int? InstrumentoId { get; set; }

        public string? NombreInstrumento { get; set; } // para mostrar en la UI sin join extra
    }
}
