import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ProcesosService } from 'src/app/services/procesos.service';
import { FunctionsService } from 'src/app/services/functions.service';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-procesos',
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.scss'],
  providers: [MessageService, DatePipe]
})
export class ProcesosComponent implements OnInit, OnDestroy {
  private deleteSubscription: Subscription | undefined;

  loading: boolean = false;
  results: any[] = [];
  form: any;
  searchTerm: string = ''; 

  proceso: any = {
    id: ''
  };

  visible: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;

  note: Message[] = [];

  constructor(
    public fun: FunctionsService,
    public procesosService: ProcesosService,
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.note = [{ severity: 'info', detail: 'Este formulario es para crear y editar procesos.' }];
    this.initializeForm();
    this.getList();
    this.subscribeToDeleteEvent();
  }

  ngOnDestroy() {
    if (this.deleteSubscription) {
      this.deleteSubscription.unsubscribe();
    }
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      anio: ['', [Validators.required, Validators.pattern("^[0-9]*$")]], 
      periodo: ['', Validators.required],
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
      estatus: [true] // Valor por defecto
    });
  }

  getList(nombre: string = '') {
    this.loading = true;
    this.procesosService.getList(nombre).subscribe({
      next: (response: any) => {
        this.results = response.map((result: any) => ({
          ...result,
          inicio: this.fun.transformDateTime2(result.inicio),
          fin: this.fun.transformDateTime2(result.fin)
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los procesos' });
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

  editProceso(proceso: any) {
    this.proceso = { ...proceso };
    this.form.patchValue(this.proceso);
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
    this.procesosService.save(this.form.value).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
        this.getList();
        this.hideDialog(); 
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el proceso.' });
      }
    });
  }

  update() {
    const updatedProceso = { ...this.form.value, estatus: this.proceso.estatus };
    this.procesosService.update(this.proceso.id, updatedProceso).subscribe({
      next: (response: any) => {
        this.loading = false;
        const index = this.results.findIndex((item: any) => item.id === this.proceso.id);
        if (index !== -1) {
          this.results[index] = { ...this.results[index], ...updatedProceso };
        }
        this.messageService.add({ severity: 'info', summary: 'Info', detail: response.message });
        this.hideDialog();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el proceso.' });
      }
    });
  }

  confirmDelete(item: any) {
    this.procesosService.confirmDelete(item);
  }

  delete(item: any) {
    this.procesosService.delete(item);
  }

  subscribeToDeleteEvent() {
    this.deleteSubscription = this.procesosService.getDeleteObservable().subscribe(() => {
      this.getList();
    });
  }

  toggleStatus(proceso: any) {
    const updatedStatus = !proceso.estatus;
    this.procesosService.update(proceso.id, { estatus: updatedStatus }).subscribe({
      next: () => {
        const index = this.results.findIndex((item: any) => item.id === proceso.id);
        if (index !== -1) {
          this.results[index].estatus = updatedStatus;
        }
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Estado actualizado correctamente.' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado.' });
      }
    });
  }
}