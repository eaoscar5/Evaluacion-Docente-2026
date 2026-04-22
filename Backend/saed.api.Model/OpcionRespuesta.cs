namespace saed.api.Model
{
    public class OpcionRespuesta
    {
        public int Id { get; set; }

        public int PreguntaId { get; set; }

        public int Valor { get; set; }

        public string Texto { get; set; } = string.Empty;

        public Pregunta Pregunta { get; set; } = null!;
    }
}
