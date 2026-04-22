using saed.api.Model;
using System.Security.Claims;

namespace saed.api.Security
{
    public static class PermissionNames
    {
        public const string GestionUsuarios = "manage_users";
        public const string GestionInstrumentos = "manage_instruments";
        public const string GestionProcesos = "manage_processes";
        public const string VerReportes = "view_reports";

        public static IEnumerable<Claim> BuildClaims(Usuario user)
        {
            if (user.PuedeGestionarUsuarios)
                yield return new Claim("permission", GestionUsuarios);

            if (user.PuedeGestionarInstrumentos)
                yield return new Claim("permission", GestionInstrumentos);

            if (user.PuedeGestionarProcesos)
                yield return new Claim("permission", GestionProcesos);

            if (user.PuedeVerReportes)
                yield return new Claim("permission", VerReportes);
        }
    }
}
