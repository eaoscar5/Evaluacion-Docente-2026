import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading  = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.estaAutenticado()) {
      this.redirigirSegunRol();
    }

    this.form = this.fb.group({
      credencial: ['', [Validators.required, Validators.minLength(3)]],
      password:   ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    const { credencial, password } = this.form.value;

    this.authService.login(credencial, password).subscribe({
      next: () => {
        this.loading = false;
        this.redirigirSegunRol();
      },
      error: (err: Error) => {
        this.loading  = false;
        this.errorMsg = err.message || 'Ocurrió un error inesperado';
      },
    });
  }

  private redirigirSegunRol(): void {
    const sesion = this.authService.getSesion();
    if (!sesion) return;

    switch (sesion.rol) {
      case 'Admin':
      case 'Gestor':
        this.router.navigate(['/dashboard']);
        break;
      case 'Alumno':
        this.router.navigate(['/inicio-alumno']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  get credencialInvalid(): boolean {
    const c = this.form.get('credencial');
    return !!(c?.invalid && c?.touched);
  }

  get passwordInvalid(): boolean {
    const p = this.form.get('password');
    return !!(p?.invalid && p?.touched);
  }
}
