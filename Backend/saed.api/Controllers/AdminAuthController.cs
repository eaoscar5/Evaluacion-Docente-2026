using Microsoft.AspNetCore.Mvc;
using saed.api.DTOs.Auth;
using saed.api.Services;

[ApiController]
[Route("api/admin/auth")]
public class AdminAuthController : ControllerBase
{
    private readonly AdminAuthService _service;

    public AdminAuthController(AdminAuthService service)
    {
        _service = service;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var token = await _service.Login(dto.Username, dto.Password);
        return Ok(new { token });
    }
}