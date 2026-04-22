import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PreguntasService } from 'src/app/services/pregunta.service';
import { CategoriasService } from 'src/app/services/categoria.service';
import { FunctionsService } from 'src/app/services/functions.service';
import { Message, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-preguntas-admin',
  standalone: false,
  templateUrl: './preguntas-admin.component.html',
  styleUrls: ['./preguntas-admin.component.scss'],
  providers: [MessageService, DatePipe]
})
export class PreguntasAdminComponent implements OnInit, OnDestroy {
  private deleteSubscription: Subscription | undefined;

  loading = false;
  results: any[] = [];
  categorias: any[] = [];
  form: any;
  searchTerm = '';
  pregunta: any = { id: '' };
  visible = false;  // Para el modal de crear/editar
  isModalOpen = false;  // Para controlar la visibilidad de los modales
  isEditMode = false;
  note: Message[] = [];
  textoCompleto: string = '';  // Para el texto completo que se muestra en el modal

  constructor(
    public fun: FunctionsService,
    private preguntasService: PreguntasService,
    private categoriasService: CategoriasService,
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.note = [{ severity: 'info', detail: 'Este formulario es para crear y editar preguntas.' }];
    this.getList();
    this.subscribeToDeleteEvent();

    this.form = this.formBuilder.group({
      texto: ['', Validators.required],
      tipo: ['', Validators.required],
      orden: [null, Validators.required],
      categoriaId: ['', Validators.required],
    });

    this.getCategorias();
  }

  ngOnDestroy() {
    this.deleteSubscription?.unsubscribe();
  }

  getList(nombre: string = '') {
    this.loading = true;
    this.preguntasService.getList(nombre).subscribe({
      next: (response: any) => {
        this.results = response.map((result: any) => {
          // Buscar la categoría correspondiente
          const categoria = this.categorias.find(c => c.id === result.categoriaId);
          return {
            ...result,
            categoriaNombre: categoria ? categoria.nombre : 'Desconocida',
            createdAt: this.fun.transformDateTime2(result.createdAt),
            updatedAt: this.fun.transformDateTime2(result.updatedAt)
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las preguntas.' });
      }
    });
  }

  onSearch() {
    this.getList(this.searchTerm);
  }

  showDialog() {
    this.visible = true;
    this.isModalOpen = false;  // Aseguramos que no se abra el modal de ver cuando se abra el de crear/editar
  }

  hideDialog() {
    this.visible = false;
    this.isEditMode = false;
    this.form.reset();
  }

  editPregunta(pregunta: any) {
    this.form.reset();
    this.pregunta = { ...pregunta };
    this.form.patchValue({
      texto: this.pregunta.texto || '',
      tipo: this.pregunta.tipo || false,
      orden: this.pregunta.orden || null,
      categoriaId: this.pregunta.categoriaId || '',
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
    this.preguntasService.save(this.form.value).subscribe({
      next: (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta creada correctamente.' });
        this.getList();
        this.hideDialog();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'No se pudo crear la pregunta.' });
      }
    });
  }

  update() {
    const updatedPregunta = { ...this.form.value };
    this.preguntasService.update(this.pregunta.id, updatedPregunta).subscribe({
      next: () => {
        const index = this.results.findIndex((item: any) => item.id === this.pregunta.id);
        if (index !== -1) {
          this.results[index] = { ...this.results[index], ...updatedPregunta };
        }
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta actualizada correctamente.' });
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la pregunta.' });
      }
    });
  }

  confirmDelete(pregunta: any) {
    this.preguntasService.confirmDelete(pregunta);
  }

  delete(id: string) {
    this.preguntasService.delete(id);
  }

  subscribeToDeleteEvent() {
    this.deleteSubscription = this.preguntasService.getDeleteObservable().subscribe(() => {
      this.getList();
    });
  }

  getCategorias() {
    this.categoriasService.getList().subscribe({
      next: (response: any[]) => {
        this.categorias = response;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las categorías.' });
      }
    });
  }

  // Nueva función para abrir el modal de ver
  verTexto(pregunta: any) {
    this.textoCompleto = pregunta.texto;  // Asigna el texto completo
    this.isModalOpen = true;  // Abre solo el modal de ver
  }

  // Función para cerrar el modal de ver
  hideVerDialog() {
    this.isModalOpen = false;
  }
}
