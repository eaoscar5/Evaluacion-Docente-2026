using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EvaluationUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evaluaciones_Academias_AcademiaId",
                table: "Evaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Evaluaciones_Procesos_ProcesoId",
                table: "Evaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Respuestas_Preguntas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Respuestas_PreguntaId",
                table: "Respuestas");

            migrationBuilder.DropIndex(
                name: "IX_Evaluaciones_AcademiaId",
                table: "Evaluaciones");

            migrationBuilder.DropIndex(
                name: "IX_Evaluaciones_ProcesoId",
                table: "Evaluaciones");

            migrationBuilder.DropColumn(
                name: "AcademiaId",
                table: "Evaluaciones");

            migrationBuilder.DropColumn(
                name: "AlumnoMatricula",
                table: "Evaluaciones");

            migrationBuilder.RenameColumn(
                name: "Valor",
                table: "Respuestas",
                newName: "OpcionId");

            migrationBuilder.RenameColumn(
                name: "ProfesorMatricula",
                table: "Evaluaciones",
                newName: "MatriculaAlumno");

            migrationBuilder.RenameColumn(
                name: "Materia",
                table: "Evaluaciones",
                newName: "MateriaId");

            migrationBuilder.RenameColumn(
                name: "Grupo",
                table: "Evaluaciones",
                newName: "IdMaestro");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OpcionId",
                table: "Respuestas",
                newName: "Valor");

            migrationBuilder.RenameColumn(
                name: "MatriculaAlumno",
                table: "Evaluaciones",
                newName: "ProfesorMatricula");

            migrationBuilder.RenameColumn(
                name: "MateriaId",
                table: "Evaluaciones",
                newName: "Materia");

            migrationBuilder.RenameColumn(
                name: "IdMaestro",
                table: "Evaluaciones",
                newName: "Grupo");

            migrationBuilder.AddColumn<int>(
                name: "AcademiaId",
                table: "Evaluaciones",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AlumnoMatricula",
                table: "Evaluaciones",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Respuestas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_AcademiaId",
                table: "Evaluaciones",
                column: "AcademiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_ProcesoId",
                table: "Evaluaciones",
                column: "ProcesoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluaciones_Academias_AcademiaId",
                table: "Evaluaciones",
                column: "AcademiaId",
                principalTable: "Academias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluaciones_Procesos_ProcesoId",
                table: "Evaluaciones",
                column: "ProcesoId",
                principalTable: "Procesos",
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
