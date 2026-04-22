import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ResultadosService } from 'src/app/services/resultados.service';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss'],
  providers: [MessageService],
})
export class ResultadosComponent implements OnInit {
  maestros: any[] = []; // Lista de maestros obtenidos del servicio
  resultadosBusqueda: any[] = []; // Lista filtrada de maestros
  selectedCards: any[] = []; // Maestros seleccionados
  nombreBusqueda: string = ''; // Término de búsqueda

  carreras: any[] = [
    { name: 'TIC', code: 'TIC' },
    { name: 'MA', code: 'MA' },
    { name: 'MAMP', code: 'MAMP' },
    { name: 'PI', code: 'PI' },
    { name: 'TIDSM', code: 'IDYGS' },
  ];

  periodos: any[] = [
    { nameP: 'Periodo 1 (Sep-Dic)', codeP: '1' },
    { nameP: 'Periodo 2 (Ene-Abr)', codeP: '2' },
    { nameP: 'Periodo 3 (May-Ago)', codeP: '3' },
  ];

  selectedCarrera?: string;
  selectedPeriodo?: string;
  anio: number = new Date().getFullYear();

  constructor(
    private resultadosService: ResultadosService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Podrías cargar algo por defecto si quieres
  }

  obtenerMaestros(): void {
    if (!this.selectedCarrera || !this.selectedPeriodo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Selecciona una carrera y un período',
      });
      return;
    }

    // this.resultadosService
    //   .getMaestrosPorCarreraYPeriodo(this.selectedCarrera, this.anio, this.selectedPeriodo)
    //   .subscribe({
    //     next: (maestros) => {
    //       // Mapeo para asegurar consistencia con el HTML
    //       this.maestros = maestros.map((m: any) => ({
    //         nombre: m.nombre || m.Nombre || 'Sin nombre',
    //         id: m.id || m.ID || 'Desconocido',
    //         calificacion: m.calificacion || m.Calificacion || 0,
    //         carrera: m.carrera || m.Carrera || 'Sin carrera',
    //       }));
    //       this.resultadosBusqueda = [...this.maestros];

    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Éxito',
    //         detail: 'Maestros cargados correctamente',
    //       });
    //     },
    //     error: (error) => {
    //       console.error('Error al obtener maestros', error);
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Error',
    //         detail: 'No se pudieron cargar los maestros',
    //       });
    //     },
    //   });
  }

  buscarMaestro(): void {
    const termino = this.nombreBusqueda.trim().toLowerCase();
    this.resultadosBusqueda = termino
      ? this.maestros.filter((m) => m.nombre.toLowerCase().includes(termino))
      : [...this.maestros];
  }

  seleccionarTodo(): void {
    this.selectedCards =
      this.selectedCards.length === this.maestros.length ? [] : [...this.maestros];
  }

  actualizar(): void {
    this.obtenerMaestros();
  }

  selectCard(maestro: any): void {
    const index = this.selectedCards.indexOf(maestro);
    index > -1
      ? this.selectedCards.splice(index, 1)
      : this.selectedCards.push(maestro);
  }
}
