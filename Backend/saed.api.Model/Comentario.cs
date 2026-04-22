using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.Model
{
    public class Comentario
    {
        public int Id { get; set; }

        public int EvaluacionId { get; set; }

        public string Texto { get; set; } = string.Empty;

        // Relación
        public Evaluacion Evaluacion { get; set; } = null!;
    }
}
