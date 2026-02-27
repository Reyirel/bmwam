import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllRegistros, updateEstado, getAdminCredentials } from '../lib/firebase';

/* ─── Helpers ─────────────────────────────────────────────────── */
const ESTADO_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    dot:   'bg-yellow-400',
    badge: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  },
  aprobado: {
    label: 'Aprobado',
    dot:   'bg-emerald-400',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  rechazado: {
    label: 'Rechazado',
    dot:   'bg-red-400',
    badge: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
};

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${estado === 'pendiente' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function SocioBadge({ esSocio }) {
  return esSocio ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0066CC]/20 border border-[#0066CC]/30 text-[#6aadff]">
      Socio
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] border border-white/10 text-gray-500">
      General
    </span>
  );
}

/* ─── Componentes reutilizables del modal ─────────────────────── */
function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.25em] mb-3">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-right ${highlight ? 'text-[#6aadff] font-bold' : 'text-gray-200'}`}>{value ?? '—'}</span>
    </div>
  );
}

/* ─── Bloque de un participante en el modal ───────────────────── */
function ParticipanteDetalle({ p, titulo }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-1">
      <p className="text-[10px] font-bold text-[#0066CC] uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
        {titulo}
        <SocioBadge esSocio={p.es_socio} />
      </p>
      <Row label="Nombre"        value={p.nombre} />
      {p.email     && <Row label="Email"     value={p.email} />}
      {p.telefono  && <Row label="Teléfono"  value={p.telefono} />}
      {p.procedencia && <Row label="Ciudad"  value={p.procedencia} />}
      {p.moto      && <Row label="Moto"      value={p.moto} />}
      <Row label="Género Jersey"  value={p.genero_jersey} />
      <Row label="Talla Jersey"   value={p.talla_jersey} />
      <Row label="Nombre Jersey"  value={p.nombre_jersey} />
      <Row label="Talla Pulsera"  value={p.talla_pulsera} />
      <Row label="Precio"         value={p.precio ? `$${Number(p.precio).toLocaleString('es-MX')} MXN` : '—'} />
      <Row label="# Rifa"         value={p.rifa_id ? `#${p.rifa_id}` : '—'} highlight />
    </div>
  );
}

