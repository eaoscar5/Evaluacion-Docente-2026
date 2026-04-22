using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCamposDesnormalizadosEvaluacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Grupo",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NombreMaestro",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NombreMateria",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Respuestas_OpcionId",
                table: "Respuestas",
                column: "OpcionId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_ProcesoId",
                table: "Evaluaciones",
                column: "ProcesoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluaciones_Procesos_ProcesoId",
                table: "Evaluaciones",
                column: "ProcesoId",
                principalTable: "Procesos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_OpcionesRespuesta_OpcionId",
                table: "Respuestas",
                column: "OpcionId",
                principalTable: "OpcionesRespuesta",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evaluaciones_Procesos_ProcesoId",
                table: "Evaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_OpcionesRespuesta_OpcionId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Respuestas_OpcionId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Evaluaciones_ProcesoId",
                table: "Evaluaciones");

            migrationBuilder.DropColumn(
                name: "Grupo",
                table: "Evaluaciones");

            migrationBuilder.DropColumn(
                name: "NombreMaestro",
                table: "Evaluaciones");

            migrationBuilder.DropColumn(
                name: "NombreMateria",
                table: "Evaluaciones");
        }
    }
}
