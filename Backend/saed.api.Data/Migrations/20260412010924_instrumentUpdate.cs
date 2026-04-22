using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class instrumentUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instrumentos_Academias_AcademiaId",
                table: "Instrumentos");

            migrationBuilder.DropIndex(
                name: "IX_Instrumentos_AcademiaId",
                table: "Instrumentos");

            migrationBuilder.DropColumn(
                name: "AcademiaId",
                table: "Instrumentos");

            migrationBuilder.AlterColumn<string>(
                name: "Texto",
                table: "Preguntas",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Texto",
                table: "OpcionesRespuesta",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Instrumentos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "EsPlantilla",
                table: "Instrumentos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ProcesoId",
                table: "Instrumentos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoInstrumento",
                table: "Instrumentos",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Categorias",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Respuestas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId");

            migrationBuilder.CreateIndex(
                name: "IX_Instrumentos_ProcesoId",
                table: "Instrumentos",
                column: "ProcesoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Instrumentos_Procesos_ProcesoId",
                table: "Instrumentos",
                column: "ProcesoId",
                principalTable: "Procesos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId",
                principalTable: "Preguntas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instrumentos_Procesos_ProcesoId",
                table: "Instrumentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Respuestas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Instrumentos_ProcesoId",
                table: "Instrumentos");

            migrationBuilder.DropColumn(
                name: "EsPlantilla",
                table: "Instrumentos");

            migrationBuilder.DropColumn(
                name: "ProcesoId",
                table: "Instrumentos");

            migrationBuilder.DropColumn(
                name: "TipoInstrumento",
                table: "Instrumentos");

            migrationBuilder.AlterColumn<string>(
                name: "Texto",
                table: "Preguntas",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Texto",
                table: "OpcionesRespuesta",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(300)",
                oldMaxLength: 300);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Instrumentos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<int>(
                name: "AcademiaId",
                table: "Instrumentos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Categorias",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_Instrumentos_AcademiaId",
                table: "Instrumentos",
                column: "AcademiaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Instrumentos_Academias_AcademiaId",
                table: "Instrumentos",
                column: "AcademiaId",
                principalTable: "Academias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
