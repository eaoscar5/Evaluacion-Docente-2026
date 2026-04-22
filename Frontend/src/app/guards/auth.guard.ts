import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.authService.estaAutenticado()) {
      return this.router.createUrlTree(['/login']);
    }

    const sesion = this.authService.getSesion();
    const rolActual = sesion?.rol;
    const rolesPermitidos = route.data['roles'] as string[] | undefined;
    const permissions = route.data['permissions'] as string[] | undefined;

    if (rolesPermitidos && rolesPermitidos.length > 0) {
      const tieneAcceso = rolesPermitidos.includes(rolActual ?? '');
      if (!tieneAcceso) {
        return this.dashboardPorRol(rolActual);
      }
    }

    if (permissions && permissions.length > 0 && !this.authService.hasPermissions(permissions)) {
      return this.dashboardPorRol(rolActual);
    }

    return true;
  }

  private dashboardPorRol(rol?: string): UrlTree {
    switch (rol) {
      case 'Admin':
      case 'Gestor':
        return this.router.createUrlTree(['/dashboard']);
      case 'Alumno':
        return this.router.createUrlTree(['/inicio-alumno']);
      default:
        return this.router.createUrlTree(['/login']);
    }
  }
}
