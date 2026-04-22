
export interface LoginUniversidadDto {
  username: string;
  password: string;
}


export interface LoginAdminDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  matricula: string;
  nombre: string;
  rol: string;   
  token: string;
}

export interface LoginAdminResponseDto {
  token: string;
}

export type RolUsuario = 'Alumno' | 'Admin' | 'Gestor';

export interface UsuarioSesion {
  username: string;
  nombre?: string;
  rol: RolUsuario;
  token: string;
  permisos: string[];
}
