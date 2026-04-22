using Microsoft.EntityFrameworkCore;
using saed.api.Data;
using saed.api.DTOs.Evaluaciones;

namespace saed.api.Services
{
    public class CalificacionService
    {
        private readonly AppDbContext _context;

        public CalificacionService(AppDbContext context)
        {
            _context = context;
        }

        // ── Reporte completo del maestro desglosado por materia/grupo ─────────
        public async Task<CalificacionMaestroDto> ObtenerCalificacion(string idMaestro, int procesoId)
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

            // ── Calificación global (todas las materias ponderadas) ────────────
            var todasRespuestas = evaluaciones
                .SelectMany(e => e.Respuestas)
                .Where(r => r.Opcion != null)
                .ToList();

            var calificacionGlobal = todasRespuestas.Any()
                ? Math.Round(todasRespuestas.Average(r => r.Opcion.Valor), 2)
                : 0;

            // ── Desglosar por MateriaId + Grupo ───────────────────────────────
            var porMateria = evaluaciones
                .GroupBy(e => new { e.MateriaId, e.NombreMateria, e.Grupo })
                .Select(grupo =>
                {
                    var respuestasGrupo = grupo
                        .SelectMany(e => e.Respuestas)
                        .Where(r => r.Opcion != null)
                        .ToList();

                    var calMateria = respuestasGrupo.Any()
                        ? Math.Round(respuestasGrupo.Average(r => r.Opcion.Valor), 2)
                        : 0;

                    // Preguntas de esta materia/grupo
                    var porPregunta = respuestasGrupo
                        .GroupBy(r => r.PreguntaId)
                        .Select(g =>
                        {
                            var texto = g
                                .Select(r => r.Pregunta?.Texto)
                                .FirstOrDefault(t => !string.IsNullOrEmpty(t))
                                ?? "Sin texto";

                            return new CalificacionPreguntaDto
                            {
                                PreguntaId = g.Key,
                                TextoPregunta = texto,
                                Promedio = Math.Round(g.Average(r => r.Opcion.Valor), 2),
                                TotalRespuestas = g.Count(),
                                Distribucion = g
                                    .GroupBy(r => r.Opcion?.Texto ?? "Sin opción")
                                    .ToDictionary(d => d.Key, d => d.Count())
                            };
                        })
                        .OrderBy(p => p.PreguntaId)
                        .ToList();

                    // Comentarios de esta materia/grupo
                    var comentarios = grupo
                        .Where(e => e.Comentario != null && !string.IsNullOrWhiteSpace(e.Comentario.Texto))
                        .Select(e => e.Comentario!.Texto)
                        .ToList();

                    return new CalificacionPorMateriaDto
                    {
                        MateriaId = grupo.Key.MateriaId,
                        NombreMateria = grupo.Key.NombreMateria,
                        Grupo = grupo.Key.Grupo,
                        TotalEvaluaciones = grupo.Count(),
                        Calificacion = calMateria,
                        PorPregunta = porPregunta,
                        Comentarios = comentarios
                    };
                })
                .OrderBy(m => m.NombreMateria)
                .ToList();

            return new CalificacionMaestroDto
            {
                IdMaestro = idMaestro,
                NombreMaestro = evaluaciones.First().NombreMaestro,
                ProcesoId = procesoId,
                TotalEvaluaciones = evaluaciones.Count,
                CalificacionGlobal = calificacionGlobal,
                PorMateria = porMateria
            };
        }

        // ── Listado de maestros con calificación global ───────────────────────
        public async Task<List<ResumenCalificacionDto>> ListarCalificaciones(int procesoId)
        {
            var grupos = await _context.Evaluaciones
                .Where(e => e.ProcesoId == procesoId)
                .Include(e => e.Respuestas)
                    .ThenInclude(r => r.Opcion)
                .GroupBy(e => new { e.IdMaestro, e.NombreMaestro })
                .ToListAsync();

            return grupos.Select(g =>
            {
                var respuestas = g
                    .SelectMany(e => e.Respuestas)
                    .Where(r => r.Opcion != null)
                    .ToList();

                var totalMaterias = g
                    .Select(e => new { e.MateriaId, e.Grupo })
                    .Distinct()
                    .Count();

                return new ResumenCalificacionDto
                {
                    IdMaestro = g.Key.IdMaestro,
                    NombreMaestro = g.Key.NombreMaestro,
                    TotalEvaluaciones = g.Count(),
                    TotalMaterias = totalMaterias,
                    CalificacionGlobal = respuestas.Any()
                        ? Math.Round(respuestas.Average(r => r.Opcion.Valor), 2)
                        : 0
                };
            })
            .OrderByDescending(r => r.CalificacionGlobal)
            .ToList();
        }
    }
}