import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ROUTES } from './menu-items';
import { RouteInfo } from './sidebar.metadata';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  sidebarnavItems: RouteInfo[] = [];
  showMenu    = '';
  sidebarOpen = false; // false = cerrado en mobile

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.sidebarnavItems = this.filtrarRutas(ROUTES);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleSubmenu(title: string): void {
    this.showMenu = this.showMenu === title ? '' : title;
  }

  logout(): void {
    this.authService.logout();
    this.closeSidebar();
  }

  // Cerrar sidebar al redimensionar a desktop
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if ((event.target as Window).innerWidth > 768) {
      this.sidebarOpen = false;
    }
  }

  private filtrarRutas(routes: RouteInfo[]): RouteInfo[] {
    return routes
      .map(route => {
        const submenu = route.submenu?.length ? this.filtrarRutas(route.submenu) : [];
        return { ...route, submenu };
      })
      .filter(route => this.tieneAcceso(route))
      .filter(route => route.path || route.submenu.length > 0);
  }

  private tieneAcceso(route: RouteInfo): boolean {
    const cumpleRol = !route.role || route.role.length === 0 || this.authService.hasRole(route.role);
    const cumplePermisos = !route.permissions || route.permissions.length === 0 || this.authService.hasPermissions(route.permissions);

    if (!cumpleRol || !cumplePermisos) {
      return false;
    }

    return route.submenu.length === 0 || route.path !== '' || route.submenu.length > 0;
  }
}
