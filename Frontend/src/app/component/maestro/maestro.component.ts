import { Component } from '@angular/core';

@Component({
  selector: 'app-maestro',
  standalone: false,
  templateUrl: './maestro.component.html',
  styleUrl: './maestro.component.scss'
})
export class MaestroComponent {
  estudiantesCompletados = 10;
  totalEstudiantes = 25;
  desempenoActual = 70; // Porcentaje
  desempenoRestante = 100 - this.desempenoActual;

  constructor() {}
}