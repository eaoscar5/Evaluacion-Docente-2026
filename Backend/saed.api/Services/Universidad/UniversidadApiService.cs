using saed.api.DTOs.Universidad;
using System.Text;
using System.Text.Json;

namespace saed.api.Services.Universidad
{
    public class UniversidadApiService
    {
        private readonly HttpClient _http;

        private const string BaseUrl = "http://siuts.uts.edu.mx/apienlinea/api";

        public UniversidadApiService(HttpClient http)
        {
            _http = http;
        }

        private HttpRequestMessage CreateRequest(string endpoint, object body, string? token = null)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/{endpoint}");

            if (!string.IsNullOrEmpty(token))
                request.Headers.Add("Authorization", $"Bearer {token}");

            request.Content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"
            );

            return request;
        }

        private async Task<JsonElement> MakeRequest(string endpoint, object body, string? token = null)
        {
            var request = CreateRequest(endpoint, body, token);

            var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error llamando API universidad: {response.StatusCode}");

            var json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<JsonElement>(json);
        }

        public async Task<string> Authenticate(string username, string password)
        {
            var result = await MakeRequest(
                "login/authenticate",
                new
                {
                    Username = username,
                    Password = password
                }
            );

            return result.GetString()!;
        }


        public async Task<AlumnoUniversidad?> GetStudentData(string token, string matricula)
        {
            var data = await MakeRequest(
                "buscar",
                new
                {
                    sp = "Bus_DatosAlumno",
                    parametros = new[] { matricula }
                },
                token
            );


            if (data.ValueKind != JsonValueKind.Array || data.GetArrayLength() == 0)
                return null;

            var alumno = data[0];

            return new AlumnoUniversidad
            {
                Matricula = alumno[0].ToString(),
                Nombre = alumno[1].ToString(),
                ApellidoPaterno = alumno[2].ToString(),
                ApellidoMaterno = alumno[3].ToString(),
                Correo = alumno[13].ToString()
            };
            
        }

        public async Task<List<MateriaAlumnoDto>> GetStudentSubjects(string token, string matricula, int anio, int periodo)
        {
            var data = await MakeRequest(
                "buscar",
                new
                {
                    sp = "Lst_GrupoMateriaMaestroxMatriculaLinea",
                    parametros = new object[] { matricula, anio, periodo }
                },
                token
            );

            var result = new List<MateriaAlumnoDto>();

            foreach (var item in data.EnumerateArray())
            {
                result.Add(new MateriaAlumnoDto
                {
                    Grupo = item[0].ToString(),
                    NombreGrupo = item[1].ToString(),
                    IdMaestro = item[2].ToString(),
                    NombreMaestro = item[3].ToString(),
                    IdMateria = item[4].ToString(),
                    Materia = item[5].ToString()
                });
            }

            return result;
        }


        public async Task<JsonElement> GetCuatrimestres(string token)
        {
            return await MakeRequest(
                "buscar",
                new
                {
                    sp = "Lst_Cuatrimestres",
                    parametros = new object[] { -1 }
                },
                token
            );
        }
    }
}