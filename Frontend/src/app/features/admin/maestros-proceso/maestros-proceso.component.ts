import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';

interface ProcesoDto           { id: number; nombre: string; anio: number; periodo: number; activo: boolean; }
interface ResumenCalificacion  { idMaestro: string; nombreMaestro: string; totalEvaluaciones: number; calificacionGlobal: number; totalMaterias: number; }
interface CalificacionPregunta { preguntaId: number; textoPregunta: string; promedio: number; totalRespuestas: number; distribucion: Record<string, number>; }
interface CalificacionPorMateria {
  materiaId: string; nombreMateria: string; grupo: string;
  totalEvaluaciones: number; calificacion: number;
  porPregunta: CalificacionPregunta[]; comentarios: string[];
}
interface CalificacionMaestro {
  idMaestro: string; nombreMaestro: string; procesoId: number;
  totalEvaluaciones: number; calificacionGlobal: number;
  porMateria: CalificacionPorMateria[];
}

@Component({
  selector: 'app-maestros-proceso',
  standalone: true,
  templateUrl: './maestros-proceso.component.html',
  styleUrl: './maestros-proceso.component.scss',
  imports: [CommonModule, FormsModule],
})
export class MaestrosProcesoComponent implements OnInit {

  procesos:  ProcesoDto[]         = [];
  maestros:  ResumenCalificacion[] = [];
  reporte:   CalificacionMaestro | null = null;
  nombreProceso = '';
  materiaActiva = 0; // índice de la pestaña activa

