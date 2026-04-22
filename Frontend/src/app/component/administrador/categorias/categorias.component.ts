import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { CategoriasService } from 'src/app/services/categoria.service';
import { InstrumentosService } from 'src/app/services/instrumento.service';
import { FunctionsService } from 'src/app/services/functions.service';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
  providers: [MessageService, DatePipe]
})
export class CategoriasComponent implements OnInit, OnDestroy {
  private deleteSubscription: Subscription | undefined;

  loading = false;
  results: any[] = [];
  instrumentos: any[] = []; 
  form: any;
  searchTerm = ''; 
  categoria: any = { id: '' };
  visible = false;
  isModalOpen = false;
  isEditMode = false;
  note: Message[] = [];

  constructor(
    public fun: FunctionsService,
    public categoriasService: CategoriasService, 
    private instrumentosService: InstrumentosService,  
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private crud: CrudService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.note = [{ severity: 'info', detail: 'Este formulario es para crear y editar categorías.' }];
    this.getList();
    this.subscribeToDeleteEvent();

    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      orden: [null, Validators.required], 
      instrumentoId: ['', Validators.required], 
    });

    this.getInstrumentos(); 
  }

  ngOnDestroy() {
    this.deleteSubscription?.unsubscribe();
  }

  getList(nombre: string = '') {
    this.loading = true;
    this.categoriasService.getList(nombre).subscribe({
      next: (response: any) => {
        this.results = response.map((result: any) => {
          // Buscar el nombre del instrumento correspondiente
          const instrumento = this.instrumentos.find(i => i.id === result.instrumentoId);
          return {
            ...result,
            instrumentoNombre: instrumento ? instrumento.nombre : 'Desconocido',  
            createdAt: this.fun.transformDateTime2(result.createdAt),
            updatedAt: this.fun.transformDateTime2(result.updatedAt)
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las categorías.' });
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

  editCategoria(categoria: any) {
    this.form.reset();
    this.categoria = { ...categoria };
    this.form.patchValue({
      nombre: this.categoria.nombre || '',
      orden: this.categoria.orden || null,
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
    this.categoriasService.save(this.form.value).subscribe({
      next: (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada correctamente.' });
        this.getList();
        this.hideDialog();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'No se pudo crear la categoría.' });
      }
    });
  }

  update() {
    const updatedCategoria = { ...this.form.value };
    this.categoriasService.update(this.categoria.id, updatedCategoria).subscribe({
      next: () => {
        const index = this.results.findIndex((item: any) => item.id === this.categoria.id);
        if (index !== -1) {
          this.results[index] = { ...this.results[index], ...updatedCategoria };
        }
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada correctamente.' });
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la categoría.' });
      }
    });
  }

  confirmDelete(categoria: any) {
    this.categoriasService.confirmDelete(categoria);
  }

  delete(id: string) {
    this.categoriasService.delete(id);
  }

  subscribeToDeleteEvent() {
    this.deleteSubscription = this.categoriasService.getDeleteObservable().subscribe(() => {
      this.getList();
    });
  }

  getInstrumentos() {
    this.instrumentosService.getList().subscribe({
      next: (response: any[]) => {
        this.instrumentos = response; 
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los instrumentos.' });
      }
    });
  }
}
