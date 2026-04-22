using saed.api.Data.Repositories;
using saed.api.DTOs.Instrumentos;
using saed.api.Model;

namespace saed.api.Services
{
    // Orquesta el flujo del modulo y hace el mapeo explicito entre DTOs y entidades.
    public class InstrumentoService
    {
        private readonly InstrumentoRepository _repository;

        public InstrumentoService(InstrumentoRepository repository)
        {
            _repository = repository;
        }

        #region Operaciones publicas

        public async Task<List<InstrumentoCreateDto>> GetAllAsync()
        {
            var instrumentos = await _repository.GetAllAsync();
            return instrumentos.Select(MapToDto).ToList();
        }

        public async Task<InstrumentoCreateDto?> GetByIdAsync(int id)
        {
            var instrumento = await _repository.GetByIdFullAsync(id);
            return instrumento == null ? null : MapToDto(instrumento);
        }

        public async Task<InstrumentoCreateDto> CreateAsync(InstrumentoCreateDto dto)
        {
            var entidad = MapToEntity(dto);
            var creado = await _repository.CreateAsync(entidad);
            return MapToDto(creado);
        }

        public async Task<InstrumentoCreateDto?> ClonePlantillaAsync(int id)
        {
            var clonado = await _repository.ClonarPlantillaAsync(id);
            return clonado == null ? null : MapToDto(clonado);
        }

        public async Task<InstrumentoCreateDto?> UpdateAsync(int id, InstrumentoCreateDto dto)
        {
            var entidad = MapToEntity(dto);
            entidad.Id = id;

            var actualizado = await _repository.UpdateAsync(entidad);
            return actualizado == null ? null : MapToDto(actualizado);
        }

        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);

        #endregion

        #region Entidad - DTO

        private static InstrumentoCreateDto MapToDto(Instrumento instrumento) => new()
        {
            Id = instrumento.Id,
            Nombre = instrumento.Nombre,
            TipoInstrumento = instrumento.TipoInstrumento,
            EsPlantilla = instrumento.EsPlantilla,
            Activo = instrumento.Activo,
            // ProcesoId eliminado
            Categorias = instrumento.Categorias
                .Select(MapCategoriaToDto)
                .ToList()
        };

        private static CategoriaDto MapCategoriaToDto(Categoria categoria) => new()
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            Orden = categoria.Orden,
            Preguntas = categoria.Preguntas
                .Select(MapPreguntaToDto)
                .ToList()
        };

        private static PreguntaDto MapPreguntaToDto(Pregunta pregunta) => new()
        {
            Id = pregunta.Id,
            Texto = pregunta.Texto,
            Tipo = pregunta.Tipo,
            Orden = pregunta.Orden,
            Opciones = pregunta.Opciones
                .Select(MapOpcionToDto)
                .ToList()
        };

        private static OpcionDto MapOpcionToDto(OpcionRespuesta opcion) => new()
        {
            Id = opcion.Id,
            Texto = opcion.Texto,
            Valor = opcion.Valor
        };

        #endregion

        #region DTO - Entidad

        private static Instrumento MapToEntity(InstrumentoCreateDto dto) => new()
        {
            Id = dto.Id,
            Nombre = dto.Nombre,
            TipoInstrumento = dto.TipoInstrumento,
            EsPlantilla = dto.EsPlantilla,
            Activo = dto.Activo,
            // ProcesoId eliminado
            Categorias = dto.Categorias
                .Select(MapCategoriaToEntity)
                .ToList()
        };

        private static Categoria MapCategoriaToEntity(CategoriaDto dto) => new()
        {
            Id = dto.Id,
            Nombre = dto.Nombre,
            Orden = dto.Orden,
            Preguntas = dto.Preguntas
                .Select(MapPreguntaToEntity)
                .ToList()
        };

        private static Pregunta MapPreguntaToEntity(PreguntaDto dto) => new()
        {
            Id = dto.Id,
            Texto = dto.Texto,
            Tipo = dto.Tipo,
            Orden = dto.Orden,
            Opciones = dto.Opciones
                .Select(MapOpcionToEntity)
                .ToList()
        };

        private static OpcionRespuesta MapOpcionToEntity(OpcionDto dto) => new()
        {
            Id = dto.Id,
            PreguntaId = 0,
            Texto = dto.Texto,
            Valor = dto.Valor
        };

        #endregion
    }
}