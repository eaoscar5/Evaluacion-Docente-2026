using Microsoft.EntityFrameworkCore;
using saed.api.Model;

namespace saed.api.Data.Repositories
{
    // Centraliza la logica del grafo Instrumento y sus reglas de integridad.
    public class InstrumentoRepository
    {
        private readonly AppDbContext _context;

        public InstrumentoRepository(AppDbContext context)
        {
            _context = context;
        }

        #region Consultas

        // Carga el instrumento con categorias, preguntas y opciones para operar sobre el grafo completo.
        public async Task<Instrumento?> GetByIdFullAsync(int id)
        {
            var instrumento = await _context.Instrumentos
                .AsSplitQuery()
                .Include(i => i.Categorias)
                    .ThenInclude(c => c.Preguntas)
                        .ThenInclude(p => p.Opciones)
                .FirstOrDefaultAsync(i => i.Id == id);

            OrdenarGrafo(instrumento);
            return instrumento;
        }

        public async Task<List<Instrumento>> GetAllAsync()
        {
            var instrumentos = await _context.Instrumentos
                .AsSplitQuery()
                .Include(i => i.Categorias)
                    .ThenInclude(c => c.Preguntas)
                        .ThenInclude(p => p.Opciones)
                .ToListAsync();

            foreach (var instrumento in instrumentos)
                OrdenarGrafo(instrumento);

            return instrumentos;
        }

        #endregion

        #region Escrituras

        // Crea el instrumento junto con todo su arbol de categorías, preguntas y opciones.
        public async Task<Instrumento> CreateAsync(Instrumento instrumento)
        {
            _context.Instrumentos.Add(instrumento);
            await _context.SaveChangesAsync();

            return await GetByIdFullAsync(instrumento.Id) ?? instrumento;
        }

        public async Task<Instrumento?> ClonarPlantillaAsync(int plantillaId)
        {
            var plantilla = await _context.Instrumentos
                .Include(i => i.Categorias)
                    .ThenInclude(c => c.Preguntas)
                        .ThenInclude(p => p.Opciones)
                .FirstOrDefaultAsync(i => i.Id == plantillaId);

            if (plantilla == null)
                return null;

            var nuevo = new Instrumento
            {
                Nombre = plantilla.Nombre + " - copia",
                TipoInstrumento = plantilla.TipoInstrumento,
                EsPlantilla = true,
                Activo = true,
                // ProcesoId eliminado — el instrumento no conoce al proceso
            };

            foreach (var categoria in plantilla.Categorias)
            {
                var nuevaCategoria = new Categoria
                {
                    Nombre = categoria.Nombre,
                    Orden = categoria.Orden
                };

                foreach (var pregunta in categoria.Preguntas)
                {
                    var nuevaPregunta = new Pregunta
                    {
                        Texto = pregunta.Texto,
                        Tipo = pregunta.Tipo,
                        Orden = pregunta.Orden
                    };

                    foreach (var opcion in pregunta.Opciones)
                    {
                        nuevaPregunta.Opciones.Add(new OpcionRespuesta
                        {
                            Valor = opcion.Valor,
                            Texto = opcion.Texto
                        });
                    }

                    nuevaCategoria.Preguntas.Add(nuevaPregunta);
                }

                nuevo.Categorias.Add(nuevaCategoria);
            }

            _context.Instrumentos.Add(nuevo);
            await _context.SaveChangesAsync();

            return await GetByIdFullAsync(nuevo.Id);
        }

        // Sincroniza el payload recibido contra el grafo persistido.
        public async Task<Instrumento?> UpdateAsync(Instrumento instrumento)
        {
            ValidatePayload(instrumento);

            var existente = await LoadExistingAsync(instrumento.Id);
            if (existente == null)
                return null;

            var categoriasEntrantesIds = GetCategoriasEntrantesIds(instrumento);
            var preguntasEntrantesIds = GetPreguntasEntrantesIds(instrumento);

            ValidateDuplicateIds(categoriasEntrantesIds, preguntasEntrantesIds);

            await using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                await ApplyOrdenConflictFixAsync(existente);

                ApplyInstrumentoUpdates(existente, instrumento);

                var categoriasExistentesPorId = BuildCategoriasExistentesPorId(existente);
                var preguntasExistentesPorId = BuildPreguntasExistentesPorId(existente);

                SyncCategoriasPreguntasOpciones(
                    existente,
                    instrumento,
                    categoriasExistentesPorId,
                    preguntasExistentesPorId);

                DeleteRemovedEntities(existente, categoriasEntrantesIds, preguntasEntrantesIds);

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }

