using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using saed.api.DTOs.Evaluaciones;
using saed.api.Security;
using saed.api.Services;

namespace saed.api.Controllers
{
    [ApiController]
    [Route("api/evaluaciones")]
    [Authorize]
    public class EvaluacionesController : ControllerBase
    {
        private readonly EvaluacionService _service;

        public EvaluacionesController(EvaluacionService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Roles = "Alumno")]
        public async Task<IActionResult> Crear([FromBody] CrearEvaluacionDto dto)
        {
            try
            {
                var resultado = await _service.CrearEvaluacion(dto);
                return Ok(resultado);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("disponibles")]
        [Authorize(Roles = "Alumno")]
        public async Task<IActionResult> ObtenerDisponibles()
        {
            try
            {
                var result = await _service.ObtenerDisponibles();
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("procesos/{procesoId}/maestros")]
        [Authorize(Policy = PolicyNames.VerReportes)]
        public async Task<IActionResult> ListarMaestros(int procesoId)
        {
            try
            {
                var result = await _service.ListarMaestrosPorProceso(procesoId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("procesos/{procesoId}/maestros/{idMaestro}/reporte")]
        [Authorize(Policy = PolicyNames.VerReportes)]
        public async Task<IActionResult> ReporteMaestro(int procesoId, string idMaestro)
        {
            try
            {
                var reporte = await _service.ObtenerReporteMaestro(idMaestro, procesoId);
                return Ok(reporte);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
