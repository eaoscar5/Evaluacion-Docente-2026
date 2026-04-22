import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { OpcionesService } from 'src/app/services/opciones.service';  
import { FunctionsService } from 'src/app/services/functions.service';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-opciones',
  standalone: false,
  templateUrl: './opciones.component.html',
  styleUrls: ['./opciones.component.scss'],
  providers: [MessageService]
})
export class OpcionesComponent implements OnInit, OnDestroy {
  private deleteSubscription: Subscription | undefined;

  loading = false;
  results: any[] = []; 
  form: any;
  searchTerm = '';
  opcion: any = { id: '' }; 
  visible = false; 
  isModalOpen = false;
  isEditMode = false; 
  note: Message[] = []; 

  constructor(
    private opcionesService: OpcionesService, 
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private crud: CrudService,
    public fun: FunctionsService
  ) {}

  ngOnInit() {
    this.note = [{ severity: 'info', detail: 'Este formulario es para crear y editar opciones.' }];
    this.getList(); 
    this.subscribeToDeleteEvent(); 

    this.form = this.formBuilder.group({
      opcion: ['', Validators.required],
      nivel: [null, Validators.required]
    });
  }

  ngOnDestroy() {
    this.deleteSubscription?.unsubscribe();
  }

  getList(nombre: string = '') {
    this.loading = true;
    this.opcionesService.getList(nombre).subscribe({
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las opciones.' });
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

  editOpcion(opcion: any) {
    this.form.reset();
    this.opcion = { ...opcion };
    this.form.patchValue({
      opcion: this.opcion.opcion || '',
      nivel: this.opcion.nivel || null
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
    this.opcionesService.save(this.form.value).subscribe({
      next: (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Opción creada correctamente.' });
        this.getList(); // Refrescar la lista
        this.hideDialog(); // Cerrar el modal
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'No se pudo crear la opción.' });
      }
    });
  }

  update() {
    const updatedOpcion = { ...this.form.value };
    this.opcionesService.update(this.opcion.id, updatedOpcion).subscribe({
      next: () => {
        const index = this.results.findIndex((item: any) => item.id === this.opcion.id);
        if (index !== -1) {
          this.results[index] = { ...this.results[index], ...updatedOpcion };
        }
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Opción actualizada correctamente.' });
        this.hideDialog(); // Cerrar el modal
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la opción.' });
      }
    });
  }

  confirmDelete(opcion: any) {
    this.opcionesService.confirmDelete(opcion);
  }

  delete(id: string) {
    this.opcionesService.delete(id);
  }

  subscribeToDeleteEvent() {
    this.deleteSubscription = this.opcionesService.getDeleteObservable().subscribe(() => {
      this.getList(); 
    });
  }
}
