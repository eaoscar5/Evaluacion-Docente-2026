using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using saed.api.Security;
using saed.api.Services;

namespace saed.api.Controllers
{
    [ApiController]
    [Route("api/calificaciones")]
    [Authorize(Policy = PolicyNames.VerReportes)]
    public class CalificacionesController : ControllerBase
    {
        private readonly CalificacionService _service;

        public CalificacionesController(CalificacionService service)
        {
            _service = service;
        }

        [HttpGet("procesos/{procesoId}")]
        public async Task<IActionResult> ListarPorProceso(int procesoId)
        {
            try
            {
                var resultado = await _service.ListarCalificaciones(procesoId);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("procesos/{procesoId}/maestros/{idMaestro}")]
        public async Task<IActionResult> ObtenerCalificacion(int procesoId, string idMaestro)
        {
            try
            {
                var resultado = await _service.ObtenerCalificacion(idMaestro, procesoId);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
