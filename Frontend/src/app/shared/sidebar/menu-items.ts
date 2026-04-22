import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [

  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: 'bi bi-speedometer2',
    role: ['Admin', 'Gestor'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/usuarios',
    title: 'Usuarios',
    icon: 'bi bi-people',
    role: ['Admin', 'Gestor'],
    permissions: ['manage_users'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '',
    title: 'Instrumentos',
    icon: 'bi bi-clipboard-check',
    role: ['Admin', 'Gestor'],
    permissions: ['manage_instruments'],
    class: '',
    extralink: false,
    submenu: [
      {
        path: '/instrumentos',
        title: 'Lista de instrumentos',
        icon: 'bi bi-list-ul',
        role: ['Admin', 'Gestor'],
        permissions: ['manage_instruments'],
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/nuevoinstrumento',
        title: 'Nuevo instrumento',
        icon: 'bi bi-plus-circle',
        role: ['Admin', 'Gestor'],
        permissions: ['manage_instruments'],
        class: '',
        extralink: false,
        submenu: []
      }
    ]
  },
  {
    path: '/procesos',
    title: 'Procesos',
    icon: 'bi bi-calendar-check',
    role: ['Admin', 'Gestor'],
    permissions: ['manage_processes'],
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/reportes',
    title: 'Reportes',
    icon: 'bi bi-bar-chart-line',
    role: ['Admin', 'Gestor'],
    permissions: ['view_reports'],
    class: '',
    extralink: false,
    submenu: []
  },
];
