using Microsoft.IdentityModel.Tokens;
using saed.api.Model;
using saed.api.Security;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace saed.api.Services
{
    public class JwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        // ─── Token para usuarios Admin (base de datos local) ──────────────────
        public string GenerateToken(Usuario user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Username),
                new Claim(ClaimTypes.Role, user.Rol)
            };

            claims.AddRange(PermissionNames.BuildClaims(user));

            return BuildToken(claims);
        }

        // ─── Token para alumnos (API universitaria) ───────────────────────────
        // Guarda la matrícula y el token universitario dentro del JWT propio
        public string GenerateAlumnoToken(string matricula, string nombre, string tokenUniversidad)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, matricula),
                new Claim(ClaimTypes.Name, nombre),
                new Claim(ClaimTypes.Role, "Alumno"),
                // Guardamos el token universitario para llamar a la API escolar después
                new Claim("token_universidad", tokenUniversidad)
            };

            return BuildToken(claims);
        }

        // ─── Builder compartido ───────────────────────────────────────────────
        private string BuildToken(IEnumerable<Claim> claims)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
