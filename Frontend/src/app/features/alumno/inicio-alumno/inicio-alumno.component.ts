import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  EvaluacionService,
  EvaluacionDisponibleDto
} from '../../../core/services/evaluacion.service';

@Component({
  selector: 'app-inicio-alumno',
  standalone: true,
  templateUrl: './inicio-alumno.component.html',
  styleUrl: './inicio-alumno.component.scss',
  imports: [CommonModule, RouterModule, FormsModule],
})
export class InicioAlumnoComponent implements OnInit {

  evaluaciones:          EvaluacionDisponibleDto[] = [];
  evaluacionesFiltradas: EvaluacionDisponibleDto[] = [];
  loading    = false;
  errorMsg   = '';
  busqueda   = '';
  mostrarModal = true; // modal de bienvenida

  sesion = this.authService.getSesion();

  constructor(
    private evaluacionService: EvaluacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading  = true;
    this.errorMsg = '';

    this.evaluacionService.getDisponibles().subscribe({
      next: (data) => {
        this.evaluaciones          = data;
        this.evaluacionesFiltradas = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'No se pudieron cargar las evaluaciones.';
        this.loading  = false;
      },
    });
  }

  filtrar(): void {
    const q = this.busqueda.toLowerCase().trim();
    this.evaluacionesFiltradas = q
      ? this.evaluaciones.filter(e =>
          e.nombreMaestro.toLowerCase().includes(q) ||
          e.materia.toLowerCase().includes(q)
        )
      : [...this.evaluaciones];
  }

  irAEvaluar(evaluacion: EvaluacionDisponibleDto): void {
    if (evaluacion.yaEvaluado) return;
    this.router.navigate(['evaluar'], { state: { evaluacion } });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  logout(): void {
    this.authService.logout();
  }

  get totalEvaluaciones(): number { return this.evaluaciones.length; }
  get totalEvaluadas(): number    { return this.evaluaciones.filter(e => e.yaEvaluado).length; }
  get todasCompletadas(): boolean { return this.totalEvaluaciones > 0 && this.totalEvaluadas === this.totalEvaluaciones; }
}