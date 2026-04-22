using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using saed.api.DTOs.Procesos;
using saed.api.Security;
using saed.api.Services;

namespace saed.api.Controllers
{
    [ApiController]
    [Route("api/procesos")]
    [Authorize(Policy = PolicyNames.AccesoAdministrativo)]
    public class ProcesosController : ControllerBase
    {
        private readonly ProcesoService _service;

        public ProcesosController(ProcesoService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Policy = PolicyNames.GestionProcesos)]
        public async Task<IActionResult> CrearProceso([FromBody] CrearProcesoDto dto)
        {
            try
            {
                var proceso = await _service.CrearProceso(dto);
                return Ok(proceso);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerProcesos()
        {
            var procesos = await _service.ObtenerProcesos();
            return Ok(procesos);
        }

        [HttpGet("activo")]
        public async Task<IActionResult> ObtenerActivo()
        {
            var proceso = await _service.ObtenerActivo();

            if (proceso == null)
                return NotFound(new { message = "No hay proceso activo" });

            return Ok(proceso);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            try
            {
                var proceso = await _service.ObtenerPorId(id);
                return Ok(proceso);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/cerrar")]
        [Authorize(Policy = PolicyNames.GestionProcesos)]
        public async Task<IActionResult> CerrarProceso(int id)
        {
            try
            {
                var proceso = await _service.CerrarProceso(id);
                return Ok(proceso);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/activar")]
        [Authorize(Policy = PolicyNames.GestionProcesos)]
        public async Task<IActionResult> ActivarProceso(int id)
        {
            try
            {
                var proceso = await _service.ActivarProceso(id);
                return Ok(proceso);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
