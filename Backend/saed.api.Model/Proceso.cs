 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.Model
{
    public class Proceso
    {
        public int Id { get; set; }

        public int Anio { get; set; }

        public int Periodo { get; set; } // 1=Sep-Dic, 2=Ene-Abr, 3=May-Ago

        public string Nombre { get; set; } = string.Empty;

        public DateOnly FechaInicio { get; set; }

        public DateOnly FechaFin { get; set; }

        public bool Activo { get; set; }

        // ── Relación con el instrumento asignado ──────────────────────────
        public int? InstrumentoId { get; set; }

        public Instrumento? Instrumento { get; set; }
    }
}
