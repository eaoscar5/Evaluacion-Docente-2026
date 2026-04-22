import { Component, inject, OnInit, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatChipsModule } from '@angular/material/chips'

import { InstrumentoService } from '../../../../core/services/instrumento.service'
import { TempIdService } from '../../../../core/services/temp-id.service'
import { CategoriaCardComponent } from '../components/categoria-card/categoria-card.component'

import { Instrumento } from '../models/instrumento.model'
import { Categoria } from '../models/categoria.model'
import { TipoInstrumento, TIPO_INSTRUMENTO_OPTIONS, TipoPregunta } from '../models/enums'

@Component({
  selector: 'app-instrumento-editor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    CategoriaCardComponent
  ],
  templateUrl: './instrumento-editor.component.html',
  styleUrl:    './instrumento-editor.component.scss'
})
export class InstrumentoEditorComponent implements OnInit {

  // ── Inyecciones ────────────────────────────────────────────
  private readonly service  = inject(InstrumentoService)
  private route    = inject(ActivatedRoute)
  private router   = inject(Router)
  private snackBar = inject(MatSnackBar)
  private tempId   = inject(TempIdService)
  // ProcesoService eliminado — el instrumento ya no maneja procesoId

  // ── Estado reactivo ────────────────────────────────────────
  readonly guardando        = signal(false)
  readonly cargando         = signal(false)
  readonly errorMsg         = signal<string | null>(null)
  readonly modoEdicion      = signal(false)
  readonly cargandoPlantilla = signal(false)

  // ── Enums expuestos al template ────────────────────────────
  TipoInstrumento        = TipoInstrumento
  tipoInstrumentoOptions = TIPO_INSTRUMENTO_OPTIONS

  // ── Modelo del instrumento ─────────────────────────────────
  instrumento: Instrumento = {
    nombre:          '',
    tipoInstrumento: TipoInstrumento.Curricular,
    esPlantilla:     true,
    activo:          true,
    // procesoId eliminado
    categorias: []
  }

  plantillasDisponibles:   Instrumento[]  = []
  plantillaSeleccionadaId: number | null  = null

  // ── Validaciones ───────────────────────────────────────────
  readonly tieneErrores = computed(() => {
    void this.guardando()
    return this._validar().length > 0
  })

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')

    if (!id) {
      this.cargarPlantillas()
      return
    }

    this.modoEdicion.set(true)
    this.cargando.set(true)

