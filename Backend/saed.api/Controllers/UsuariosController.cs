using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using saed.api.DTOs.Usuarios;
using saed.api.Security;
using saed.api.Services;
using System.Security.Claims;

namespace saed.api.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    [Authorize(Policy = PolicyNames.GestionUsuarios)]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioService _service;

        public UsuariosController(UsuarioService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<UsuarioDto>>> GetAll([FromQuery] string? q)
        {
            var usuarios = await _service.GetAllAsync(q);
            return Ok(usuarios);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetById(int id)
        {
            var usuario = await _service.GetByIdAsync(id);
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado." });

            return Ok(usuario);
        }

        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> Create([FromBody] UsuarioCreateDto dto)
        {
            try
            {
                var creado = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UsuarioDto>> Update(int id, [FromBody] UsuarioUpdateDto dto)
        {
            try
            {
                var actualizado = await _service.UpdateAsync(id, dto, GetCurrentUsername());
                if (actualizado == null)
                    return NotFound(new { message = "Usuario no encontrado." });

                return Ok(actualizado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var eliminado = await _service.DeleteAsync(id, GetCurrentUsername());
                if (!eliminado)
                    return NotFound(new { message = "Usuario no encontrado." });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private string GetCurrentUsername()
        {
            return User.FindFirstValue(ClaimTypes.Name)
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? string.Empty;
        }
    }
}
