import { Injectable, inject, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, tap, catchError, throwError } from 'rxjs'

import { environment } from '../../../environments/environment'
import { Instrumento } from '../../features/admin/instrumentos/models/instrumento.model'
import { TempIdService } from './temp-id.service'

@Injectable({ providedIn: 'root' })
export class InstrumentoService {

  private http = inject(HttpClient)
  private tempId = inject(TempIdService)

  private readonly apiUrl = `${environment.apiUrl}/instrumentos`

  /** Lista reactiva de instrumentos disponible globalmente */
  readonly listaInstrumentos = signal<Instrumento[]>([])


// Cargar todos los instrumentos y normalizar el orden del grafo.
getInstrumentos(): Observable<Instrumento[]> {
  return this.http.get<Instrumento[]>(this.apiUrl).pipe(
    tap(data => {
      data.forEach(i => {
        this._sortGraph(i)
        this._initializeTempIds(i)
      })
      this.listaInstrumentos.set(data)
    })
  )
}

// Obtener un instrumento puntual con su grafo completo.
obtenerInstrumento(id: number): Observable<Instrumento> {
  return this.http.get<Instrumento>(`${this.apiUrl}/${id}`).pipe(
    tap(inst => {
      this._sortGraph(inst)
      this._initializeTempIds(inst)
    })
  )
}

  // Crear un instrumento completo (con categorias/preguntas/opciones).
  crearInstrumento(data: Instrumento): Observable<Instrumento> {
    const payload = this._sanitizePayload(data)
    return this.http.post<Instrumento>(this.apiUrl, payload).pipe(
      catchError(err => throwError(() => err))
    )
  }

  // Actualizar un instrumento completo.
  actualizarInstrumento(id: number, data: Instrumento): Observable<Instrumento> {
    const payload = this._sanitizePayload(data)
    return this.http.put<Instrumento>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError(err => throwError(() => err))
    )
  }

  // Eliminar el instrumento por id.
  eliminarInstrumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  /**
   * Elimina los campos `_tempId` antes de enviar al backend.
   * El backend sólo acepta `id` (número) y no conoce el campo temporal.
   */
  private _sanitizePayload(instrumento: Instrumento): Instrumento {
    const clean = structuredClone(instrumento) as any

    delete clean._tempId

    clean.categorias = (clean.categorias ?? []).map((cat: any) => {
      delete cat._tempId
      cat.preguntas = (cat.preguntas ?? []).map((preg: any) => {
        delete preg._tempId
        preg.opciones = (preg.opciones ?? []).map((op: any) => {
          delete op._tempId
          return op
        })
        return preg
      })
      return cat
    })

    return clean as Instrumento
  }

  // Asegura ids temporales para drag&drop y tracking local en el editor.
  private _initializeTempIds(instrumento: Instrumento): Instrumento {

  if (!instrumento._tempId)
    instrumento._tempId = this.tempId.generate()

  instrumento.categorias?.forEach(cat => {

    if (!cat._tempId)
      cat._tempId = this.tempId.generate()

    cat.preguntas?.forEach(preg => {

      if (!preg._tempId)
        preg._tempId = this.tempId.generate()

      preg.opciones?.forEach(op => {

        if (!op._tempId)
          op._tempId = this.tempId.generate()

      })

    })

  })

  return instrumento
}

  // Ordena el grafo por orden/valor para render consistente.
  private _sortGraph(instrumento: Instrumento): void {
    instrumento.categorias = (instrumento.categorias ?? [])
      .slice()
      .sort((a, b) => a.orden - b.orden)

    instrumento.categorias.forEach(cat => {
      cat.preguntas = (cat.preguntas ?? [])
        .slice()
        .sort((a, b) => a.orden - b.orden)

      cat.preguntas.forEach(p => {
        p.opciones = (p.opciones ?? [])
          .slice()
          .sort((a, b) => a.valor - b.valor)
      })
    })
  }
}