    this.service.obtenerInstrumento(+id).subscribe({
      next: data => {
        Object.assign(this.instrumento, data)
        this.cargando.set(false)
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar el instrumento.')
        this.cargando.set(false)
      }
    })
  }

  cargarPlantillas(): void {
    this.cargandoPlantilla.set(true)
    this.service.getInstrumentos().subscribe({
      next: instrumentos => {
        this.plantillasDisponibles = instrumentos.filter(inst => inst.esPlantilla)
        this.cargandoPlantilla.set(false)
      },
      error: () => {
        this.plantillasDisponibles = []
        this.cargandoPlantilla.set(false)
      }
    })
  }

  // ── Getter ─────────────────────────────────────────────────
  get categorias(): Categoria[] {
    return this.instrumento.categorias
  }

  // ── Acciones de categorías ─────────────────────────────────
  agregarCategoria(): void {
    const nueva: Categoria = {
      _tempId:   this.tempId.generate(),
      nombre:    '',
      orden:     this.categorias.length + 1,
      preguntas: []
    }
    this.categorias.push(nueva)
  }

  eliminarCategoria(index: number): void {
    this.categorias.splice(index, 1)
    this._reordenarCategorias()
  }

  dropCategoria(event: CdkDragDrop<Categoria[]>): void {
    moveItemInArray(this.categorias, event.previousIndex, event.currentIndex)
    this._reordenarCategorias()
  }

  trackCategoria(_index: number, cat: Categoria): string {
    return cat._tempId ?? String(cat.id ?? _index)
  }

  aplicarPlantilla(id: number | null): void {
    if (!id) {
      this.instrumento = {
        nombre:          '',
        tipoInstrumento: TipoInstrumento.Curricular,
        esPlantilla:     true,
        activo:          true,
        categorias:      []
      }
      return
    }

    this.cargandoPlantilla.set(true)
    this.service.obtenerInstrumento(id).subscribe({
      next: plantilla => {
        this.instrumento = {
          nombre:          plantilla.nombre,
          tipoInstrumento: plantilla.tipoInstrumento,
          esPlantilla:     this.instrumento.esPlantilla,
          activo:          this.instrumento.activo,
          // procesoId eliminado
          categorias: (plantilla.categorias ?? []).map((cat, idx) => ({
            _tempId:   this.tempId.generate(),
            nombre:    cat.nombre,
            orden:     idx + 1,
            preguntas: (cat.preguntas ?? []).map((preg, pIdx) => ({
              _tempId:  this.tempId.generate(),
              texto:    preg.texto,
              tipo:     preg.tipo,
              orden:    pIdx + 1,
              opciones: (preg.opciones ?? []).map(op => ({
                _tempId: this.tempId.generate(),
                texto:   op.texto,
                valor:   op.valor
              }))
            }))
          }))
        }
        this.cargandoPlantilla.set(false)
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar la plantilla seleccionada.')
        this.cargandoPlantilla.set(false)
      }
    })
  }

  // ── Guardar ────────────────────────────────────────────────
  guardar(): void {
    this.errorMsg.set(null)

    const errores = this._validar()
    if (errores.length) {
      this.errorMsg.set(errores.join(' • '))
      return
    }

    this._reordenarCategorias()
    this.instrumento.categorias.forEach(cat => {
      cat.preguntas.forEach((p, j) => (p.orden = j + 1))
    })

    this.guardando.set(true)

    const op$ = this.modoEdicion()
      ? this.service.actualizarInstrumento(this.instrumento.id!, this.instrumento)
      : this.service.crearInstrumento(this.instrumento)

    op$.subscribe({
      next: () => {
        this.guardando.set(false)
        this.snackBar.open(
          this.modoEdicion() ? 'Instrumento actualizado ✓' : 'Instrumento creado ✓',
          'Cerrar',
          { duration: 3000, panelClass: 'snack-success' }
        )
        this.router.navigate(['/instrumentos'])
      },
      error: err => {
        this.guardando.set(false)
        const msg = err?.error?.message ?? err?.error?.title ?? err?.message ?? 'Error desconocido'
        this.errorMsg.set(`Error al guardar: ${msg}`)
        this.snackBar.open(`❌ ${msg}`, 'Cerrar', { duration: 5000, panelClass: 'snack-error' })
      }
    })
  }

  // ── Helpers privados ───────────────────────────────────────
  private _reordenarCategorias(): void {
    this.categorias.forEach((c, i) => (c.orden = i + 1))
  }

  private _validar(): string[] {
    const errores: string[] = []

    if (!this.instrumento.nombre?.trim())
      errores.push('El nombre del instrumento es obligatorio.')

    if (this.instrumento.categorias.length === 0)
      errores.push('El instrumento debe tener al menos una categoría.')

    for (const cat of this.instrumento.categorias) {
      if (!cat.nombre?.trim())
        errores.push('Una categoría no tiene título.')

      if (cat.preguntas.length === 0)
        errores.push(`La categoría "${cat.nombre || 'Sin título'}" no tiene preguntas.`)

      for (const preg of cat.preguntas) {
        if (!preg.texto?.trim())
          errores.push('Una pregunta no tiene texto.')

        if (preg.tipo === TipoPregunta.Cerrada && preg.opciones.length === 0)
          errores.push(`La pregunta "${preg.texto || '...'}" es cerrada pero no tiene opciones.`)
      }
    }

    return errores
  }
}