            return await GetByIdFullAsync(existente.Id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existente = await GetByIdFullAsync(id);
            if (existente == null)
                return false;

            _context.Instrumentos.Remove(existente);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Validación del payload

        private static void ValidatePayload(Instrumento instrumento)
        {
            if (instrumento.Categorias == null)
                throw new InvalidOperationException("Categorías no enviadas.");

            if (!instrumento.Categorias.Any())
                throw new InvalidOperationException("Un instrumento no puede quedarse sin categorías.");

            NormalizeOrden(instrumento);
            ValidateCategoriasEntrantes(instrumento);
        }

        private static void NormalizeOrden(Instrumento instrumento)
        {
            instrumento.Categorias = instrumento.Categorias
                .OrderBy(c => c.Orden)
                .ToList();

            for (int i = 0; i < instrumento.Categorias.Count; i++)
            {
                var categoria = instrumento.Categorias.ElementAt(i);
                categoria.Orden = i + 1;

                if (categoria.Preguntas == null)
                    categoria.Preguntas = new List<Pregunta>();

                if (!categoria.Preguntas.Any())
                    throw new InvalidOperationException("Cada categoría debe tener al menos una pregunta.");

                categoria.Preguntas = categoria.Preguntas
                    .OrderBy(p => p.Orden)
                    .ToList();

                for (int j = 0; j < categoria.Preguntas.Count; j++)
                    categoria.Preguntas.ElementAt(j).Orden = j + 1;
            }
        }

        private static void ValidateCategoriasEntrantes(Instrumento instrumento)
        {
            foreach (var categoria in instrumento.Categorias)
            {
                if (categoria.Id == 0 && string.IsNullOrWhiteSpace(categoria.Nombre))
                    throw new InvalidOperationException("No puedes enviar una categoría vacía o sin identificación.");
            }
        }

        #endregion

        #region Carga y validación de ids

        private async Task<Instrumento?> LoadExistingAsync(int id)
        {
            return await _context.Instrumentos
                .AsSplitQuery()
                .Include(i => i.Categorias)
                    .ThenInclude(c => c.Preguntas)
                        .ThenInclude(p => p.Opciones)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        private static List<int> GetCategoriasEntrantesIds(Instrumento instrumento)
        {
            return instrumento.Categorias
                .Where(c => c.Id != 0)
                .Select(c => c.Id)
                .ToList();
        }

        private static List<int> GetPreguntasEntrantesIds(Instrumento instrumento)
        {
            return instrumento.Categorias
                .SelectMany(c => c.Preguntas ?? new List<Pregunta>())
                .Where(p => p.Id != 0)
                .Select(p => p.Id)
                .ToList();
        }

        private static void ValidateDuplicateIds(List<int> categoriasEntrantesIds, List<int> preguntasEntrantesIds)
        {
            if (categoriasEntrantesIds.Count != categoriasEntrantesIds.Distinct().Count())
                throw new InvalidOperationException("Hay categorías duplicadas en el payload.");

            if (preguntasEntrantesIds.Count != preguntasEntrantesIds.Distinct().Count())
                throw new InvalidOperationException("Hay preguntas duplicadas en el payload.");
        }

        #endregion

        #region Reglas del instrumento

        // Desplaza temporalmente los órdenes para evitar choques al reordenar dentro de la misma transacción.
        private async Task ApplyOrdenConflictFixAsync(Instrumento existente)
        {
            foreach (var categoria in existente.Categorias)
                categoria.Orden += 1000;

            foreach (var pregunta in existente.Categorias.SelectMany(c => c.Preguntas))
                pregunta.Orden += 1000;

            await _context.SaveChangesAsync();
        }

        private static void ApplyInstrumentoUpdates(Instrumento existente, Instrumento instrumento)
        {
            existente.Nombre = instrumento.Nombre;
            existente.TipoInstrumento = instrumento.TipoInstrumento;
            existente.EsPlantilla = instrumento.EsPlantilla;
            existente.Activo = instrumento.Activo;
            // ProcesoId eliminado — ya no vive en el instrumento
        }

        #endregion

        #region Sincronización del grafo

        private static Dictionary<int, Categoria> BuildCategoriasExistentesPorId(Instrumento existente)
        {
            return existente.Categorias.ToDictionary(c => c.Id);
        }

        private static Dictionary<int, Pregunta> BuildPreguntasExistentesPorId(Instrumento existente)
        {
            return existente.Categorias
                .SelectMany(c => c.Preguntas)
                .ToDictionary(p => p.Id);
        }

        private void SyncCategoriasPreguntasOpciones(
            Instrumento existente,
            Instrumento instrumento,
            Dictionary<int, Categoria> categoriasExistentesPorId,
            Dictionary<int, Pregunta> preguntasExistentesPorId)
        {
            foreach (var categoria in instrumento.Categorias)
            {
                Categoria categoriaDestino;

                if (categoria.Id == 0)
                {
                    categoriaDestino = new Categoria
                    {
                        Nombre = categoria.Nombre,
                        Orden = categoria.Orden
                    };
                    existente.Categorias.Add(categoriaDestino);
                }
                else
                {
                    if (!categoriasExistentesPorId.TryGetValue(categoria.Id, out categoriaDestino!))
                        continue;

                    categoriaDestino.Nombre = categoria.Nombre;
                    categoriaDestino.Orden = categoria.Orden;
                }

                var preguntasEntrantes = categoria.Preguntas ?? new List<Pregunta>();

                foreach (var pregunta in preguntasEntrantes)
                {
                    if (pregunta.Id == 0)
                    {
                        var nuevaPregunta = new Pregunta
                        {
                            Texto = pregunta.Texto,
                            Tipo = pregunta.Tipo,
                            Orden = pregunta.Orden
                        };

                        foreach (var opcion in pregunta.Opciones ?? new List<OpcionRespuesta>())
                        {
                            nuevaPregunta.Opciones.Add(new OpcionRespuesta
                            {
                                Valor = opcion.Valor,
                                Texto = opcion.Texto
                            });
                        }

                        categoriaDestino.Preguntas.Add(nuevaPregunta);
                    }
                    else
                    {
                        if (!preguntasExistentesPorId.TryGetValue(pregunta.Id, out var preguntaExistente))
                            continue;

                        // Mover pregunta de categoría si cambió
                        if (preguntaExistente.CategoriaId != categoriaDestino.Id)
                        {
                            var categoriaActual = existente.Categorias.FirstOrDefault(c => c.Id == preguntaExistente.CategoriaId);
                            categoriaActual?.Preguntas.Remove(preguntaExistente);

                            if (!categoriaDestino.Preguntas.Contains(preguntaExistente))
                                categoriaDestino.Preguntas.Add(preguntaExistente);

                            preguntaExistente.Categoria = categoriaDestino;
                        }

                        preguntaExistente.Texto = pregunta.Texto;
                        preguntaExistente.Tipo = pregunta.Tipo;
                        preguntaExistente.Orden = pregunta.Orden;

                        SyncOpciones(preguntaExistente, pregunta);
                    }
                }
            }
        }

        // Mantiene en sincronía la colección de opciones de una pregunta existente.
        private void SyncOpciones(Pregunta preguntaExistente, Pregunta pregunta)
        {
            var opcionesEntrantes = pregunta.Opciones ?? new List<OpcionRespuesta>();
            var opcionesEntrantesIds = opcionesEntrantes
                .Where(o => o.Id != 0)
                .Select(o => o.Id)
                .ToHashSet();

            var opcionesAEliminar = opcionesEntrantesIds.Count == 0
                ? preguntaExistente.Opciones.ToList()
                : preguntaExistente.Opciones
                    .Where(o => !opcionesEntrantesIds.Contains(o.Id))
                    .ToList();

            foreach (var opcionRemovida in opcionesAEliminar)
                _context.OpcionesRespuesta.Remove(opcionRemovida);

            foreach (var opcion in opcionesEntrantes)
            {
                if (opcion.Id == 0)
                {
                    preguntaExistente.Opciones.Add(new OpcionRespuesta
                    {
                        Valor = opcion.Valor,
                        Texto = opcion.Texto
                    });
                }
                else
                {
                    var opcionExistente = preguntaExistente.Opciones.FirstOrDefault(o => o.Id == opcion.Id);
                    if (opcionExistente == null)
                        continue;

                    opcionExistente.Texto = opcion.Texto;
                    opcionExistente.Valor = opcion.Valor;
                }
            }
        }

        private void DeleteRemovedEntities(Instrumento existente, List<int> categoriasEntrantesIds, List<int> preguntasEntrantesIds)
        {
            var categoriasEntrantesSet = categoriasEntrantesIds.ToHashSet();
            var preguntasEntrantesSet = preguntasEntrantesIds.ToHashSet();

            var preguntasAEliminar = existente.Categorias
                .SelectMany(c => c.Preguntas)
                .Where(p => p.Id != 0 && !preguntasEntrantesSet.Contains(p.Id))
                .ToList();

            foreach (var p in preguntasAEliminar)
                _context.Preguntas.Remove(p);

            var categoriasAEliminar = existente.Categorias
                .Where(c => c.Id != 0 && !categoriasEntrantesSet.Contains(c.Id))
                .ToList();

            foreach (var c in categoriasAEliminar)
                _context.Categorias.Remove(c);
        }

        #endregion

        #region Orden de salida

        // Ordena el grafo antes de devolverlo a capas superiores para respuesta estable.
        private static void OrdenarGrafo(Instrumento? instrumento)
        {
            if (instrumento == null)
                return;

            instrumento.Categorias = (instrumento.Categorias ?? new List<Categoria>())
                .OrderBy(c => c.Orden)
                .ToList();

            foreach (var categoria in instrumento.Categorias)
            {
                categoria.Preguntas = (categoria.Preguntas ?? new List<Pregunta>())
                    .OrderBy(p => p.Orden)
                    .ToList();

                foreach (var pregunta in categoria.Preguntas)
                {
                    pregunta.Opciones = (pregunta.Opciones ?? new List<OpcionRespuesta>())
                        .OrderBy(o => o.Valor)
                        .ToList();
                }
            }
        }

        #endregion
    }
}