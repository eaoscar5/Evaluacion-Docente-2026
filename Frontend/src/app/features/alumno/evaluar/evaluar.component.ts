import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import {
  EvaluacionService,
  EvaluacionDisponibleDto,
  RespuestaDto
} from 'src/app/core/services/evaluacion.service';

interface Opcion    { id: number; texto: string; valor: number; }
interface Pregunta  { id: number; texto: string; tipo: string | number; orden: number; opciones: Opcion[]; }
interface Categoria { id: number; nombre: string; orden: number; preguntas: Pregunta[]; }
interface Instrumento { id: number; nombre: string; categorias: Categoria[]; }

@Component({
  selector: 'app-evaluar',
  standalone: true,
  templateUrl: './evaluar.component.html',
  styleUrl: './evaluar.component.scss',
  imports: [CommonModule, RouterModule, FormsModule],
})
export class EvaluarComponent implements OnInit {

  evaluacion: EvaluacionDisponibleDto | null = null;
  instrumento: Instrumento | null = null;

  respuestas:         Record<number, number> = {};
  respuestasAbiertas: Record<number, string> = {};
  comentario    = '';
  intentoEnviar = false;

  loading   = false;
  guardando = false;
  errorMsg  = '';
  enviado   = false;
  evaluacionId: number | null = null;

  constructor(
    private router: Router,
    private api: ApiService,
    private evaluacionService: EvaluacionService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.evaluacion = nav?.extras?.state?.['evaluacion'] ?? null;
  }

  ngOnInit(): void {
    if (!this.evaluacion) {
      this.router.navigate(['/inicio-alumno']);
      return;
    }
    this.cargarInstrumento();
  }

  cargarInstrumento(): void {
    this.loading  = true;
    this.errorMsg = '';

    this.api.get<any>('/procesos/activo').subscribe({
      next: (proceso) => {
        if (!proceso?.instrumentoId) {
          this.errorMsg = 'No hay instrumento asignado al proceso activo.';
          this.loading  = false;
          return;
        }
        this.api.get<any>(`/instrumentos/${proceso.instrumentoId}`).subscribe({
          next: (raw) => {
            this.instrumento = {
              id:     raw.id,
              nombre: raw.nombre,
              categorias: (raw.categorias ?? []).map((cat: any) => ({
                id:        cat.id,
                nombre:    cat.nombre ?? '',
                orden:     cat.orden,
                preguntas: (cat.preguntas ?? []).map((p: any) => ({
                  id:       p.id,
                  texto:    p.texto,
                  tipo:     p.tipo,   // puede llegar como 0/1 (número) o "Cerrada"/"Abierta"
                  orden:    p.orden,
                  opciones: (p.opciones ?? [])
                    .slice()
                    .sort((a: any, b: any) => a.valor - b.valor)
                    .map((op: any) => ({
                      id:    op.id,
                      texto: op.texto,
                      valor: op.valor
                    }))
                }))
              }))
            };
            this.loading = false;
          },
          error: () => { this.errorMsg = 'No se pudo cargar el instrumento.'; this.loading = false; }
        });
      },
      error: () => { this.errorMsg = 'No hay proceso activo.'; this.loading = false; }
    });
  }

  // ── Helpers de tipo ──────────────────────────────────────────────────────
  // El backend puede serializar el enum como número (0=Cerrada, 1=Abierta)
  // o como string ("Cerrada"/"Abierta") dependiendo de la configuración
  esCerrada(tipo: string | number): boolean {
    return tipo === 0 || tipo === 'Cerrada' || tipo === 'cerrada';
  }

  esAbierta(tipo: string | number): boolean {
    return tipo === 1 || tipo === 'Abierta' || tipo === 'abierta';
  }

  // ── Respuestas ────────────────────────────────────────────────────────────
  seleccionar(preguntaId: number, opcionId: number): void {
    this.respuestas[preguntaId] = opcionId;
  }

  opcionSeleccionada(preguntaId: number, opcionId: number): boolean {
    return this.respuestas[preguntaId] === opcionId;
  }

  get preguntasCerradas(): Pregunta[] {
    return this.instrumento?.categorias
      .flatMap(c => c.preguntas)
      .filter(p => this.esCerrada(p.tipo)) ?? [];
  }

  get totalPreguntas(): number   { return this.preguntasCerradas.length; }
  get totalRespondidas(): number { return Object.keys(this.respuestas).length; }
  get progreso(): number {
    if (this.totalPreguntas === 0) return 0;
    return Math.round((this.totalRespondidas / this.totalPreguntas) * 100);
  }

  get preguntasCompletas(): boolean { return this.totalRespondidas >= this.totalPreguntas && this.totalPreguntas > 0; }
  get comentarioValido(): boolean   { return this.comentario.trim().length > 0; }

  enviar(): void {
    this.intentoEnviar = true;

    if (!this.preguntasCompletas) {
      this.errorMsg = `Debes responder todas las preguntas (${this.totalRespondidas}/${this.totalPreguntas}).`;
      return;
    }
    if (!this.comentarioValido) {
      this.errorMsg = 'El comentario es obligatorio.';
      return;
    }
    if (!this.evaluacion) return;

    this.guardando = true;
    this.errorMsg  = '';

    const respuestasDto: RespuestaDto[] = Object.entries(this.respuestas).map(
      ([preguntaId, opcionId]) => ({ preguntaId: Number(preguntaId), opcionId: Number(opcionId) })
    );

    this.evaluacionService.crearEvaluacion({
      idMaestro:     this.evaluacion.idMaestro,
      nombreMaestro: this.evaluacion.nombreMaestro,
      materiaId:     this.evaluacion.materiaId,
      nombreMateria: this.evaluacion.materia,
      grupo:         this.evaluacion.grupo,
      respuestas:    respuestasDto,
      comentario:    this.comentario.trim(),
    }).subscribe({
      next: (res) => { this.guardando = false; this.enviado = true; this.evaluacionId = res.id; },
      error: (err) => { this.guardando = false; this.errorMsg = err?.error?.message ?? 'Error al enviar.'; },
    });
  }

  volver(): void {
    this.router.navigate(['/inicio-alumno']);
  }
}