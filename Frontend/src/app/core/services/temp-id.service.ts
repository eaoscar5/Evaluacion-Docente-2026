import { Injectable } from '@angular/core'

/**
 * Genera IDs temporales únicos para entidades nuevas (sin ID de BD).
 * Se usan en `trackBy` para que Angular no destruya y recree el DOM
 * durante el drag-and-drop.
 */
@Injectable({ providedIn: 'root' })
export class TempIdService {
  generate(): string {
    return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }
}
