import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { InstrumentosService } from 'src/app/services/instrumento.service';
import { FunctionsService } from 'src/app/services/functions.service';
import { ValidationService } from 'src/app/services/validation.service';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-instrumentos',
  standalone: false,
  templateUrl: './instrumentos.component.html',
  styleUrls: ['./instrumentos.component.scss'],
  providers: [MessageService, DatePipe]
})
export class InstrumentosComponent implements OnInit, OnDestroy {
  private deleteSubscription: Subscription | undefined;

  loading = false;
  results: any[] = [];
  form: any;
  searchTerm = ''; 
  instrumento: any = { id: '' };
  visible = false;
  isModalOpen = false;
  isEditMode = false;
  note: Message[] = [];

  constructor(
    public fun: FunctionsService,
    public instrumentosService: InstrumentosService,
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private crud: CrudService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.note = [{ severity: 'info', detail: 'Este formulario es para crear y editar instrumentos.' }];
    this.getList();
    this.subscribeToDeleteEvent();

    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      tipo: [null, Validators.required],
    });
  }

  ngOnDestroy() {
    this.deleteSubscription?.unsubscribe();
  }

  getList(nombre = '') {
    this.loading = true;
    this.instrumentosService.getList(nombre).subscribe({
      next: (response: any) => {
        this.results = response.map((result: any) => ({
          ...result,
          createdAt: this.fun.transformDateTime2(result.createdAt),
          updatedAt: this.fun.transformDateTime2(result.updatedAt)
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los instrumentos.' });
      }
    });
  }

  onSearch() {
    this.getList(this.searchTerm);
  }

  showDialog() {
    this.visible = true;
    this.isModalOpen = true;
  }

  hideDialog() {
    this.visible = false;
    this.isModalOpen = false; 
    this.isEditMode = false;
    this.form.reset();
  }

  editInstrumento(instrumento: any) {
    this.form.reset();
    this.instrumento = { ...instrumento };
    this.form.patchValue({
      nombre: this.instrumento.nombre || '',
      tipo: this.instrumento.tipo || null,
    });
    this.isEditMode = true;
    this.showDialog();
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      this.isEditMode ? this.update() : this.save();
    } else {
      this.form.markAllAsTouched();
    }
  }

  save() {
    this.instrumentosService.save(this.form.value).subscribe({
      next: (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Instrumento creado correctamente.' });
        this.getList();
        this.hideDialog();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'No se pudo crear el instrumento.' });
      }
    });
  }

  update() {
    const updatedInstrumento = { ...this.form.value };
    this.instrumentosService.update(this.instrumento.id, updatedInstrumento).subscribe({
      next: () => {
        const index = this.results.findIndex((item: any) => item.id === this.instrumento.id);
        if (index !== -1) {
          this.results[index] = { ...this.results[index], ...updatedInstrumento };
        }
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Instrumento actualizado correctamente.' });
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el instrumento.' });
      }
    });
  }

  confirmDelete(instrumento: any) {
    this.instrumentosService.confirmDelete(instrumento);
  }

  delete(id: string) {
    this.instrumentosService.delete(id);
  }

  subscribeToDeleteEvent() {
    this.deleteSubscription = this.instrumentosService.getDeleteObservable().subscribe(() => {
      this.getList();
    });
  }
}
