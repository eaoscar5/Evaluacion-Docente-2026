using Microsoft.EntityFrameworkCore;
using saed.api.Data;
using saed.api.Model;

namespace saed.api.Seed
{
    public static class DbInitializer
    {
        public static async Task SeedAdminAsync(AppDbContext context)
        {
            //  Verificar si ya existe admin
            var adminExiste = await context.Usuarios
                .AnyAsync(u => u.Rol == "Admin");

            if (adminExiste)
                return;

            //  Crear admin
            var admin = new Usuario
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123*"),
                Rol = "Admin",
                Activo = true,
                PuedeGestionarUsuarios = true,
                PuedeGestionarInstrumentos = true,
                PuedeGestionarProcesos = true,
                PuedeVerReportes = true,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow
            };

            context.Usuarios.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}
