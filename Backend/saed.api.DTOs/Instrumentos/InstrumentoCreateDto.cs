using saed.api.Model;

namespace saed.api.DTOs.Instrumentos
{
    // Contrato jerarquico para altas, consultas y edicion del instrumento completo.
    public class InstrumentoCreateDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public TipoInstrumento TipoInstrumento { get; set; } = TipoInstrumento.Curricular;

        public bool EsPlantilla { get; set; } = true;

        public bool Activo { get; set; } = true;

        public List<CategoriaDto> Categorias { get; set; } = new();
    }

    public class CategoriaDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public int Orden { get; set; }

        public List<PreguntaDto> Preguntas { get; set; } = new();
    }

    public class PreguntaDto
    {
        public int Id { get; set; }

        public string Texto { get; set; } = string.Empty;

        public PreguntaTipo Tipo { get; set; }

        public int Orden { get; set; }

        public List<OpcionDto> Opciones { get; set; } = new();
    }

    public class OpcionDto
    {
        public int Id { get; set; }

        public string Texto { get; set; } = string.Empty;

        public int Valor { get; set; }
    }
}