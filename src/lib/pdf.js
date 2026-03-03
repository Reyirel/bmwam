import { jsPDF } from 'jspdf';

// Importación del logo - puede fallar en algunos entornos como Vercel
let logoBase64 = null;
try {
  // @ts-ignore
  const logoModule = await import('../assets/logo.png?inline');
  logoBase64 = logoModule?.default ?? logoModule ?? null;
} catch {
  // Silenciar error - el PDF se generará sin logo
  console.warn('[PDF] Logo no disponible, continuando sin logo');
}

const BLUE   = [0, 102, 204];   // #0066CC
const DARK   = [10, 10, 20];
const GRAY   = [120, 120, 130];
const WHITE  = [255, 255, 255];
const YELLOW = [234, 179, 8];
const GREEN  = [34, 197, 94];

/* ─── Shared header ───────────────────────────────────────────── */
function drawHeader(doc) {
  // Blue bar
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 210, 28, 'F');

  // Brand logo
  let logoAdded = false;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 6, 10, 10);
      logoAdded = true;
    } catch {
      // Error al agregar logo, continuar sin él
    }
  }

  // Brand text
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  // desplazar texto si hay logo
  const textOffset = logoAdded ? 14 + 10 + 4 : 14;
  doc.text('BMW AM', textOffset, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('GRAN COMPETENCIA 2026  ·  IXMIQUILPAN, HIDALGO', textOffset, 19);

  // Thin white line at bottom of header
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.3);
  doc.line(0, 27, 210, 27);
}

