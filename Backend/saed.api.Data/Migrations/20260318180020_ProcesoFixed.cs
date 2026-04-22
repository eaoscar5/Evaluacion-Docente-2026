using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace saed.api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProcesoFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Procesos""
                ALTER COLUMN ""Periodo"" TYPE integer
                USING 
                 CASE 
                    WHEN ""Periodo"" = 'Septiembre - Diciembre' THEN 1
                    WHEN ""Periodo"" = 'Enero - Abril' THEN 2
                    WHEN ""Periodo"" = 'Mayo - Agosto' THEN 3
                    ELSE 0
                    END;
            ");

            migrationBuilder.AddColumn<string>(
                name: "Nombre",
                table: "Procesos",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Nombre",
                table: "Procesos");

            migrationBuilder.AlterColumn<string>(
                name: "Periodo",
                table: "Procesos",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
