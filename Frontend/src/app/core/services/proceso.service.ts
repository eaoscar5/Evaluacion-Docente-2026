import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ProcesoDto, CrearProcesoDto } from '../../features/admin/dashboard/models/proceso.model'; // ajusta la ruta si es necesario

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  constructor(private api: ApiService) {}

  getActivo() {
    return this.api.get<ProcesoDto>('/procesos/activo');
  }

  getAll() {
    return this.api.get<ProcesoDto[]>('/procesos');
  }

  crearProceso(data: CrearProcesoDto) {
    return this.api.post<ProcesoDto>('/procesos', data);
  }

  cerrar(id: number) {
    return this.api.put<ProcesoDto>(`/procesos/${id}/cerrar`, {});
  }

  activar(id: number) {
    return this.api.put<ProcesoDto>(`/procesos/${id}/activar`, {});
  }

  getInstrumentos() {
    return this.api.get<any[]>('/instrumentos');
  }
}