export type RolAdministrativo = 'Admin' | 'Gestor';

export interface UsuarioAdminDto {
  id: number;
  username: string;
  rol: RolAdministrativo;
  activo: boolean;
  puedeGestionarUsuarios: boolean;
  puedeGestionarInstrumentos: boolean;
  puedeGestionarProcesos: boolean;
  puedeVerReportes: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface UsuarioCreateRequest {
  username: string;
  password: string;
  rol: RolAdministrativo;
  activo: boolean;
  puedeGestionarUsuarios: boolean;
  puedeGestionarInstrumentos: boolean;
  puedeGestionarProcesos: boolean;
  puedeVerReportes: boolean;
}

export type UsuarioUpdateRequest = Omit<UsuarioCreateRequest, 'password'> & {
  password?: string;
};
