import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UsuarioAdminDto,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
} from '../../features/admin/usuarios/models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(q?: string): Observable<UsuarioAdminDto[]> {
    let params = new HttpParams();
    if (q?.trim()) {
      params = params.set('q', q.trim());
    }

    return this.http.get<UsuarioAdminDto[]>(this.baseUrl, { params });
  }

  create(payload: UsuarioCreateRequest): Observable<UsuarioAdminDto> {
    return this.http.post<UsuarioAdminDto>(this.baseUrl, payload);
  }

  update(id: number, payload: UsuarioUpdateRequest): Observable<UsuarioAdminDto> {
    return this.http.put<UsuarioAdminDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
