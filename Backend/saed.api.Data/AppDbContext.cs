using Microsoft.EntityFrameworkCore;
using saed.api.Model;

namespace saed.api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Proceso> Procesos { get; set; }
        public DbSet<Academia> Academias { get; set; }
        public DbSet<Instrumento> Instrumentos { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Pregunta> Preguntas { get; set; }
        public DbSet<OpcionRespuesta> OpcionesRespuesta { get; set; }
        public DbSet<Evaluacion> Evaluaciones { get; set; }
        public DbSet<Respuesta> Respuestas { get; set; }
        public DbSet<Comentario> Comentarios { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Instrumento>().ToTable("Instrumentos");
            modelBuilder.Entity<Categoria>().ToTable("Categorias");
            modelBuilder.Entity<Pregunta>().ToTable("Preguntas");
            modelBuilder.Entity<OpcionRespuesta>().ToTable("OpcionesRespuesta");

            modelBuilder.Entity<Instrumento>()
                .Property(i => i.TipoInstrumento)
                .HasConversion<string>();

            modelBuilder.Entity<Pregunta>()
                .Property(p => p.Tipo)
                .HasConversion<string>();

            modelBuilder.Entity<Categoria>()
                .HasOne(c => c.Instrumento)
                .WithMany(i => i.Categorias)
                .HasForeignKey(c => c.InstrumentoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pregunta>()
                .HasOne(p => p.Categoria)
                .WithMany(c => c.Preguntas)
                .HasForeignKey(p => p.CategoriaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OpcionRespuesta>()
                .HasOne(o => o.Pregunta)
                .WithMany(p => p.Opciones)
                .HasForeignKey(o => o.PreguntaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Categoria>()
                .HasIndex(c => c.InstrumentoId);

            modelBuilder.Entity<Pregunta>()
                .HasIndex(p => p.CategoriaId);

            modelBuilder.Entity<OpcionRespuesta>()
                .HasIndex(o => o.PreguntaId);

            modelBuilder.Entity<Instrumento>()
                .Property(i => i.Nombre)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Categoria>()
                .Property(c => c.Nombre)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Pregunta>()
                .Property(p => p.Texto)
                .HasMaxLength(500)
                .IsRequired();

            modelBuilder.Entity<OpcionRespuesta>()
                .Property(o => o.Texto)
                .HasMaxLength(300)
                .IsRequired();

            modelBuilder.Entity<Proceso>().ToTable("Procesos");

            modelBuilder.Entity<Proceso>()
                .HasOne(p => p.Instrumento)
                .WithMany()
                .HasForeignKey(p => p.InstrumentoId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Proceso>()
                .HasIndex(p => p.InstrumentoId);

            modelBuilder.Entity<Proceso>()
                .Property(p => p.Nombre)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Usuario>().ToTable("Usuarios");

            modelBuilder.Entity<Usuario>()
                .Property(u => u.Username)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<Usuario>()
                .Property(u => u.PasswordHash)
                .IsRequired();

            modelBuilder.Entity<Usuario>()
                .Property(u => u.Rol)
                .HasMaxLength(30)
                .IsRequired();

            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<Evaluacion>().ToTable("Evaluaciones");
            modelBuilder.Entity<Respuesta>().ToTable("Respuestas");
            modelBuilder.Entity<Comentario>().ToTable("Comentarios");

            modelBuilder.Entity<Evaluacion>()
                .HasOne(e => e.Proceso)
                .WithMany()
                .HasForeignKey(e => e.ProcesoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Evaluacion>()
                .HasIndex(e => new { e.ProcesoId, e.MatriculaAlumno, e.IdMaestro, e.MateriaId })
                .IsUnique();

            modelBuilder.Entity<Respuesta>()
                .HasOne(r => r.Evaluacion)
                .WithMany(e => e.Respuestas)
                .HasForeignKey(r => r.EvaluacionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Respuesta>()
                .HasOne(r => r.Pregunta)
                .WithMany()
                .HasForeignKey(r => r.PreguntaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Respuesta>()
                .HasOne(r => r.Opcion)
                .WithMany()
                .HasForeignKey(r => r.OpcionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comentario>()
                .HasOne(c => c.Evaluacion)
                .WithOne(e => e.Comentario)
                .HasForeignKey<Comentario>(c => c.EvaluacionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Evaluacion>()
                .Property(e => e.MatriculaAlumno).HasMaxLength(20).IsRequired();
            modelBuilder.Entity<Evaluacion>()
                .Property(e => e.IdMaestro).HasMaxLength(20).IsRequired();
            modelBuilder.Entity<Evaluacion>()
                .Property(e => e.NombreMaestro).HasMaxLength(200).IsRequired();
            modelBuilder.Entity<Evaluacion>()
                .Property(e => e.MateriaId).HasMaxLength(20).IsRequired();
            modelBuilder.Entity<Evaluacion>()
                .Property(e => e.NombreMateria).HasMaxLength(200).IsRequired();
            modelBuilder.Entity<Evaluacion>()
                .Property(e => e.Grupo).HasMaxLength(20).IsRequired();
        }
    }
}
