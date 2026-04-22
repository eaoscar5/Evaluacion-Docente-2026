using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EvaluacionUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evaluaciones_Procesos_ProcesoId",
                table: "Evaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_OpcionesRespuesta_OpcionId",
                table: "Respuestas");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Evaluaciones_ProcesoId",
                table: "Evaluaciones");

            migrationBuilder.AlterColumn<string>(
                name: "NombreMateria",
                table: "Evaluaciones",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "NombreMaestro",
                table: "Evaluaciones",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "MatriculaAlumno",
                table: "Evaluaciones",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "MateriaId",
                table: "Evaluaciones",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "IdMaestro",
                table: "Evaluaciones",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Grupo",
                table: "Evaluaciones",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_ProcesoId_MatriculaAlumno_IdMaestro_MateriaId",
                table: "Evaluaciones",
                columns: new[] { "ProcesoId", "MatriculaAlumno", "IdMaestro", "MateriaId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluaciones_Procesos_ProcesoId",
                table: "Evaluaciones",
                column: "ProcesoId",
                principalTable: "Procesos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_OpcionesRespuesta_OpcionId",
                table: "Respuestas",
                column: "OpcionId",
                principalTable: "OpcionesRespuesta",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId",
                principalTable: "Preguntas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
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

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Evaluaciones_ProcesoId_MatriculaAlumno_IdMaestro_MateriaId",
                table: "Evaluaciones");

            migrationBuilder.AlterColumn<string>(
                name: "NombreMateria",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "NombreMaestro",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "MatriculaAlumno",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "MateriaId",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "IdMaestro",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Grupo",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId",
                principalTable: "Preguntas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
