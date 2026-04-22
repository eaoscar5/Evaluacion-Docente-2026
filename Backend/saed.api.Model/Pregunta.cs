namespace saed.api.Model
{
    public class Pregunta
    {
        public int Id { get; set; }

        public string Texto { get; set; } = string.Empty;

        public PreguntaTipo Tipo { get; set; }

        public int Orden { get; set; }

        public int CategoriaId { get; set; }

        public Categoria Categoria { get; set; } = null!;

        public ICollection<OpcionRespuesta> Opciones { get; set; } = new List<OpcionRespuesta>();
    }
}
