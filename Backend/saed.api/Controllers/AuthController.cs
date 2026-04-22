using Microsoft.AspNetCore.Mvc;
using saed.api.DTOs.Auth;
using saed.api.Services;

namespace saed.api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _service;

        public AuthController(AuthService service)
        {
            _service = service;
        }

        [HttpPost("login-universidad")]
        public async Task<IActionResult> Login(LoginUniversidadDto dto)
        {
            var result = await _service.Login(dto);

            return Ok(result);
        }
    }
}