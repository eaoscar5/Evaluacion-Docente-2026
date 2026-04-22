using saed.api.Data.Repositories;
using saed.api.DTOs.Procesos;
using saed.api.Model;

namespace saed.api.Services
{
    public class ProcesoService
    {
        private readonly ProcesoRepository _repository;

        public ProcesoService(ProcesoRepository repository)
        {
            _repository = repository;
        }

        // ── Crear ─────────────────────────────────────────────────────────────
        public async Task<ProcesoDto> CrearProceso(CrearProcesoDto dto)
        {
            // Validar que no haya otro proceso activo
            var activo = await _repository.GetActivo();
            if (activo != null)
                throw new Exception("Ya existe un proceso activo. Ciérralo antes de crear uno nuevo.");

            // Validar periodo
            if (dto.Periodo < 1 || dto.Periodo > 3)
                throw new Exception("Periodo inválido. Debe ser 1, 2 o 3.");

            // Validar fechas
            if (dto.FechaInicio >= dto.FechaFin)
                throw new Exception("La fecha de inicio debe ser anterior a la fecha fin.");

            // Validar instrumento
            if (dto.InstrumentoId <= 0)
                throw new Exception("Debes seleccionar un instrumento de evaluación.");

            // Generar nombre automático: "Oficial N YYYY"
            var procesosDelAnio = await _repository.GetByAnio(dto.Anio);
            var consecutivo = procesosDelAnio.Any() ? procesosDelAnio.Count + 1 : 1;
            var nombre = $"Oficial {consecutivo} {dto.Anio}";

            var proceso = new Proceso
            {
                Anio = dto.Anio,
                Periodo = dto.Periodo,
                Nombre = nombre,
                FechaInicio = dto.FechaInicio,
                FechaFin = dto.FechaFin,
                Activo = true,
                InstrumentoId = dto.InstrumentoId
            };

            await _repository.Add(proceso);

            return MapToDto(proceso);
        }

        // ── Consultas ─────────────────────────────────────────────────────────
        public async Task<List<ProcesoDto>> ObtenerProcesos()
        {
            var procesos = await _repository.GetAll();
            return procesos.Select(MapToDto).ToList();
        }

        public async Task<ProcesoDto?> ObtenerActivo()
        {
            var proceso = await _repository.GetActivo();
            return proceso == null ? null : MapToDto(proceso);
        }

        public async Task<ProcesoDto> ObtenerPorId(int id)
        {
            var proceso = await _repository.GetById(id);
            if (proceso == null)
                throw new Exception("Proceso no encontrado.");

            return MapToDto(proceso);
        }

        // ── Acciones ──────────────────────────────────────────────────────────
        public async Task<ProcesoDto> CerrarProceso(int id)
        {
            var proceso = await _repository.GetById(id);

            if (proceso == null)
                throw new Exception("Proceso no encontrado.");

            if (!proceso.Activo)
                throw new Exception("El proceso ya está cerrado.");

            proceso.Activo = false;
            await _repository.Update(proceso);

            return MapToDto(proceso);
        }

        public async Task<ProcesoDto> ActivarProceso(int id)
        {
            // Cerrar el proceso activo actual si existe
            var actual = await _repository.GetActivo();
            if (actual != null && actual.Id != id)
            {
                actual.Activo = false;
                await _repository.Update(actual);
            }

            var proceso = await _repository.GetById(id);
            if (proceso == null)
                throw new Exception("Proceso no encontrado.");

            proceso.Activo = true;
            await _repository.Update(proceso);

            return MapToDto(proceso);
        }

        // ── Mapeo ─────────────────────────────────────────────────────────────
        private static ProcesoDto MapToDto(Proceso p) => new()
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Anio = p.Anio,
            Periodo = p.Periodo,
            FechaInicio = p.FechaInicio,
            FechaFin = p.FechaFin,
            Activo = p.Activo,
            InstrumentoId = p.InstrumentoId,
            NombreInstrumento = p.Instrumento?.Nombre
        };
    }
}