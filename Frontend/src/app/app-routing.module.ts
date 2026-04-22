import { Routes } from '@angular/router';
import { FullComponent } from './pages/layouts/full/full.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { LogoutComponent } from './pages/auth/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';


export const Approutes: Routes = [
  // ─── Rutas públicas ────────────────────────────────────────────────────────
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '404',
    component: NotFoundComponent,
  },

  // ─── Rutas protegidas dentro del layout shell (FullComponent) ──────────────
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // Dashboard → solo Admin
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Gestor'] },
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/usuarios/usuarios-list/usuarios-list.component').then((m) => m.UsuariosListComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Gestor'], permissions: ['manage_users'] },
      },
      {
        path: 'instrumentos',
        loadComponent: () =>
          import('./features/admin/instrumentos/instrumento-list/instrumento-list.component').then((m) => m.InstrumentoListComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Gestor'], permissions: ['manage_instruments'] },
      },
      {
        path: 'procesos',
        loadComponent: () =>
          import('./features/admin/procesos/procesos-list/procesos-list.component').then((m) => m.ProcesosListComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Gestor'], permissions: ['manage_processes'] },
      },
      {
        path: 'nuevoinstrumento',
        loadComponent: () =>
          import('./features/admin/instrumentos/instrumento-editor/instrumento-editor.component').then((m) => m.InstrumentoEditorComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Gestor'], permissions: ['manage_instruments'] },
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/admin/maestros-proceso/maestros-proceso.component').then((m) => m.MaestrosProcesoComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Gestor'], permissions: ['view_reports'] }
      },
      // Componentes → Admin y Alumno
      {
        path: 'inicio-alumno',
        loadComponent: () =>
          import('./features/alumno/inicio-alumno/inicio-alumno.component').then((m) => m.InicioAlumnoComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Alumno'] },
      },
      {
        path: 'evaluar',
        loadComponent: () =>
          import('./features/alumno/evaluar/evaluar.component').then((m) => m.EvaluarComponent),
        canActivate: [AuthGuard],
        data: { roles: ['Alumno'] },
      },

    ],
  },

  // Logout fuera del shell
  {
    path: 'logout',
    component: LogoutComponent,
    canActivate: [AuthGuard],
  },

  // ─── Wildcard ──────────────────────────────────────────────────────────────
  {
    path: '**',
    component: NotFoundComponent,
  },
];
