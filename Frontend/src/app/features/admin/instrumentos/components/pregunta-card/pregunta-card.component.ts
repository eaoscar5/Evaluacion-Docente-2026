import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DragDropModule } from '@angular/cdk/drag-drop'

import { Pregunta } from '../../models/pregunta.model'
import { Opcion, OPCIONES_PREDETERMINADAS } from '../../models/opcion.model'
import { TipoPregunta, TIPO_PREGUNTA_OPTIONS } from '../../models/enums'

import { TempIdService } from '../../../../../core/services/temp-id.service'

@Component({
  selector: 'app-pregunta-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './pregunta-card.component.html',
  styleUrl:    './pregunta-card.component.scss'
})
export class PreguntaCardComponent {

  @Input() pregunta!: Pregunta
  @Output() eliminar = new EventEmitter<void>()

  TipoPregunta        = TipoPregunta
  tipoPreguntaOptions = TIPO_PREGUNTA_OPTIONS

  constructor(private tempId: TempIdService) {}

  /**
   * Se llama al cambiar el tipo de la pregunta.
   * Si el nuevo tipo es "Cerrada" y no tiene opciones, aplica las predeterminadas.
   * Si cambia a "Abierta", limpia las opciones.
   */
  onTipoCambiado(): void {
    if (this.pregunta.tipo === TipoPregunta.Cerrada) {
      // Solo aplica si no tiene opciones ya (para no pisar opciones personalizadas)
      if (!this.pregunta.opciones || this.pregunta.opciones.length === 0) {
        this.aplicarOpcionesPredeterminadas()
      }
    } else if (this.pregunta.tipo === TipoPregunta.Abierta) {
      // Limpiar opciones al cambiar a abierta
      this.pregunta.opciones = []
    }
  }

  aplicarOpcionesPredeterminadas(): void {
    this.pregunta.opciones = OPCIONES_PREDETERMINADAS.map(op => ({
      _tempId: this.tempId.generate(),
      texto:   op.texto,
      valor:   op.valor
    }))
  }

  agregarOpcion(): void {
    const siguiente = (this.pregunta.opciones?.length ?? 0) + 1
    this.pregunta.opciones = [
      ...(this.pregunta.opciones ?? []),
      {
        _tempId: this.tempId.generate(),
        texto:   `Opción ${siguiente}`,
        valor:   siguiente
      }
    ]
  }

  eliminarOpcion(index: number): void {
    this.pregunta.opciones?.splice(index, 1)
  }

  trackOpcion(index: number, op: Opcion): string {
    return op._tempId ?? String(op.id ?? index)
  }
}