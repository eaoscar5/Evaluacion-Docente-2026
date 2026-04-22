import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstrumentoService } from 'src/app/core/services/instrumento.service';
import { Instrumento } from '../models/instrumento.model';
import { TipoInstrumento } from '../models/enums';

@Component({
  selector: 'app-instrumentos-list',
  standalone: true,
  templateUrl: './instrumento-list.component.html',
  styleUrl: './instrumento-list.component.scss',
  imports: [CommonModule, RouterModule],
})
export class InstrumentoListComponent implements OnInit {

  instrumentos: Instrumento[] = [];
  loading  = false;
  errorMsg = '';

  constructor(private instrumentoService: InstrumentoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading  = true;
    this.errorMsg = '';

    this.instrumentoService.getInstrumentos().subscribe({
      next: (data) => {
        this.instrumentos = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los instrumentos.';
        this.loading  = false;
      },
    });
  }

  eliminar(id: number | undefined, nombre: string): void {
    if (id === undefined) return;
    if (!confirm(`¿Eliminar el instrumento "${nombre}"? Esta acción no se puede deshacer.`)) return;

    this.instrumentoService.eliminarInstrumento(id).subscribe({
      next: () => {
        this.instrumentos = this.instrumentos.filter(i => i.id !== id);
      },
      error: () => {
        alert('No se pudo eliminar. Verifica que el instrumento no esté asignado a un proceso activo.');
      },
    });
  }

  tipoLabel(tipo: TipoInstrumento): string {
    const labels: Record<string, string> = {
      Curricular:      'Curricular',
      Extracurricular: 'Extracurricular',
    };
    return labels[tipo] ?? String(tipo);
  }
}
