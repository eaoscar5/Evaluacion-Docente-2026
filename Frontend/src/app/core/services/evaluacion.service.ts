import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';

export interface EvaluacionDisponibleDto {
  idMaestro:     string;
  nombreMaestro: string;
  materiaId:     string;
  materia:       string;
  grupo:         string;
  yaEvaluado:    boolean;
}

export interface RespuestaDto {
  preguntaId: number;
  opcionId:   number;
}

export interface CrearEvaluacionDto {
  idMaestro:     string;
  nombreMaestro: string;
  materiaId:     string;
  nombreMateria: string;
  grupo:         string;
  respuestas:    RespuestaDto[];
  comentario?:   string;
}

export interface EvaluacionCreadaDto {
  id:    number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  constructor(private api: ApiService) {}

  getDisponibles() {
    return this.api.get<EvaluacionDisponibleDto[]>('/evaluaciones/disponibles');
  }

  crearEvaluacion(dto: CrearEvaluacionDto) {
    return this.api.post<EvaluacionCreadaDto>('/evaluaciones', dto);
  }
}