using Microsoft.EntityFrameworkCore;
using saed.api.Data;
using saed.api.DTOs.Usuarios;
using saed.api.Model;

namespace saed.api.Services
{
    public class UsuarioService
    {
        private readonly AppDbContext _context;

        public UsuarioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UsuarioDto>> GetAllAsync(string? q)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(term));
            }

            return await query
                .OrderByDescending(u => u.FechaCreacion)
                .Select(u => MapToDto(u))
                .ToListAsync();
        }

        public async Task<UsuarioDto?> GetByIdAsync(int id)
        {
            var usuario = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            return usuario == null ? null : MapToDto(usuario);
        }

        public async Task<UsuarioDto> CreateAsync(UsuarioCreateDto dto)
        {
            var username = NormalizeUsername(dto.Username);
            var role = NormalizeRole(dto.Rol);

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Trim().Length < 6)
                throw new InvalidOperationException("La contraseña debe tener al menos 6 caracteres.");

            var exists = await _context.Usuarios.AnyAsync(u => u.Username.ToLower() == username.ToLower());
            if (exists)
                throw new InvalidOperationException("Ya existe un usuario con ese nombre.");

            var now = DateTime.UtcNow;
            var entity = new Usuario
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password.Trim()),
                Rol = role,
                Activo = dto.Activo,
                FechaCreacion = now,
                FechaActualizacion = now
            };

            ApplyPermissions(entity, dto.PuedeGestionarUsuarios, dto.PuedeGestionarInstrumentos, dto.PuedeGestionarProcesos, dto.PuedeVerReportes);

            _context.Usuarios.Add(entity);
            await _context.SaveChangesAsync();

            return MapToDto(entity);
        }

        public async Task<UsuarioDto?> UpdateAsync(int id, UsuarioUpdateDto dto, string currentUsername)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario == null)
                return null;

            var username = NormalizeUsername(dto.Username);
            var role = NormalizeRole(dto.Rol);

            var exists = await _context.Usuarios.AnyAsync(u => u.Id != id && u.Username.ToLower() == username.ToLower());
            if (exists)
                throw new InvalidOperationException("Ya existe un usuario con ese nombre.");

            var isSelf = usuario.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase);
            if (isSelf && !dto.Activo)
                throw new InvalidOperationException("No puedes desactivarte a ti mismo.");

            await EnsureNotLastAdminAsync(usuario, role, dto.Activo);

            usuario.Username = username;
            usuario.Rol = role;
            usuario.Activo = dto.Activo;
            usuario.FechaActualizacion = DateTime.UtcNow;

            ApplyPermissions(usuario, dto.PuedeGestionarUsuarios, dto.PuedeGestionarInstrumentos, dto.PuedeGestionarProcesos, dto.PuedeVerReportes);

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                if (dto.Password.Trim().Length < 6)
                    throw new InvalidOperationException("La contraseña debe tener al menos 6 caracteres.");

                usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password.Trim());
            }

            await _context.SaveChangesAsync();
            return MapToDto(usuario);
        }

        public async Task<bool> DeleteAsync(int id, string currentUsername)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario == null)
                return false;

            if (usuario.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("No puedes eliminarte a ti mismo.");

            await EnsureNotLastAdminAsync(usuario, usuario.Rol, false);

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task EnsureNotLastAdminAsync(Usuario usuario, string targetRole, bool targetActivo)
        {
            var leavingAdmin = usuario.Rol == "Admin" && usuario.Activo && (targetRole != "Admin" || !targetActivo);
            if (!leavingAdmin)
                return;

            var activeAdmins = await _context.Usuarios.CountAsync(u => u.Rol == "Admin" && u.Activo);
            if (activeAdmins <= 1)
                throw new InvalidOperationException("No se puede dejar el sistema sin un administrador activo.");
        }

        private static void ApplyPermissions(
            Usuario usuario,
            bool puedeGestionarUsuarios,
            bool puedeGestionarInstrumentos,
            bool puedeGestionarProcesos,
            bool puedeVerReportes)
        {
            if (usuario.Rol == "Admin")
            {
                usuario.PuedeGestionarUsuarios = true;
                usuario.PuedeGestionarInstrumentos = true;
                usuario.PuedeGestionarProcesos = true;
                usuario.PuedeVerReportes = true;
                return;
            }

            usuario.PuedeGestionarUsuarios = puedeGestionarUsuarios;
            usuario.PuedeGestionarInstrumentos = puedeGestionarInstrumentos;
            usuario.PuedeGestionarProcesos = puedeGestionarProcesos;
            usuario.PuedeVerReportes = puedeVerReportes;
        }

        private static string NormalizeUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new InvalidOperationException("El nombre de usuario es obligatorio.");

            return username.Trim();
        }

        private static string NormalizeRole(string role)
        {
            var value = role?.Trim();
            return value switch
            {
                "Admin" => "Admin",
                "Gestor" => "Gestor",
                _ => throw new InvalidOperationException("Rol inválido. Usa Admin o Gestor.")
            };
        }

        private static UsuarioDto MapToDto(Usuario usuario) => new()
        {
            Id = usuario.Id,
            Username = usuario.Username,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            PuedeGestionarUsuarios = usuario.PuedeGestionarUsuarios,
            PuedeGestionarInstrumentos = usuario.PuedeGestionarInstrumentos,
            PuedeGestionarProcesos = usuario.PuedeGestionarProcesos,
            PuedeVerReportes = usuario.PuedeVerReportes,
            FechaCreacion = usuario.FechaCreacion,
            FechaActualizacion = usuario.FechaActualizacion
        };
    }
}