/* ─── Shared footer ───────────────────────────────────────────── */
function drawFooter(doc, pageHeight) {
  const y = pageHeight - 14;
  doc.setFillColor(240, 242, 248);
  doc.rect(0, y - 4, 210, 18, 'F');

  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  // logo pequeño al inicio del pie
  let startX = 14;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', startX, y + 1, 6, 6);
      startX += 6 + 2;
    } catch {
      // Error al agregar logo, continuar sin él
    }
  }
  doc.text(
    `BMWAM · Ixmiquilpan, Hidalgo · 2026  —  Generado el ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    startX,
    y + 4
  );
  doc.text('Este documento es de carácter informativo.', startX, y + 9);
}

/* ─── Data table helper ───────────────────────────────────────── */
function drawDataTable(doc, rows, startY) {
  let y = startY;
  const labelX = 14;
  const valueX = 85;
  const rowH   = 9;

  rows.forEach(([label, value], i) => {
    // Alternating row backgrounds
    if (i % 2 === 0) {
      doc.setFillColor(245, 247, 252);
      doc.rect(14, y - 5.5, 182, rowH, 'F');
    }

    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label, labelX + 3, y);

    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(value || '—'), valueX, y);

    y += rowH;
  });

  // Bottom border of table
  doc.setDrawColor(220, 223, 235);
  doc.setLineWidth(0.3);
  doc.line(14, y - 2, 196, y - 2);

  return y;
}

/* ─── Status badge ────────────────────────────────────────────── */
function drawStatusBadge(doc, estado, x, y) {
  const labels = { pendiente: 'PENDIENTE', aprobado: 'APROBADO', rechazado: 'RECHAZADO' };
  const colors = {
    pendiente: YELLOW,
    aprobado:  GREEN,
    rechazado: [239, 68, 68],
  };

  const label = labels[estado] ?? estado.toUpperCase();
  const color = colors[estado] ?? GRAY;

  // Pill background
  doc.setFillColor(...color.map(c => Math.min(255, c + 180)));
  doc.roundedRect(x, y - 5, 42, 9, 2, 2, 'F');

  // Border
  doc.setDrawColor(...color);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y - 5, 42, 9, 2, 2, 'S');

  // Text
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(label, x + 21, y + 0.5, { align: 'center' });
}

/* ═══════════════════════════════════════════════════════════════
   PDF 1 — COMPROBANTE DE REGISTRO (estado: PENDIENTE)
═══════════════════════════════════════════════════════════════ */
export function generateRegistroPDF(registro) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  drawHeader(doc);

  /* ── Título ── */
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Comprobante de Registro', 14, 42);

  /* ── Código de registro ── */
  // Box
  doc.setFillColor(0, 102, 204, 0.06);
  doc.setFillColor(235, 243, 255);
  doc.roundedRect(14, 48, W - 28, 28, 3, 3, 'F');
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 48, W - 28, 28, 3, 3, 'S');

  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('CÓDIGO DE REGISTRO', W / 2, 55, { align: 'center' });

  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(registro.codigo, W / 2, 68, { align: 'center' });

  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Guarda este código — lo necesitarás para consultar tu estado en bmwam.com/status', W / 2, 73, { align: 'center' });

  /* ── Estado ── */
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('ESTADO ACTUAL', 14, 90);
  drawStatusBadge(doc, 'pendiente', 14, 98);

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'Tu solicitud de inscripción ha sido recibida y se encuentra en revisión.',
    62, 94
  );
  doc.text(
    'Recibirás confirmación una vez que un administrador apruebe tu registro.',
    62, 100
  );

  /* ── Datos del participante ── */
  doc.setFillColor(...BLUE);
  doc.rect(14, 110, 4, 7, 'F');
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Datos del Participante', 21, 116);

  const rows = [
    ['Nombre completo',      registro.nombre],
    ['Email',                registro.email],
    ['Teléfono (WhatsApp)',  registro.telefono],
    ['Procedencia',          registro.procedencia],
    ['Motocicleta',          registro.moto],
    ['Talla de Jersey',      registro.talla_jersey],
    ['Nombre en Jersey',     registro.nombre_jersey],
  ];

  if (registro.acomp_nombre) {
    rows.push(['Jersey Acompañante', registro.acomp_nombre]);
    rows.push(['Talla Acompañante',  registro.acomp_talla]);
  }

  drawDataTable(doc, rows, 126);

  /* ── Fecha ── */
  const fecha = new Date(registro.created_at).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Registro creado el: ${fecha}`, 14, 220);

  /* ── Instrucción ── */
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(14, 225, W - 28, 18, 2, 2, 'F');
  doc.setDrawColor(...YELLOW);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 225, W - 28, 18, 2, 2, 'S');

  doc.setTextColor(161, 98, 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('¿Cómo consultar tu estado?', 19, 232);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Visita bmwam.com/status e ingresa tu código: ${registro.codigo}`,
    19, 238
  );

  drawFooter(doc, H);
  return doc;
}

/* ═══════════════════════════════════════════════════════════════
   PDF 2 — CONFIRMACIÓN DE APROBACIÓN
═══════════════════════════════════════════════════════════════ */
export function generateAprobadoPDF(registro) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  drawHeader(doc);

  /* ── Título ── */
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Confirmación de Participación', 14, 42);

  /* ── Banner de aprobado ── */
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(14, 48, W - 28, 28, 3, 3, 'F');
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 48, W - 28, 28, 3, 3, 'S');

  doc.setTextColor(...GREEN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('¡PARTICIPACIÓN CONFIRMADA!', W / 2, 60, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Tu inscripción ha sido validada y aprobada por el equipo BMWAM.', W / 2, 68, { align: 'center' });

  /* ── Estado + código ── */
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('ESTADO', 14, 87);
  drawStatusBadge(doc, 'aprobado', 14, 95);

  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('CÓDIGO DE REGISTRO', 70, 87);
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(registro.codigo, 70, 96);

  /* ── Datos del participante ── */
  doc.setFillColor(...GREEN);
  doc.rect(14, 108, 4, 7, 'F');
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Datos del Participante', 21, 114);

  const rows = [
    ['Nombre completo',      registro.nombre],
    ['Email',                registro.email],
    ['Teléfono (WhatsApp)',  registro.telefono],
    ['Procedencia',          registro.procedencia],
    ['Motocicleta',          registro.moto],
    ['Talla de Jersey',      registro.talla_jersey],
    ['Nombre en Jersey',     registro.nombre_jersey],
  ];

  if (registro.acomp_nombre) {
    rows.push(['Jersey Acompañante', registro.acomp_nombre]);
    rows.push(['Talla Acompañante',  registro.acomp_talla]);
  }

  drawDataTable(doc, rows, 124);

  /* ── Evento info ── */
  doc.setFillColor(235, 243, 255);
  doc.roundedRect(14, 215, W - 28, 26, 2, 2, 'F');
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 215, W - 28, 26, 2, 2, 'S');

  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Información del Evento', 19, 223);

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Gran Competencia BMWAM 2026  ·  Ixmiquilpan, Hidalgo', 19, 229);
  doc.text('Consulta los detalles del evento en bmwam.com', 19, 235);

  drawFooter(doc, H);
  return doc;
}
