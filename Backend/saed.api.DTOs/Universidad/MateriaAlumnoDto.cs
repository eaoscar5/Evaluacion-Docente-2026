using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.DTOs.Universidad
{
    public class MateriaAlumnoDto
    {
        public string Grupo { get; set; } = string.Empty;

        public string NombreGrupo { get; set; } = string.Empty;

        public string IdMaestro { get; set; } = string.Empty;

        public string NombreMaestro { get; set; } = string.Empty;

        public string IdMateria { get; set; } = string.Empty;

        public string Materia { get; set; } = string.Empty;
    }
}
