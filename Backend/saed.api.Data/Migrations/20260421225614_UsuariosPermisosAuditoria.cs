using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UsuariosPermisosAuditoria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "Usuarios",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Rol",
                table: "Usuarios",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<bool>(
                name: "PuedeGestionarInstrumentos",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PuedeGestionarProcesos",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PuedeGestionarUsuarios",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PuedeVerReportes",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE "Usuarios"
                SET
                    "Activo" = TRUE,
                    "FechaCreacion" = CURRENT_TIMESTAMP,
                    "FechaActualizacion" = CURRENT_TIMESTAMP,
                    "PuedeGestionarUsuarios" = CASE WHEN "Rol" = 'Admin' THEN TRUE ELSE FALSE END,
                    "PuedeGestionarInstrumentos" = CASE WHEN "Rol" = 'Admin' THEN TRUE ELSE FALSE END,
                    "PuedeGestionarProcesos" = CASE WHEN "Rol" = 'Admin' THEN TRUE ELSE FALSE END,
                    "PuedeVerReportes" = CASE WHEN "Rol" = 'Admin' THEN TRUE ELSE FALSE END;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Usuarios_Username",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PuedeGestionarInstrumentos",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PuedeGestionarProcesos",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PuedeGestionarUsuarios",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PuedeVerReportes",
                table: "Usuarios");

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "Usuarios",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Rol",
                table: "Usuarios",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);
        }
    }
}
