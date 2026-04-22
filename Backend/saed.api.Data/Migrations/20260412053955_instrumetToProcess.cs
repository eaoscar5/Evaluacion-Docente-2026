using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class instrumetToProcess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instrumentos_Procesos_ProcesoId",
                table: "Instrumentos");

            migrationBuilder.DropIndex(
                name: "IX_Instrumentos_ProcesoId",
                table: "Instrumentos");

            migrationBuilder.DropColumn(
                name: "ProcesoId",
                table: "Instrumentos");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Procesos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "InstrumentoId",
                table: "Procesos",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Procesos_InstrumentoId",
                table: "Procesos",
                column: "InstrumentoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Procesos_Instrumentos_InstrumentoId",
                table: "Procesos",
                column: "InstrumentoId",
                principalTable: "Instrumentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Procesos_Instrumentos_InstrumentoId",
                table: "Procesos");

            migrationBuilder.DropIndex(
                name: "IX_Procesos_InstrumentoId",
                table: "Procesos");

            migrationBuilder.DropColumn(
                name: "InstrumentoId",
                table: "Procesos");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Procesos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<int>(
                name: "ProcesoId",
                table: "Instrumentos",
                type: "integer",
                nullable: true);

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
        }
    }
}
