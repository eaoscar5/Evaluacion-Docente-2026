using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using saed.api.Data;
using saed.api.Data.Repositories;
using saed.api.Seed;
using saed.api.Security;
using saed.api.Services;
using saed.api.Services.Universidad;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Evita que .NET remapee claims JWT a nombres internos de Microsoft.
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
        opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AdminAuthService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProcesoService>();
builder.Services.AddScoped<EvaluacionService>();
builder.Services.AddScoped<InstrumentoService>();
builder.Services.AddScoped<CalificacionService>();
builder.Services.AddScoped<UsuarioService>();

builder.Services.AddScoped<ProcesoRepository>();
builder.Services.AddScoped<InstrumentoRepository>();

builder.Services.AddHttpClient();
builder.Services.AddHttpClient<UniversidadApiService>();
builder.Services.AddHttpContextAccessor();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.AccesoAdministrativo, policy =>
        policy.RequireRole("Admin", "Gestor"));

    options.AddPolicy(PolicyNames.GestionUsuarios, policy =>
        policy.RequireRole("Admin", "Gestor")
              .RequireClaim("permission", PermissionNames.GestionUsuarios));

    options.AddPolicy(PolicyNames.GestionInstrumentos, policy =>
        policy.RequireRole("Admin", "Gestor")
              .RequireClaim("permission", PermissionNames.GestionInstrumentos));

    options.AddPolicy(PolicyNames.GestionProcesos, policy =>
        policy.RequireRole("Admin", "Gestor")
              .RequireClaim("permission", PermissionNames.GestionProcesos));

    options.AddPolicy(PolicyNames.VerReportes, policy =>
        policy.RequireRole("Admin", "Gestor")
              .RequireClaim("permission", PermissionNames.VerReportes));
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SAED", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingrese el token JWT: Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAdminAsync(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
