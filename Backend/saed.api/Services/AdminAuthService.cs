using Microsoft.EntityFrameworkCore;
using saed.api.Data;
using saed.api.Model;

namespace saed.api.Services
{
    public class AdminAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public AdminAuthService(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<string> Login(string username, string password)
        {
            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                throw new Exception("Usuario no encontrado");

            var valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

            if (!valid)
                throw new Exception("Credenciales incorrectas");

            if (!user.Activo)
                throw new Exception("El usuario está inactivo.");

            return _jwtService.GenerateToken(user);
        }
    }
}
