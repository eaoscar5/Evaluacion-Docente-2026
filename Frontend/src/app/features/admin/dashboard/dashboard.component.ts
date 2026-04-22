import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProcesoService } from 'src/app/core/services/proceso.service';
import { ApiService } from 'src/app/core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class DashboardComponent implements OnInit {

  procesoActivo: any     = null;
  totalProcesos          = 0;
  totalInstrumentos      = 0;
  totalMaestrosEvaluados = 0;
  loading                = false;

  constructor(
    private procesoService: ProcesoService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;

    forkJoin({
      activo:       this.procesoService.getActivo().pipe(catchError(() => of(null))),
      procesos:     this.procesoService.getAll().pipe(catchError(() => of([]))),
      instrumentos: this.api.get<any[]>('/instrumentos').pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ activo, procesos, instrumentos }) => {
        this.procesoActivo       = activo;
        this.totalProcesos       = (procesos as any[]).length;
        this.totalInstrumentos   = (instrumentos as any[]).length;
        this.loading             = false;

        // Si hay proceso activo, cargar maestros evaluados en él
        if (activo?.id) {
          this.api.get<any[]>(`/calificaciones/procesos/${activo.id}`)
            .pipe(catchError(() => of([])))
            .subscribe(maestros => {
              this.totalMaestrosEvaluados = (maestros as any[]).length;
            });
        }
      },
      error: () => { this.loading = false; }
    });
  }

  cerrarProceso(id: number): void {
    if (!confirm('¿Cerrar el proceso activo?')) return;
    this.procesoService.cerrar(id).subscribe(() => this.cargarDatos());
  }

  periodoLabel(periodo: number): string {
    return ({ 1: 'Sep - Dic', 2: 'Ene - Abr', 3: 'May - Ago' } as any)[periodo] ?? '';
  }
}