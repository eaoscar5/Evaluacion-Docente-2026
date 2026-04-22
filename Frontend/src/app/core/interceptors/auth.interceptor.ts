import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // No adjuntar token en las rutas de autenticación
    const esRutaPublica = req.url.includes('/auth/');

    // Obtener solo el string del token, no el objeto sesión completo
    const token = esRutaPublica ? null : this.authService.getToken();

    const authReq = token
      ? req.clone({
          setHeaders: {
            // Bearer + espacio + token string puro
            Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !esRutaPublica) {
          // Token expirado o inválido → cerrar sesión
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}