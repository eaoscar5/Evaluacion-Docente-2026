import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="layout-wrapper" [class.layout-alumno]="esAlumno">
      <app-sidebar *ngIf="!esAlumno"></app-sidebar>
      <main class="layout-content" [class.content-sin-sidebar]="esAlumno">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background: #f8fffe;
    }

    /* Desktop — empuja el contenido 240px */
    .layout-content {
      flex: 1;
      margin-left: 240px;
      min-height: 100vh;
      background: #f8fffe;
    }

    /* Mobile — sin margen, el sidebar flota encima */
    @media (max-width: 768px) {
      .layout-content {
        margin-left: 0;
        padding-top: 3.5rem; /* espacio para el botón hamburguesa */
      }
    }

    /* Alumno — sin sidebar */
    .content-sin-sidebar {
      margin-left: 0 !important;
      padding-top: 0 !important;
      background: #e6f6f3;
    }
  `]
})
export class FullComponent implements OnInit {
  esAlumno = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const sesion = this.authService.getSesion();
    this.esAlumno = sesion?.rol === 'Alumno';
  }
}