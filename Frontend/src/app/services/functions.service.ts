import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';


@Injectable({
  providedIn: 'root',
})
export class FunctionsService {

  constructor(
    private datePipe: DatePipe,
    private msgs: MessageService
  ) {}

  currentDate() {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd h:mm:ss');
  }

  transformDate(date: string | number | Date, sequence = 'MMM dd, yyyy') {
    // MySql format - 'y-MM-dd'
    return this.datePipe.transform(date, sequence);
  }

  transformTime(time: string): string {
    let hours = parseInt(time.substr(0, 2));
    let minutes = time.substr(3, 2);
    let ampm = hours < 12 ? 'AM' : 'PM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  transformDateTime(
    date: string | number | Date,
    sequence = 'MMM dd, yyyy',
    time = 'h:mm:ss a'
  ) {
    return (
      this.datePipe.transform(date, sequence) +
      ' - ' +
      this.datePipe.transform(date, time)
    );
  }
  
  transformDateTime2(
    date: string | number | Date,
    sequence = 'dd/MM/yyyy',
    time = 'h:mm:ss a'
  ) {
    return (
      this.datePipe.transform(date, sequence) +
      ' ' +
      this.datePipe.transform(date, time)
    );
  }

  // Función para formatear fechas como "Hoy a las 9:40 A.M."
  formatDateForToday(date: string | number | Date): string {
    const today = new Date();
    const dateToFormat = new Date(date);

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    if (dateToFormat >= todayStart && dateToFormat <= todayEnd) {
      return `Hoy a las ${this.datePipe.transform(dateToFormat, 'h:mm a')}`;
    } else {
      return this.datePipe.transform(dateToFormat, 'dd/MM/yyyy h:mm a') ?? '';
    }
  }
  
  presentAlert(title: string | undefined, message = 'Success') {
    this.msgs.add({ severity: 'success', summary: title, detail: message });
  }

  presentAlertError(title: string | undefined, message = 'Error') {
    this.msgs.add({ severity: 'error', summary: title, detail: message });
  }

  presentMessage(severity: string, detail: string) {
    this.msgs.add({ severity: severity, detail: detail, life: 4990 });
  }

  presentConfirm(fn: (arg0: boolean) => void, title: any, message = '') {
    if (confirm(title)) {
      fn(true);
    } else {
      fn(false);
    }
  }

  remove_object_from_array(array: any[], object: any) {
    return array.splice(array.indexOf(object), 1);
  }

  nameInitial(e: any) {
    return e.substring(0, 1);
  }

  // Este método elimina los parámetros de consulta de la URL actual y navega a la misma URL sin los parámetros de consulta
  removeQueryParams(router: any, route: any) {
    router.navigate(['.'], { relativeTo: route, queryParams: {} });
  }

}
