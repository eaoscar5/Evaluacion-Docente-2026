import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'

import { Categoria } from '../../models/categoria.model'
import { Pregunta } from '../../models/pregunta.model'
import { TipoPregunta } from '../../models/enums'
import { Opcion, OPCIONES_PREDETERMINADAS } from '../../models/opcion.model'
import { TempIdService } from '../../../../../core/services/temp-id.service'
import { PreguntaCardComponent } from '../pregunta-card/pregunta-card.component'

@Component({
  selector: 'app-categoria-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    PreguntaCardComponent
  ],
  templateUrl: './categoria-card.component.html',
  styleUrl:    './categoria-card.component.scss'
})
export class CategoriaCardComponent {

  @Input() categoria!: Categoria
  @Output() eliminar = new EventEmitter<void>()

  constructor(private readonly tempId: TempIdService) {}

  reordenarPreguntas(event: CdkDragDrop<Pregunta[]>): void {
    moveItemInArray(this.categoria.preguntas, event.previousIndex, event.currentIndex)
    this._actualizarOrden()
  }

  agregarPregunta(): void {
    // Al agregar una pregunta cerrada, las opciones predeterminadas se aplican de inmediato
    const nueva: Pregunta = {
      _tempId:  this.tempId.generate(),
      texto:    '',
      tipo:     TipoPregunta.Cerrada,
      orden:    this.categoria.preguntas.length + 1,
      opciones: OPCIONES_PREDETERMINADAS.map(op => ({
        _tempId: this.tempId.generate(),
        texto:   op.texto,
        valor:   op.valor
      }))
    }
    this.categoria.preguntas.push(nueva)
  }

  eliminarPregunta(index: number): void {
    this.categoria.preguntas.splice(index, 1)
    this._actualizarOrden()
  }

  trackPregunta(p: Pregunta): string {
    return p._tempId ?? String(p.id)
  }

  private _actualizarOrden(): void {
    this.categoria.preguntas.forEach((p, i) => (p.orden = i + 1))
  }
}
