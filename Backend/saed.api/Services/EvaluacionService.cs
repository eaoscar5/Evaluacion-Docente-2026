using Microsoft.EntityFrameworkCore;
using saed.api.Data;
using saed.api.DTOs.Evaluaciones;
using saed.api.Model;
using saed.api.Services.Universidad;
using System.Security.Claims;

namespace saed.api.Services
{
    public class EvaluacionService
    {
        private readonly AppDbContext _context;
        private readonly UniversidadApiService _universidadApi;
        private readonly IHttpContextAccessor _httpContext;

        public EvaluacionService(
            AppDbContext context,
            UniversidadApiService universidadApi,
            IHttpContextAccessor httpContext)
        {
            _context = context;
            _universidadApi = universidadApi;
            _httpContext = httpContext;
        }

        // ── Claims ────────────────────────────────────────────────────────────

        private string ObtenerMatricula()
        {
            var v = _httpContext.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(v))
                throw new UnauthorizedAccessException("No se pudo obtener la matrícula del token.");
            return v;
        }

        private string ObtenerTokenUniversidad()
        {
            var v = _httpContext.HttpContext?.User.FindFirstValue("token_universidad");
            if (string.IsNullOrEmpty(v))
                throw new UnauthorizedAccessException("No se encontró el token universitario en la sesión.");
            return v;
        }

        // ── Crear evaluación ──────────────────────────────────────────────────

        public async Task<EvaluacionCreadaDto> CrearEvaluacion(CrearEvaluacionDto dto)
        {
            var matricula = ObtenerMatricula();

            var proceso = await _context.Procesos.FirstOrDefaultAsync(p => p.Activo)
                ?? throw new Exception("No hay proceso activo.");

            // Validar duplicado
            var existe = await _context.Evaluaciones.AnyAsync(e =>
                e.ProcesoId == proceso.Id &&
                e.MatriculaAlumno == matricula &&
                e.IdMaestro == dto.IdMaestro &&
                e.MateriaId == dto.MateriaId);

            if (existe)
                throw new Exception("Ya evaluaste a este maestro en esta materia.");

            // Crear evaluación con datos desnormalizados
            var evaluacion = new Evaluacion
            {
                ProcesoId = proceso.Id,
                MatriculaAlumno = matricula,
                IdMaestro = dto.IdMaestro,
                NombreMaestro = dto.NombreMaestro,
                MateriaId = dto.MateriaId,
                NombreMateria = dto.NombreMateria,
                Grupo = dto.Grupo,
                Fecha = DateTime.UtcNow
            };

            _context.Evaluaciones.Add(evaluacion);
            await _context.SaveChangesAsync();

            // Guardar respuestas
            var respuestas = dto.Respuestas.Select(r => new Respuesta
            {
                EvaluacionId = evaluacion.Id,
                PreguntaId = r.PreguntaId,
                OpcionId = r.OpcionId
            }).ToList();

            _context.Respuestas.AddRange(respuestas);

            // Guardar comentario si existe
            if (!string.IsNullOrWhiteSpace(dto.Comentario))
            {
                _context.Comentarios.Add(new Comentario
                {
                    EvaluacionId = evaluacion.Id,
                    Texto = dto.Comentario.Trim()
                });
            }

            await _context.SaveChangesAsync();

            return new EvaluacionCreadaDto
            {
                Id = evaluacion.Id,
                Fecha = evaluacion.Fecha
            };
        }

        // ── Evaluaciones disponibles ──────────────────────────────────────────

