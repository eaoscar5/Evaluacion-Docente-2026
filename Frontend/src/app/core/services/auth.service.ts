import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginResponseDto,
  RolUsuario,
  UsuarioSesion,
} from '../../pages/auth/models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly SESSION_KEY = 'saed_usuario';
  private readonly ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private readonly NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
  private readonly PERMISSION_CLAIM = 'permission';

  private readonly MATRICULA_REGEX = /^[a-zA-Z]\d{8,}$/;
  private readonly EMPLEADO_REGEX  = /^\d{6,}$/;

  constructor(private http: HttpClient, private router: Router) {}

  private esUsuarioInstitucional(credencial: string): boolean {
    return (
      this.MATRICULA_REGEX.test(credencial) ||
      this.EMPLEADO_REGEX.test(credencial)
    );
  }

  login(credencial: string, password: string): Observable<any> {
    if (this.esUsuarioInstitucional(credencial)) {
      return this.loginEscolar(credencial, password);
    } else {
      return this.loginAdmin(credencial, password);
    }
  }

  // ── Login Escolar ─────────────────────────────────────────────────────────
  private loginEscolar(username: string, password: string): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${environment.apiUrl}/auth/login-universidad`, { username, password })
      .pipe(
        tap((res) => {
          const tokenInfo = this.extraerInfoToken(res.token);
          const sesion: UsuarioSesion = {
            username: tokenInfo.username || res.matricula,
            nombre:   tokenInfo.nombre || res.nombre,
            rol:      tokenInfo.rol || res.rol as RolUsuario,
            token:    res.token,
            permisos: tokenInfo.permisos,
          };
          this.guardarSesion(sesion);
        }),
        catchError((err) =>
          throwError(() => new Error(err?.error?.message ?? 'Error al iniciar sesión escolar'))
        )
      );
  }

  // ── Login Admin ───────────────────────────────────────────────────────────
  // El backend devuelve { "token": "eyJ..." } como JSON
  private loginAdmin(username: string, password: string): Observable<any> {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/admin/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          const tokenString = typeof res === 'string'
            ? (res as string).replace(/^"|"$/g, '')
            : res.token;
          const tokenInfo = this.extraerInfoToken(tokenString);

          const sesion: UsuarioSesion = {
            username: tokenInfo.username || username,
            nombre: tokenInfo.nombre,
            rol: tokenInfo.rol || 'Admin',
            token: tokenString,
            permisos: tokenInfo.permisos,
          };
          this.guardarSesion(sesion);
        }),
        catchError((err) =>
          throwError(() => new Error(err?.error?.message ?? err?.error ?? 'Credenciales incorrectas'))
        )
      );
  }

  // ── Helpers de sesión ─────────────────────────────────────────────────────
  private guardarSesion(sesion: UsuarioSesion): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sesion));
  }

  getSesion(): UsuarioSesion | null {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  getToken(): string | null {
    return this.getSesion()?.token ?? null;
  }

  estaAutenticado(): boolean {
    try {
      return !!this.getToken();
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/login']);
  }

  hasRole(roles: string[]): boolean {
    const sesion = this.getSesion();
    return roles.includes(sesion?.rol ?? '');
  }

  hasPermission(permission: string): boolean {
    const sesion = this.getSesion();
    return !!permission && !!sesion?.permisos?.includes(permission);
  }

  hasPermissions(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    const sesion = this.getSesion();
    const actuales = sesion?.permisos ?? [];
    return permissions.every(permission => actuales.includes(permission));
  }

  private extraerInfoToken(token: string): { username: string; nombre?: string; rol?: RolUsuario; permisos: string[] } {
    const payload = this.parseJwtPayload(token);
    const permisos = this.toArray(payload[this.PERMISSION_CLAIM]);
    const role = payload[this.ROLE_CLAIM] ?? payload['role'] ?? payload['rol'];
    const name = payload[this.NAME_CLAIM] ?? payload['unique_name'] ?? payload['sub'] ?? '';
    const nombre = payload['nombre'];

    return {
      username: typeof name === 'string' ? name : '',
      nombre: typeof nombre === 'string' ? nombre : undefined,
      rol: this.isRolUsuario(role) ? role : undefined,
      permisos,
    };
  }

  private parseJwtPayload(token: string): Record<string, unknown> {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return {};
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      return JSON.parse(atob(padded));
    } catch {
      return {};
    }
  }

  private toArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    return typeof value === 'string' ? [value] : [];
  }

  private isRolUsuario(value: unknown): value is RolUsuario {
    return value === 'Alumno' || value === 'Admin' || value === 'Gestor';
  }
}
