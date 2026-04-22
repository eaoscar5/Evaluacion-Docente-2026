using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.DTOs.Procesos
{
    public class CrearProcesoDto
    {
        public int Anio { get; set; }

        public int Periodo { get; set; } // 1=Sep-Dic, 2=Ene-Abr, 3=May-Ago

        public DateOnly FechaInicio { get; set; }

        public DateOnly FechaFin { get; set; }

        public int InstrumentoId { get; set; } // ← el instrumento se asigna al crear el proceso
    }
}
