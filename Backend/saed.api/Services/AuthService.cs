using saed.api.DTOs.Auth;
using saed.api.Services.Universidad;

namespace saed.api.Services
{
    public class AuthService
    {
        private readonly UniversidadApiService _universidad;
        private readonly JwtService _jwtService;

        public AuthService(UniversidadApiService universidad, JwtService jwtService)
        {
            _universidad = universidad;
            _jwtService = jwtService;
        }

        public async Task<LoginResponseDto> Login(LoginUniversidadDto dto)
        {
            // 1. Autenticar contra la API universitaria → obtenemos su token externo
            var tokenUniversidad = await _universidad.Authenticate(dto.Username, dto.Password);

            // 2. Obtener datos del alumno
            var alumno = await _universidad.GetStudentData(tokenUniversidad, dto.Username);

            if (alumno == null)
                throw new Exception("Usuario no pertenece a la universidad");

            var nombre = $"{alumno.Nombre} {alumno.ApellidoPaterno}";

            // 3. Generar nuestro propio JWT con la matrícula como claim
            //    El token universitario viaja dentro del JWT para usarlo en llamadas posteriores
            var jwtPropio = _jwtService.GenerateAlumnoToken(alumno.Matricula, nombre, tokenUniversidad);

            return new LoginResponseDto
            {
                Matricula = alumno.Matricula,
                Nombre = nombre,
                Rol = "Alumno",
                Token = jwtPropio   // ← ahora devolvemos nuestro JWT, no el universitario
            };
        }
    }
}