        public async Task<List<EvaluacionDisponibleDto>> ObtenerDisponibles()
        {
            var matricula = ObtenerMatricula();
            var tokenUniversidad = ObtenerTokenUniversidad();

            var proceso = await _context.Procesos.FirstOrDefaultAsync(p => p.Activo)
                ?? throw new Exception("No hay proceso activo.");

            var materias = await _universidadApi.GetStudentSubjects(
                tokenUniversidad, matricula, proceso.Anio, proceso.Periodo);

            // Obtener las ya evaluadas en este proceso
            var evaluadas = await _context.Evaluaciones
                .Where(e => e.MatriculaAlumno == matricula && e.ProcesoId == proceso.Id)
                .Select(e => new { e.IdMaestro, e.MateriaId })
                .ToListAsync();

            // Devolver TODAS las materias, marcando cuáles ya fueron evaluadas
            return materias.Select(m => new EvaluacionDisponibleDto
            {
                IdMaestro = m.IdMaestro,
                NombreMaestro = m.NombreMaestro,
                MateriaId = m.IdMateria,
                Materia = m.Materia,
                Grupo = m.Grupo,
                YaEvaluado = evaluadas.Any(e =>
                    e.IdMaestro == m.IdMaestro &&
                    e.MateriaId == m.IdMateria)
            }).ToList();
        }

        // ── Reporte por maestro ───────────────────────────────────────────────

        public async Task<ReporteMaestroDto> ObtenerReporteMaestro(string idMaestro, int procesoId)
        {
            var evaluaciones = await _context.Evaluaciones
                .Where(e => e.IdMaestro == idMaestro && e.ProcesoId == procesoId)
                .Include(e => e.Respuestas)
                    .ThenInclude(r => r.Pregunta)
                .Include(e => e.Respuestas)
                    .ThenInclude(r => r.Opcion)
                .Include(e => e.Comentario)
                .ToListAsync();

            if (!evaluaciones.Any())
                throw new Exception("No hay evaluaciones para este maestro en el proceso indicado.");

            var proceso = await _context.Procesos.FindAsync(procesoId)
                ?? throw new Exception("Proceso no encontrado.");

            var nombreMaestro = evaluaciones.First().NombreMaestro;

            // Agrupar respuestas por pregunta
            var todasRespuestas = evaluaciones.SelectMany(e => e.Respuestas).ToList();

            var preguntasAgrupadas = todasRespuestas
                .GroupBy(r => r.PreguntaId)
                .Select(g =>
                {
                    var primero = g.First();
                    var promedio = g.Average(r => r.Opcion?.Valor ?? 0);
                    var distribucion = g
                        .GroupBy(r => r.Opcion?.Texto ?? "Sin texto")
                        .ToDictionary(d => d.Key, d => d.Count());

                    return new ReportePreguntaDto
                    {
                        PreguntaId = g.Key,
                        TextoPregunta = primero.Pregunta?.Texto ?? "Pregunta eliminada",
                        Promedio = Math.Round(promedio, 2),
                        Distribucion = distribucion
                    };
                })
                .ToList();

            var comentarios = evaluaciones
                .Where(e => e.Comentario != null && !string.IsNullOrWhiteSpace(e.Comentario.Texto))
                .Select(e => e.Comentario!.Texto)
                .ToList();

            return new ReporteMaestroDto
            {
                IdMaestro = idMaestro,
                NombreMaestro = nombreMaestro,
                ProcesoId = procesoId,
                NombreProceso = proceso.Nombre,
                TotalEvaluaciones = evaluaciones.Count,
                Preguntas = preguntasAgrupadas,
                Comentarios = comentarios
            };
        }

        // ── Listar maestros evaluados en un proceso (para admin) ──────────────

        public async Task<List<ResumenMaestroDto>> ListarMaestrosPorProceso(int procesoId)
        {
            var resumen = await _context.Evaluaciones
                .Where(e => e.ProcesoId == procesoId)
                .GroupBy(e => new { e.IdMaestro, e.NombreMaestro })
                .Select(g => new ResumenMaestroDto
                {
                    IdMaestro = g.Key.IdMaestro,
                    NombreMaestro = g.Key.NombreMaestro,
                    TotalEvaluaciones = g.Count()
                })
                .OrderBy(r => r.NombreMaestro)
                .ToListAsync();

            return resumen;
        }
    }
}