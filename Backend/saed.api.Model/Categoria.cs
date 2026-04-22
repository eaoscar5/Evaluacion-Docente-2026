namespace saed.api.Model
{
    public class Categoria
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public int Orden { get; set; }

        public int InstrumentoId { get; set; }

        public Instrumento Instrumento { get; set; } = null!;

        public ICollection<Pregunta> Preguntas { get; set; } = new List<Pregunta>();
    }
}
