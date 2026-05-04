import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function formatMXN(amount) {
  return `$${Number(amount ?? 0).toLocaleString('es-MX')} MXN`;
}

function getRifaId(r) {
  return r.numero_rifa || r.rifa_id || '—';
}

async function sendOne(params) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS no configurado — agrega VITE_EMAILJS_* al .env');
    return;
  }
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
}

function baseParams(registro, estado, asunto, mensaje) {
  return {
    codigo:      registro.codigo,
    evento:      'XV Convención Internacional BMW AM 2026',
    status_url:  `${window.location.origin}/status`,
    whatsapp:    '7721227378',
    estado,
    asunto,
    mensaje,
  };
}

export async function sendConfirmationEmails(registro) {
  const base = baseParams(
    registro,
    '⏳ Pendiente de Aprobación',
    `Registro BMWAM 2026 recibido — Código: ${registro.codigo}`,
    'Hemos recibido tu comprobante de pago. Un administrador lo revisará y te notificará cuando sea aprobado.',
  );

  const participantes = [
    {
      to_email:    registro.email,
      to_name:     registro.nombre,
      rifa_id:     `#${getRifaId(registro)}`,
      moto:        registro.moto,
      procedencia: registro.procedencia,
      membresia:   registro.es_socio ? 'Socio BMW AM' : 'General',
      total:       formatMXN(registro.total_pago),
    },
    ...(registro.participantes_extra ?? []).map((p) => ({
      to_email:    p.email,
      to_name:     p.nombre,
      rifa_id:     `#${getRifaId(p)}`,
      moto:        p.moto,
      procedencia: p.procedencia,
      membresia:   p.es_socio ? 'Socio BMW AM' : 'General',
      total:       formatMXN(p.precio),
    })),
  ];

  for (const p of participantes) {
    await sendOne({ ...base, ...p });
  }
}

export async function sendStatusEmail(registro, nuevoEstado) {
  const isAprobado = nuevoEstado === 'aprobado';

  const base = baseParams(
    registro,
    isAprobado ? '✅ Aprobado' : '❌ No Aprobado',
    isAprobado
      ? `✅ Registro aprobado — BMWAM 2026 | ${registro.codigo}`
      : `❌ Registro no aprobado — BMWAM 2026 | ${registro.codigo}`,
    isAprobado
      ? '¡Tu pago fue verificado y tu lugar en la convención está confirmado! Nos vemos en Ixmiquilpan.'
      : 'Tu comprobante de pago no pudo ser verificado. Por favor contáctanos por WhatsApp para aclarar tu situación.',
  );

  const participantes = [
    {
      to_email:    registro.email,
      to_name:     registro.nombre,
      rifa_id:     `#${getRifaId(registro)}`,
      moto:        registro.moto,
      procedencia: registro.procedencia,
      membresia:   registro.es_socio ? 'Socio BMW AM' : 'General',
      total:       formatMXN(registro.total_pago),
    },
    ...(isAprobado ? (registro.participantes_extra ?? []).map((p) => ({
      to_email:    p.email,
      to_name:     p.nombre,
      rifa_id:     `#${getRifaId(p)}`,
      moto:        p.moto,
      procedencia: p.procedencia,
      membresia:   p.es_socio ? 'Socio BMW AM' : 'General',
      total:       formatMXN(p.precio),
    })) : []),
  ];

  for (const p of participantes) {
    await sendOne({ ...base, ...p });
  }
}
