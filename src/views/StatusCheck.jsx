import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRegistroByCodigo } from '../lib/firebase';
import { generateAprobadoPDF } from '../lib/pdf';

/* ─── Estado config ───────────────────────────────────────────── */
const ESTADO_UI = {
  pendiente: {
    icon: (
      <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg:  'bg-yellow-400/10 border-yellow-400/25',
    badge:   'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    dot:     'bg-yellow-400 animate-pulse',
    label:   'Pendiente de Aprobación',
    title:   'Tu registro está en revisión',
    message: 'Un administrador está verificando tu comprobante de pago. Te notificaremos por correo electrónico cuando tu registro sea procesado. Por favor vuelve a consultar en esta página en las próximas horas.',
  },
  aprobado: {
    icon: (
      <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg:  'bg-emerald-400/10 border-emerald-400/25',
    badge:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    dot:     'bg-emerald-400',
    label:   'Aprobado',
    title:   '¡Tu participación está confirmada!',
    message: 'Tu inscripción ha sido validada y aprobada. Descarga tu comprobante oficial de participación a continuación.',
  },
  rechazado: {
    icon: (
      <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg:  'bg-red-400/10 border-red-400/25',
    badge:   'bg-red-500/10 border-red-500/20 text-red-400',
    dot:     'bg-red-400',
    label:   'No Aprobado',
    title:   'Tu registro no fue aprobado',
    message: 'Lamentablemente tu registro no pudo ser procesado. Por favor contacta al equipo BMWAM por WhatsApp para más información o para realizar un nuevo registro.',
  },
};

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function StatusCheck() {
  const [codigo, setCodigo]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [registro, setRegistro]   = useState(null);
  const [notFound, setNotFound]   = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const code = codigo.trim().toUpperCase();
    if (code.length !== 8) return;

    setLoading(true);
    setNotFound(false);
    setError('');
    setRegistro(null);
    setSearched(false);

    try {
      const data = await getRegistroByCodigo(code);
      if (!data) {
        setNotFound(true);
      } else {
        setRegistro(data);
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al consultar. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!registro) return;
    const doc = generateAprobadoPDF(registro);
    doc.save(`aprobado-bmwam-${registro.codigo}.pdf`);
  };

  const ui = registro ? ESTADO_UI[registro.estado] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-6">
      <div className="max-w-xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-center mb-12">
          <p className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase mb-4">
            Gran Competencia BMWAM 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Estado de Registro
          </h1>
          <p className="text-gray-400 text-base font-light leading-relaxed max-w-md mx-auto">
            Ingresa tu código de 8 caracteres para consultar el estado de tu inscripción.
          </p>
        </motion.div>

        {/* ── Buscador ── */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          onSubmit={handleSearch} className="mb-8">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 md:p-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Código de Registro <span className="text-[#0066CC]">*</span>
            </label>
            <div className="flex gap-3">
              <input
                value={codigo}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
                  setCodigo(val);
                  if (searched) { setRegistro(null); setNotFound(false); setSearched(false); }
                }}
                placeholder="Ej. A3F8C2D1"
                maxLength={8}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-base font-mono tracking-[0.2em] uppercase focus:outline-none focus:border-[#0066CC]/60 focus:bg-white/[0.06] transition-all duration-200"
                spellCheck={false}
              />
              <motion.button whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.97 }}
                type="submit" disabled={loading || codigo.length !== 8}
                className="px-6 py-3 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,204,0.4)] text-sm flex items-center gap-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                Consultar
              </motion.button>
            </div>
            <p className="text-gray-600 text-xs mt-3">
              El código lo recibiste al finalizar tu registro — también aparece en tu PDF de confirmación.
            </p>
          </div>
        </motion.form>

        {/* ── Error de red ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── No encontrado ── */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Código no encontrado</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                No encontramos ningún registro con el código{' '}
                <span className="text-white font-mono font-bold">{codigo}</span>.
                Verifica que lo hayas ingresado correctamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Resultado ── */}
        <AnimatePresence>
          {registro && ui && (
            <motion.div key={registro.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>

              {/* Card de estado */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 mb-5">
                <div className="flex items-start gap-5 mb-6">
                  <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${ui.iconBg}`}>
                    {ui.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-2 ${ui.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`} />
                      {ui.label}
                    </div>
                    <h2 className="text-xl font-black tracking-tight mb-2">{ui.title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">{ui.message}</p>
                  </div>
                </div>

                {/* Datos del registro */}
                <div className="bg-[#080810] rounded-2xl p-5 border border-white/[0.05]">
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.25em] font-semibold mb-4">
                    Detalles del registro
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: 'Código',          value: registro.codigo },
                      { label: 'Participante',     value: registro.nombre },
                      { label: 'Email',            value: registro.email },
                      { label: 'Talla Jersey',     value: registro.talla_jersey },
                      { label: 'Nombre en Jersey', value: registro.nombre_jersey },
                      { label: 'Motocicleta',      value: registro.moto },
                      { label: 'Fecha de Registro',value: formatFecha(registro.created_at) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-4 text-sm">
                        <span className="text-gray-500 flex-shrink-0">{label}</span>
                        <span className={`text-right font-medium ${label === 'Código' ? 'text-[#0066CC] font-mono tracking-widest' : 'text-gray-200'}`}>
                          {value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Acción: descargar PDF si aprobado */}
              {registro.estado === 'aprobado' && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="w-full py-4 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl transition-all duration-300 text-sm tracking-wide flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Comprobante de Aprobación
                </motion.button>
              )}

              {/* Acción: WhatsApp si rechazado */}
              {registro.estado === 'rechazado' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 bg-red-500/[0.06] border border-red-500/15 rounded-2xl p-5">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-1">¿Necesitas ayuda?</p>
                    <p className="text-red-400/70 text-xs leading-relaxed">
                      Contacta al equipo BMWAM por WhatsApp para aclarar tu situación o iniciar un nuevo proceso de registro.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
