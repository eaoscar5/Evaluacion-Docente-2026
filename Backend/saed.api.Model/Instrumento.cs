namespace saed.api.Model
{
    public class Instrumento
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public TipoInstrumento TipoInstrumento { get; set; } = TipoInstrumento.Curricular;

        public bool EsPlantilla { get; set; } = true;

        public bool Activo { get; set; } = true;

        // ProcesoId eliminado la relacion vive en Proceso.InstrumentoId
        public ICollection<Categoria> Categorias { get; set; } = new List<Categoria>();
    }
}