/* ─── Modal de detalle ────────────────────────────────────────── */
function DetalleModal({ registro, onClose, onCambiarEstado }) {
  const [loadingEstado, setLoadingEstado] = useState(null);

  const handleCambiar = async (nuevoEstado) => {
    setLoadingEstado(nuevoEstado);
    await onCambiarEstado(registro.id, nuevoEstado);
    setLoadingEstado(null);
  };

  const extras = registro.participantes_extra ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#0d0d14] border border-white/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur-xl border-b border-white/[0.06] px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-base font-bold">{registro.nombre}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-gray-600 text-xs font-mono bg-white/[0.06] px-2 py-0.5 rounded-md tracking-widest">
                {registro.codigo}
              </span>
              <span className="text-gray-600 text-xs font-bold">
                Rifa <span className="text-white">#{registro.rifa_id}</span>
              </span>
              <span className="text-gray-600 text-xs">· {formatFecha(registro.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EstadoBadge estado={registro.estado} />
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Participante principal */}
          <ParticipanteDetalle
            p={{
              nombre:        registro.nombre,
              email:         registro.email,
              telefono:      registro.telefono,
              procedencia:   registro.procedencia,
              moto:          registro.moto,
              genero_jersey: registro.genero_jersey,
              talla_jersey:  registro.talla_jersey,
              nombre_jersey: registro.nombre_jersey,
              talla_pulsera: registro.talla_pulsera,
              es_socio:      registro.es_socio,
              precio:        registro.precio,
              rifa_id:       registro.rifa_id,
            }}
            titulo="Participante 1 (Principal)"
          />

          {/* Participantes adicionales */}
          {extras.length > 0 && extras.map((p, idx) => (
            <ParticipanteDetalle
              key={idx}
              p={p}
              titulo={`Participante ${idx + 2}`}
            />
          ))}

          {/* Resumen de pago */}
          <Section title="Pago">
            <Row label="Total"
              value={registro.total_pago ? `$${Number(registro.total_pago).toLocaleString('es-MX')} MXN` : '—'}
              highlight />
            <Row label="Participantes" value={1 + extras.length} />
          </Section>

          {/* Contacto de Emergencia */}
          <Section title="Contacto de Emergencia">
            <Row label="Nombre"    value={registro.emergencia_nombre} />
            <Row label="Teléfono"  value={registro.emergencia_telefono} />
          </Section>

          {registro.notas && (
            <Section title="Notas Adicionales">
              <p className="text-gray-300 text-sm leading-relaxed">{registro.notas}</p>
            </Section>
          )}

          {registro.comprobante_url && (
            <Section title="Comprobante de Pago">
              <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-[#0066CC]/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 truncate flex-1">Comprobante adjunto</span>
                <a href={registro.comprobante_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#0066CC] text-xs font-semibold hover:underline flex-shrink-0">
                  Ver
                </a>
              </div>
            </Section>
          )}

          {/* Acciones */}
          {registro.estado === 'pendiente' && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleCambiar('rechazado')} disabled={!!loadingEstado}
                className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                {loadingEstado === 'rechazado' ? <Spinner /> : null}
                Rechazar
              </button>
              <button onClick={() => handleCambiar('aprobado')} disabled={!!loadingEstado}
                className="flex-1 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                {loadingEstado === 'aprobado' ? <Spinner /> : null}
                Aprobar
              </button>
            </div>
          )}
          {registro.estado !== 'pendiente' && (
            <button onClick={() => handleCambiar('pendiente')} disabled={!!loadingEstado}
              className="w-full py-3 rounded-xl border border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 disabled:opacity-50 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
              {loadingEstado === 'pendiente' ? <Spinner /> : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Restablecer a Pendiente
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoginModal({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email.trim(), password);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0d0d14] border border-white/[0.08] rounded-3xl w-full max-w-sm p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-white">Acceso de Administrador</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label className="text-gray-400 text-sm">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/[0.05] text-white placeholder-gray-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/[0.05] text-white placeholder-gray-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold rounded-full transition-all duration-200"
        >
          Entrar
        </button>
      </motion.form>
    </motion.div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AdminPanel() {
  const [registros, setRegistros]       = useState([]);
  const [filtro, setFiltro]             = useState('todos');
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [authorized, setAuthorized]     = useState(false);
  const [adminCreds, setAdminCreds]     = useState(null);
  const [loginError, setLoginError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const creds = await getAdminCredentials();
        setAdminCreds(creds);
      } catch (err) {
        console.error('Error al obtener credenciales de admin', err);
        setLoginError('No se pudo cargar el sistema de autenticación.');
      }
    })();

    const stored = localStorage.getItem('bmwam_admin_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.expires && Date.now() < parsed.expires) {
          setAuthorized(true);
        } else {
          localStorage.removeItem('bmwam_admin_auth');
        }
      } catch (_e) {
        localStorage.removeItem('bmwam_admin_auth');
      }
    }
  }, []);

  const handleLogin = (email, password) => {
    if (!adminCreds) return;
    if (email === adminCreds.email && password === adminCreds.password) {
      setAuthorized(true);
      setLoginError('');
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('bmwam_admin_auth', JSON.stringify({ expires }));
    } else {
      setLoginError('Correo o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setAuthorized(false);
    localStorage.removeItem('bmwam_admin_auth');
  };

  const fetchRegistros = useCallback(async () => {
    if (!authorized) return;
    try {
      const data = await getAllRegistros();
      setRegistros(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los registros. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [authorized]);

  useEffect(() => { fetchRegistros(); }, [fetchRegistros]);

  const cambiarEstado = async (id, nuevoEstado) => {
    await updateEstado(id, nuevoEstado);
    setRegistros((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
    );
  };

  const counts = {
    todos:     registros.length,
    pendiente: registros.filter((r) => r.estado === 'pendiente').length,
    aprobado:  registros.filter((r) => r.estado === 'aprobado').length,
    rechazado: registros.filter((r) => r.estado === 'rechazado').length,
  };

  // Total de participantes incluyendo extras
  const totalParticipantes = registros.reduce((sum, r) => {
    return sum + 1 + (r.participantes_extra?.length ?? 0);
  }, 0);

  // Total recaudado
  const totalRecaudado = registros
    .filter((r) => r.estado === 'aprobado')
    .reduce((sum, r) => sum + (r.total_pago ?? 0), 0);

  const filtrados = filtro === 'todos'
    ? registros
    : registros.filter((r) => r.estado === filtro);

  const registroSeleccionado = registros.find((r) => r.id === seleccionado?.id) ?? null;

  return (
    <>
      {!authorized && adminCreds && (
        <AnimatePresence>
          <LoginModal onLogin={handleLogin} error={loginError} />
        </AnimatePresence>
      )}

      {authorized && (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto">

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase mb-2">Panel de Administración</p>
                  <h1 className="text-4xl font-black tracking-tight">Registros</h1>
                  <p className="text-gray-500 text-sm mt-1">Gran Competencia BMWAM 2026 · Ixmiquilpan, Hidalgo</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={fetchRegistros}
                    className="flex items-center gap-2 px-4 py-2.5 border border-white/10 hover:border-white/25 rounded-xl text-gray-400 hover:text-white text-sm transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </button>
                  <button onClick={handleLogout}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Error ── */}
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

            {/* ── Stats ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { key: 'todos',     label: 'Registros',     color: 'text-white',       border: 'border-white/10',          value: counts.todos },
                { key: 'pendiente', label: 'Pendientes',    color: 'text-yellow-400',  border: 'border-yellow-500/20',     value: counts.pendiente },
                { key: 'aprobado',  label: 'Aprobados',     color: 'text-emerald-400', border: 'border-emerald-500/20',    value: counts.aprobado },
                { key: 'rechazado', label: 'Rechazados',    color: 'text-red-400',     border: 'border-red-500/20',        value: counts.rechazado },
                { key: null,        label: 'Participantes', color: 'text-[#6aadff]',   border: 'border-[#0066CC]/20',      value: totalParticipantes },
                { key: null,        label: 'Recaudado',     color: 'text-emerald-400', border: 'border-emerald-500/20',    value: `$${totalRecaudado.toLocaleString('es-MX')}` },
              ].map(({ key, label, color, border, value }, i) => (
                key !== null ? (
                  <button key={label} onClick={() => setFiltro(key)}
                    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
                      filtro === key ? `${border} bg-white/[0.06]` : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}>
                    {filtro === key && (
                      <motion.div layoutId="stat-active" className="absolute inset-0 rounded-2xl bg-white/[0.04] border border-[#0066CC]/30" />
                    )}
                    <div className={`text-3xl font-black tabular-nums ${color}`}>
                      {loading ? '—' : value}
                    </div>
                    <div className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wide">{label}</div>
                  </button>
                ) : (
                  <div key={label} className={`relative p-5 rounded-2xl border text-left ${border} bg-white/[0.02]`}>
                    <div className={`text-2xl font-black tabular-nums leading-tight ${color}`}>
                      {loading ? '—' : value}
                    </div>
                    <div className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wide">{label}</div>
                  </div>
                )
              ))}
            </motion.div>

            {/* ── Tabla ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-3xl overflow-hidden">

              {/* Cabecera desktop */}
              <div className="hidden lg:grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-white/[0.06] text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em]">
                <span>Código</span>
                <span>Participante</span>
                <span>Motocicleta</span>
                <span className="text-center">Rifa</span>
                <span className="text-center">Tipo</span>
                <span className="text-center">Jersey · Pulsera</span>
                <span>Estado</span>
                <span />
              </div>

              {/* Filas */}
              <div className="divide-y divide-white/[0.05]">
                {loading ? (
                  <div className="py-20 flex items-center justify-center gap-3 text-gray-600">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-sm">Cargando registros...</span>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filtrados.length === 0 ? (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="py-20 text-center text-gray-600 text-sm">
                        No hay registros en esta categoría.
                      </motion.div>
                    ) : (
                      filtrados.map((r) => {
                        const numExtras = r.participantes_extra?.length ?? 0;
                        return (
                          <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                            className="px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            onClick={() => setSeleccionado(r)}>

                            {/* Mobile */}
                            <div className="lg:hidden flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-white text-sm font-semibold truncate">{r.nombre}</span>
                                  <span className="text-[10px] font-mono text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded flex-shrink-0">{r.codigo}</span>
                                  {r.rifa_id && (
                                    <span className="text-[10px] font-bold text-[#6aadff] bg-[#0066CC]/10 px-1.5 py-0.5 rounded flex-shrink-0">#{r.rifa_id}</span>
                                  )}
                                  <SocioBadge esSocio={r.es_socio} />
                                </div>
                                <p className="text-gray-500 text-xs truncate">{r.moto}</p>
                                {numExtras > 0 && (
                                  <p className="text-gray-600 text-xs mt-0.5">+{numExtras} acompañante{numExtras > 1 ? 's' : ''}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <EstadoBadge estado={r.estado} />
                                <span className="text-gray-600 text-xs">{formatFecha(r.created_at)}</span>
                                {r.total_pago && (
                                  <span className="text-[#6aadff] text-xs font-bold tabular-nums">
                                    ${Number(r.total_pago).toLocaleString('es-MX')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden lg:grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto_auto] gap-4 items-center">
                              <div>
                                <span className="text-xs font-mono text-gray-500 bg-white/[0.05] px-2.5 py-1 rounded-lg tracking-widest block">
                                  {r.codigo}
                                </span>
                                <span className="text-gray-600 text-[10px] mt-1 block">{formatFecha(r.created_at)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{r.nombre}</p>
                                <p className="text-gray-500 text-xs mt-0.5 truncate">{r.email}</p>
                                {numExtras > 0 && (
                                  <p className="text-[#0066CC] text-[10px] mt-0.5">
                                    +{numExtras} acompañante{numExtras > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-gray-300 text-sm truncate">{r.moto}</p>
                                <p className="text-gray-600 text-xs mt-0.5">{r.procedencia}</p>
                              </div>
                              {/* Rifa ID */}
                              <div className="text-center">
                                {r.rifa_id ? (
                                  <span className="font-black text-white tabular-nums text-base">#{r.rifa_id}</span>
                                ) : (
                                  <span className="text-gray-700 text-xs">—</span>
                                )}
                              </div>
                              {/* Tipo socio */}
                              <div className="text-center">
                                <SocioBadge esSocio={r.es_socio} />
                                {r.precio && (
                                  <p className="text-gray-600 text-[10px] mt-1 tabular-nums">${Number(r.precio).toLocaleString('es-MX')}</p>
                                )}
                              </div>
                              {/* Jersey + Pulsera */}
                              <div className="text-center">
                                <div className="inline-flex items-center gap-1">
                                  <span className="bg-[#0066CC]/15 border border-[#0066CC]/20 text-[#6aadff] text-xs font-bold px-2 py-0.5 rounded-lg">
                                    {r.talla_jersey}
                                  </span>
                                  {r.talla_pulsera && (
                                    <span className="bg-white/[0.06] border border-white/10 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                                      {r.talla_pulsera}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-[10px] mt-1">{r.nombre_jersey} · {r.genero_jersey}</p>
                              </div>
                              <EstadoBadge estado={r.estado} />
                              {/* Acciones rápidas */}
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                {r.estado === 'pendiente' ? (
                                  <>
                                    <button onClick={() => cambiarEstado(r.id, 'rechazado')} title="Rechazar"
                                      className="w-8 h-8 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/15 flex items-center justify-center transition-colors">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                    <button onClick={() => cambiarEstado(r.id, 'aprobado')} title="Aprobar"
                                      className="w-8 h-8 rounded-lg border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 flex items-center justify-center transition-colors">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => cambiarEstado(r.id, 'pendiente')} title="Restablecer"
                                    className="w-8 h-8 rounded-lg border border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20 flex items-center justify-center transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                <p className="text-gray-600 text-xs">
                  Mostrando <span className="text-gray-400 font-semibold">{filtrados.length}</span> de{' '}
                  <span className="text-gray-400 font-semibold">{registros.length}</span> registros
                  {totalParticipantes > registros.length && (
                    <span> · <span className="text-[#6aadff] font-semibold">{totalParticipantes}</span> participantes en total</span>
                  )}
                </p>
                {counts.pendiente > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-gray-600 text-xs">{counts.pendiente} pendientes de revisión</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Modal */}
          <AnimatePresence>
            {registroSeleccionado && (
              <DetalleModal
                registro={registroSeleccionado}
                onClose={() => setSeleccionado(null)}
                onCambiarEstado={cambiarEstado}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
