import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsRoutes } from './component.routing';

import { UsersComponent } from './administrador/users/users.component';
import { EstatusComponent } from './administrador/estatus/estatus.component';
import { ProcesosComponent } from './administrador/procesos/procesos.component';
import { MaestroComponent } from './maestro/maestro.component';
import { InicioalumnoComponent } from './alumno/inicioalumno/inicioalumno.component';
import { PreguntasComponent } from './alumno/preguntas/preguntas.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ResultadosComponent } from './administrador/resultados/resultados.component';
import { InstrumentosComponent } from './administrador/instrumentos/instrumentos.component';
import { CategoriasComponent } from './administrador/categorias/categorias.component';
import { PreguntasAdminComponent } from './administrador/preguntas-admin/preguntas-admin.component';
import { OpcionesComponent } from './administrador/opciones/opciones.component';
import { MaestrosAlumnoComponent } from './alumno/maestros-alumno/maestros-alumno.component';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion'
import { SelectButtonModule } from 'primeng/selectbutton'
import { MessagesModule } from 'primeng/messages';


@NgModule({
  imports: [
    ButtonModule,
    ToastModule,
    CommonModule,
    RouterModule.forChild(ComponentsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DropdownModule,
    ColorPickerModule,
    InputTextareaModule, 
    FullCalendarModule,
    DividerModule,
    DialogModule,
    DropdownModule,
    AccordionModule,
    SelectButtonModule,
    MessagesModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    UsersComponent,
    EstatusComponent,
    ProcesosComponent,
    ResultadosComponent,
    MaestroComponent,
    InicioalumnoComponent,
    MaestrosAlumnoComponent,
    PreguntasComponent,
    InstrumentosComponent,
    CategoriasComponent,
    PreguntasAdminComponent,
    OpcionesComponent,
  ]
})
export class ComponentsModule { }
