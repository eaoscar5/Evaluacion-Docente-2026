using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace saed.api.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public string Matricula { get; set; } = string.Empty;
        public string Nombre {  get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;
    }
}