  procesoSeleccionado: number | null = null;
  loading = false; loadingMaestros = false; loadingReporte = false;
  errorMsg = ''; generandoPdf = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.cargarProcesos(); }

  cargarProcesos(): void {
    this.loading = true;
    this.api.get<ProcesoDto[]>('/procesos').subscribe({
      next:  (res) => { this.procesos = res; this.loading = false; },
      error: ()    => { this.errorMsg = 'No se pudieron cargar los procesos.'; this.loading = false; }
    });
  }

  onProcesoChange(): void {
    this.maestros = []; this.reporte = null;
    if (!this.procesoSeleccionado) return;
    const p = this.procesos.find(x => x.id === this.procesoSeleccionado);
    this.nombreProceso = p ? `${p.nombre} · ${this.periodoLabel(p.periodo)} ${p.anio}` : '';
    this.loadingMaestros = true;
    this.api.get<ResumenCalificacion[]>(`/calificaciones/procesos/${this.procesoSeleccionado}`).subscribe({
      next:  (res) => { this.maestros = res; this.loadingMaestros = false; },
      error: ()    => { this.errorMsg = 'Error al cargar maestros.'; this.loadingMaestros = false; }
    });
  }

  verReporte(idMaestro: string): void {
    if (!this.procesoSeleccionado) return;
    this.loadingReporte = true; this.reporte = null; this.materiaActiva = 0;
    this.api.get<CalificacionMaestro>(`/calificaciones/procesos/${this.procesoSeleccionado}/maestros/${idMaestro}`).subscribe({
      next:  (res) => { this.reporte = res; this.loadingReporte = false; },
      error: ()    => { this.errorMsg = 'Error al cargar el reporte.'; this.loadingReporte = false; }
    });
  }

  cerrarReporte(): void { this.reporte = null; }

  get colorCalificacion(): string { return this.getColorEscala10(this.calificacionEscala10); }

  get calificacionEscala10(): number {
    return Math.round(((this.reporte?.calificacionGlobal ?? 0) / 5) * 10 * 100) / 100;
  }

  getColor(val: number): string {
    // val en escala 1-5
    if (val >= 4)  return '#01907e';
    if (val >= 3)  return '#f59e0b';
    return '#e11d48';
  }

  getColorEscala10(val: number): string {
    if (val >= 8)  return '#01907e';
    if (val >= 6)  return '#f59e0b';
    return '#e11d48';
  }

  distribucionEntries(dist: Record<string, number>): { key: string; value: number }[] {
    return Object.entries(dist).map(([key, value]) => ({ key, value }));
  }

  periodoLabel(p: number): string {
    return ({ 1: 'Sep-Dic', 2: 'Ene-Abr', 3: 'May-Ago' } as any)[p] ?? String(p);
  }

  async exportarPdf(): Promise<void> {
    if (!this.reporte) return;
    this.generandoPdf = true;

    const { default: jsPDF }     = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margen = 15;
    let y        = margen;

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFillColor(1, 144, 126);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE EVALUACIÓN DOCENTE', 105, 13, { align: 'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('Universidad Tecnológica del Sur de Sonora', 105, 21, { align: 'center' });
    doc.text(this.nombreProceso, 105, 27, { align: 'center' });
    y = 38;

    // ── Datos del maestro ───────────────────────────────────────────────────
    doc.setTextColor(31, 45, 41);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(this.reporte.nombreMaestro, margen, y); y += 7;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(69, 83, 79);
    doc.text(`ID: ${this.reporte.idMaestro}`, margen, y);
    doc.text(`Total evaluaciones: ${this.reporte.totalEvaluaciones}`, 110, y); y += 8;

    // ── Calificación global ─────────────────────────────────────────────────
    const cal = this.calificacionEscala10;
    const [r, g, b] = cal >= 8 ? [1,144,126] : cal >= 6 ? [245,158,11] : [225,29,72];
    doc.setFillColor(r, g, b);
    doc.roundedRect(margen, y, 90, 14, 3, 3, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(`Calificación general: ${cal.toFixed(2)}/10  (${this.reporte.calificacionGlobal.toFixed(2)}/5)`,
      margen + 45, y + 9, { align: 'center' });
    y += 20;

    // ── Una sección por materia/grupo ───────────────────────────────────────
    for (const mat of this.reporte.porMateria) {
      if (y > 220) { doc.addPage(); y = margen; }

      const calMat = Math.round((mat.calificacion / 5) * 10 * 100) / 100;
      const [mr, mg, mb] = calMat >= 8 ? [1,144,126] : calMat >= 6 ? [245,158,11] : [225,29,72];

      doc.setFillColor(230, 246, 243);
      doc.roundedRect(margen, y, 180, 10, 2, 2, 'F');
      doc.setTextColor(31, 45, 41); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text(`${mat.nombreMateria} — Grupo ${mat.grupo}`, margen + 3, y + 7);
      doc.setTextColor(mr, mg, mb);
      doc.text(`${calMat.toFixed(2)}/10`, 190, y + 7, { align: 'right' });
      y += 14;

      // Tabla de preguntas
      const rows = mat.porPregunta.map((p, i) => [
        `${i + 1}`,
        p.textoPregunta,
        p.promedio.toFixed(2),
        `${((p.promedio / 5) * 10).toFixed(1)}/10`,
        Object.entries(p.distribucion).map(([k,v]) => `${k}:${v}`).join(' | ')
      ]);

      autoTable(doc, {
        startY: y,
        head:   [['#', 'Pregunta', 'Prom(1-5)', 'Equiv(/10)', 'Distribución']],
        body:   rows,
        margin: { left: margen, right: margen },
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [1,144,126], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [230,246,243] },
        columnStyles: { 0:{cellWidth:8,halign:'center'}, 1:{cellWidth:75}, 2:{cellWidth:18,halign:'center'}, 3:{cellWidth:20,halign:'center'}, 4:{cellWidth:59} }
      });
      y = (doc as any).lastAutoTable.finalY + 4;

      // Comentarios de esta materia
      if (mat.comentarios.length > 0) {
        if (y > 255) { doc.addPage(); y = margen; }
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(31,45,41);
        doc.text(`Comentarios (${mat.comentarios.length})`, margen, y); y += 4;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(69,83,79);
        mat.comentarios.forEach((c, idx) => {
          if (y > 270) { doc.addPage(); y = margen; }
          const lineas = doc.splitTextToSize(`${idx + 1}. ${c}`, 180);
          doc.text(lineas, margen, y);
          y += lineas.length * 4.5 + 2;
        });
      }
      y += 6;
    }

    // Pie de página
    const total = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(150);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-MX')} · Página ${i} de ${total}`, 105, 292, { align: 'center' });
    }

    doc.save(`reporte_${this.reporte.idMaestro}_p${this.reporte.procesoId}.pdf`);
    this.generandoPdf = false;
  }
}