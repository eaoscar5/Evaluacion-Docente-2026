import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';

interface Carrera{
  name: string;
  code: string;
}
interface Proceso{
  nameP: string;
  codeP: string;
}
@Component({
  selector: 'app-estatus',
  standalone: false,
  templateUrl: './estatus.component.html',
  styleUrl: './estatus.component.scss',
  providers: [MessageService]
})
export class EstatusComponent implements OnInit {
  form: any;
  carreras: Carrera[] | undefined;
  procesos: Proceso[] | undefined;
  selectedCarrera: Carrera | undefined;
  selectedProceso: Proceso | undefined;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService
  ) {
    
  }

  ngOnInit(): void {
    this.carreras = [
      { name: 'TIC', code: 'TIC' },
      { name: 'MA', code: 'MA' },
      { name: 'MAMP', code: 'MAMP' },
      { name: 'PI', code: 'PI' },
      { name: 'TIDSM', code: 'TIDSM' }
    ];

    this.procesos = [
      { nameP: 'Oficial 34', codeP: 'O34' },
      { nameP: 'Oficial 33', codeP: 'O33' },
      { nameP: 'Oficial 32', codeP: 'O32' },
      { nameP: 'Oficial 31', codeP: 'O31' },
      { nameP: 'Oficial 30', codeP: 'O30' }
    ];
    }
  }
