import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import {
  UsuarioAdminDto,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
} from '../models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss',
})
export class UsuariosListComponent implements OnInit {
  usuarios: UsuarioAdminDto[] = [];
  loading = false;
  saving = false;
  errorMsg = '';
  modalErrorMsg = '';
  searchTerm = '';
  showModal = false;
  editingUser: UsuarioAdminDto | null = null;
  form!: FormGroup;

  readonly permisos = [
    { control: 'puedeGestionarUsuarios', label: 'Gestionar usuarios', hint: 'Alta, edición, activación y eliminación de cuentas administrativas.' },
    { control: 'puedeGestionarInstrumentos', label: 'Gestionar instrumentos', hint: 'Crear y editar instrumentos de evaluación.' },
    { control: 'puedeGestionarProcesos', label: 'Gestionar procesos', hint: 'Abrir, cerrar y administrar periodos de evaluación.' },
    { control: 'puedeVerReportes', label: 'Ver reportes', hint: 'Acceder a reportes, calificaciones y consultas administrativas.' },
  ] as const;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.bindRoleBehavior();
    this.cargarUsuarios();
  }

  initForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]],
      rol: ['Gestor', Validators.required],
      activo: [true],
      puedeGestionarUsuarios: [false],
      puedeGestionarInstrumentos: [true],
      puedeGestionarProcesos: [false],
      puedeVerReportes: [false],
    });
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.errorMsg = '';

    this.usuarioService.getAll(this.searchTerm).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'No se pudieron cargar los usuarios.';
        this.loading = false;
      },
    });
  }

  buscar(): void {
    this.cargarUsuarios();
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.cargarUsuarios();
  }

  abrirCrear(): void {
    this.editingUser = null;
    this.modalErrorMsg = '';
    this.showModal = true;
    this.form.reset({
      username: '',
      password: '',
      rol: 'Gestor',
      activo: true,
      puedeGestionarUsuarios: false,
      puedeGestionarInstrumentos: true,
      puedeGestionarProcesos: false,
      puedeVerReportes: false,
    });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
  }

  abrirEditar(usuario: UsuarioAdminDto): void {
    this.editingUser = usuario;
    this.modalErrorMsg = '';
    this.showModal = true;
    this.form.reset({
      username: usuario.username,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo,
      puedeGestionarUsuarios: usuario.puedeGestionarUsuarios,
      puedeGestionarInstrumentos: usuario.puedeGestionarInstrumentos,
      puedeGestionarProcesos: usuario.puedeGestionarProcesos,
      puedeVerReportes: usuario.puedeVerReportes,
    });
    this.form.get('password')?.setValidators([Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
  }

  cerrarModal(): void {
    this.showModal = false;
    this.saving = false;
    this.modalErrorMsg = '';
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.modalErrorMsg = '';

    const payload = this.buildPayload();
    const request$ = this.editingUser
      ? this.usuarioService.update(this.editingUser.id, payload as UsuarioUpdateRequest)
      : this.usuarioService.create(payload as UsuarioCreateRequest);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.saving = false;
        this.modalErrorMsg = err?.error?.message ?? 'No se pudo guardar el usuario.';
      },
    });
  }

  eliminar(usuario: UsuarioAdminDto): void {
    if (!confirm(`¿Eliminar al usuario "${usuario.username}"?`)) {
      return;
    }

    this.errorMsg = '';
    this.usuarioService.delete(usuario.id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'No se pudo eliminar el usuario.';
      },
    });
  }

  isAdminSelected(): boolean {
    return this.form.get('rol')?.value === 'Admin';
  }

  permisosActivos(usuario: UsuarioAdminDto): string[] {
    const items: string[] = [];
    if (usuario.puedeGestionarUsuarios) items.push('Usuarios');
    if (usuario.puedeGestionarInstrumentos) items.push('Instrumentos');
    if (usuario.puedeGestionarProcesos) items.push('Procesos');
    if (usuario.puedeVerReportes) items.push('Reportes');
    return items;
  }

  trackById(_: number, usuario: UsuarioAdminDto): number {
    return usuario.id;
  }

  private bindRoleBehavior(): void {
    this.form.get('rol')?.valueChanges.subscribe((rol) => {
      const isAdmin = rol === 'Admin';
      for (const permiso of this.permisos) {
        const control = this.form.get(permiso.control);
        if (!control) continue;

        if (isAdmin) {
          control.setValue(true, { emitEvent: false });
          control.disable({ emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  private buildPayload(): UsuarioCreateRequest | UsuarioUpdateRequest {
    const raw = this.form.getRawValue();
    const payload: UsuarioUpdateRequest = {
      username: raw.username.trim(),
      rol: raw.rol,
      activo: raw.activo,
      puedeGestionarUsuarios: !!raw.puedeGestionarUsuarios,
      puedeGestionarInstrumentos: !!raw.puedeGestionarInstrumentos,
      puedeGestionarProcesos: !!raw.puedeGestionarProcesos,
      puedeVerReportes: !!raw.puedeVerReportes,
      password: raw.password?.trim() || undefined,
    };

    if (!this.editingUser) {
      payload.password = raw.password.trim();
    }

    return payload;
  }
}
