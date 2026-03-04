import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadComprobante, insertRegistro, generateUniqueCodigo, getNextRifaNumbers } from '../lib/firebase';
import { generateRegistroPDF } from '../lib/pdf';

const JERSEY_SIZES  = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const PULSERA_SIZES = ['S', 'M', 'L', '2XL', '3XL'];
const GENEROS       = ['Hombre', 'Mujer'];
const PRECIO_SOCIO   = 2400;
const PRECIO_GENERAL = 2600;
const IS_DEV = import.meta.env.DEV;

const PAYMENT_INFO = {
  banco:   'BBVA',
  titular: 'MARCO ANTONIO ALDANA GARCÍA',
  cuenta:  '4152 3145 8104 6524',
  clabe:   '012298015666093673',
};

const REQUIRED_FIELDS = [
  'nombre', 'email', 'telefono', 'procedencia', 'moto',
  'generoJersey', 'tallaJersey', 'tallaPulsera',
  'emergenciaNombre', 'emergenciaTelefono',
];

const PARTICIPANTE_REQUIRED = [
  'nombre', 'email', 'telefono', 'procedencia', 'moto',
  'generoJersey', 'tallaJersey', 'tallaPulsera',
];

const EMPTY_PARTICIPANTE = {
  nombre: '', email: '', telefono: '', procedencia: '', moto: '',
  generoJersey: '', tallaJersey: '', tallaPulsera: '',
  esSocio: false,
};

function precioParticipante(p) {
  return p.esSocio ? PRECIO_SOCIO : PRECIO_GENERAL;
}

/* ─── Helpers de UI ───────────────────────────────────────────── */
function inputCls(error) {
  return `w-full bg-white/[0.04] border ${
    error ? 'border-red-500/50' : 'border-white/10'
  } rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#0066CC]/60 focus:bg-white/[0.06] transition-all duration-200`;
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-[#0066CC] ml-1">*</span>}
        {hint && <span className="text-gray-600 font-normal ml-2 text-xs">({hint})</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-red-400 text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ title, onRemove, children }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6">
      {(title || onRemove) && (
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          {title && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.25em]">
              {title}
            </h3>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
              aria-label="Eliminar participante"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function SizePicker({ sizes, value, onChange, error }) {
  return (
    <div className="flex gap-2.5 flex-wrap">
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            value === s
              ? 'bg-[#0066CC] border-[#0066CC] text-white shadow-[0_0_16px_rgba(0,102,204,0.4)]'
              : `bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/30 ${error ? 'border-red-500/40' : 'border-white/10'}`
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function GenderPicker({ value, onChange, error }) {
  return (
    <div className="flex gap-3">
      {GENEROS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            value === g
              ? 'bg-[#0066CC] border-[#0066CC] text-white shadow-[0_0_16px_rgba(0,102,204,0.4)]'
              : `bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/30 ${error ? 'border-red-500/40' : 'border-white/10'}`
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

const STEPS = ['Datos', 'Pago', 'Confirmación'];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center mb-12">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done   = idx < current;
        const active = idx === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  done    ? 'bg-[#0066CC] text-white'
                  : active ? 'bg-[#0066CC] text-white ring-4 ring-[#0066CC]/20'
                  : 'bg-white/[0.06] text-gray-600'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium tracking-wide uppercase ${idx <= current ? 'text-[#0066CC]' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 md:w-24 h-px mx-3 mb-5 transition-all duration-500 ${idx < current ? 'bg-[#0066CC]' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Bloque de campos reutilizable por participante ─────────── */
function ParticipantFields({ data, errors, onField }) {
  const handleInput = (e) => {
    const { name, value } = e.target;
    onField(name, value);
  };

  return (
    <>
      <Field label="Nombre completo" required error={errors.nombre}>
        <input name="nombre" value={data.nombre} onChange={handleInput}
          placeholder="Ej. Juan García López" className={inputCls(errors.nombre)} />
      </Field>

      <Field label="Email" required error={errors.email}>
        <input name="email" type="email" value={data.email} onChange={handleInput}
          placeholder="correo@ejemplo.com" className={inputCls(errors.email)} />
      </Field>

      <Field label="Número de teléfono con WhatsApp" required error={errors.telefono}>
        <input name="telefono" type="tel" value={data.telefono} onChange={handleInput}
          placeholder="+52 55 1234 5678" className={inputCls(errors.telefono)} />
      </Field>

      <Field label="Ciudad de procedencia" required error={errors.procedencia}>
        <input name="procedencia" value={data.procedencia} onChange={handleInput}
          placeholder="Ej. Ciudad de México, CDMX" className={inputCls(errors.procedencia)} />
      </Field>

      <Field label="Modelo, color y placas de motocicleta" required error={errors.moto}>
        <input name="moto" value={data.moto} onChange={handleInput}
          placeholder="Ej. BMW R1250GS, Azul, ABC-123-D" className={inputCls(errors.moto)} />
      </Field>

      <Field
        label="Talla de Jersey"
        required
        error={errors.generoJersey || errors.tallaJersey}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Selecciona género y talla</span>
            {/* TODO: conectar con modal o imagen de guía de tallas */}
            <button
              type="button"
              className="text-xs text-[#0066CC] hover:text-[#4d9fff] transition-colors underline underline-offset-2"
            >
              Ver guía de tallas
            </button>
          </div>
          <GenderPicker
            value={data.generoJersey}
            onChange={(v) => onField('generoJersey', v)}
            error={errors.generoJersey}
          />
          <SizePicker
            sizes={JERSEY_SIZES}
            value={data.tallaJersey}
            onChange={(v) => onField('tallaJersey', v)}
            error={errors.tallaJersey}
          />
        </div>
      </Field>

      <Field label="Talla de Pulsera" required error={errors.tallaPulsera}>
        <SizePicker
          sizes={PULSERA_SIZES}
          value={data.tallaPulsera}
          onChange={(v) => onField('tallaPulsera', v)}
          error={errors.tallaPulsera}
        />
      </Field>

      {/* ── Membresía / Precio ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onField('esSocio', !data.esSocio)}
        onKeyDown={(e) => e.key === ' ' || e.key === 'Enter' ? onField('esSocio', !data.esSocio) : null}
        className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.08] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all duration-200 select-none"
      >
        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          data.esSocio ? 'bg-[#0066CC] border-[#0066CC]' : 'bg-transparent border-white/25'
        }`}>
          {data.esSocio && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200">Soy socio BMW AM</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.esSocio ? 'Tarifa especial para socios' : 'Tarifa general para no socios'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[#0066CC] font-black text-lg tabular-nums">
            ${data.esSocio ? '2,400' : '2,600'}
          </p>
          <p className="text-gray-600 text-[10px] uppercase tracking-wide">MXN</p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Formulario() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registroGuardado, setRegistroGuardado] = useState(null);

  /* ─── Participante principal ─── */
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', procedencia: '', moto: '',
    generoJersey: '', tallaJersey: '', tallaPulsera: '',
    esSocio: false,
    emergenciaNombre: '', emergenciaTelefono: '',
    notas: '',
  });

  /* ─── Participantes adicionales ─── */
  const [participantes, setParticipantes] = useState([]);
  const [participanteErrors, setParticipanteErrors] = useState([]);

  /* ─── Helpers ─── */
  const allParticipants = [form, ...participantes];
  const total = allParticipants.reduce((sum, p) => sum + precioParticipante(p), 0);

  /* ─── Handlers participante principal ─── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  /* ─── Handlers participantes adicionales ─── */
  const addParticipante = () => {
    setParticipantes((p) => [...p, { ...EMPTY_PARTICIPANTE }]);
    setParticipanteErrors((p) => [...p, {}]);
  };

  const removeParticipante = (idx) => {
    setParticipantes((p) => p.filter((_, i) => i !== idx));
    setParticipanteErrors((p) => p.filter((_, i) => i !== idx));
  };

  const updateParticipante = (idx, name, value) => {
    setParticipantes((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [name]: value } : p))
    );
    setParticipanteErrors((prev) => {
      const updated = [...prev];
      if (updated[idx]?.[name]) updated[idx] = { ...updated[idx], [name]: '' };
      return updated;
    });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* ─── Step 1 validation ─── */
  const handleStep1 = (e) => {
    e.preventDefault();
    const newErrors = {};

    REQUIRED_FIELDS.forEach((f) => {
      if (!form[f]?.trim()) newErrors[f] = 'Este campo es requerido';
    });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    const newPartErrors = participantes.map((p) => {
      const errs = {};
      PARTICIPANTE_REQUIRED.forEach((f) => {
        if (!p[f]?.trim()) errs[f] = 'Este campo es requerido';
      });
      if (p.email && !/\S+@\S+\.\S+/.test(p.email)) {
        errs.email = 'Ingresa un email válido';
      }
      return errs;
    });

    const hasPartErrors = newPartErrors.some((e) => Object.keys(e).length > 0);

    if (Object.keys(newErrors).length || hasPartErrors) {
      setErrors(newErrors);
      setParticipanteErrors(newPartErrors);
      return;
    }

    setStep(2);
    scrollTop();
  };

  /* ─── Step 2 submit → Firebase ─── */
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!IS_DEV && !comprobante) {
      setErrors((p) => ({ ...p, comprobante: 'Debes subir tu comprobante de pago' }));
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      let row;
      for (let intento = 0; intento < 5; intento++) {
        const codigo = await generateUniqueCodigo();

        const comprovanteUrl = comprobante
          ? await uploadComprobante(comprobante, codigo)
          : null;

        // Calcular cuántos números de rifa necesitamos (1 principal + extras)
        const totalParticipantes = 1 + participantes.length;
        const rifaNumbers = await getNextRifaNumbers(totalParticipantes);

        try {
          row = await insertRegistro({
            codigo,
            nombre:               form.nombre,
            email:                form.email,
            telefono:             form.telefono,
            procedencia:          form.procedencia,
            moto:                 form.moto,
            genero_jersey:        form.generoJersey,
            talla_jersey:         form.tallaJersey,
            talla_pulsera:        form.tallaPulsera,
            es_socio:             form.esSocio,
            precio:               precioParticipante(form),
            numero_rifa:          rifaNumbers[0],
            emergencia_nombre:    form.emergenciaNombre,
            emergencia_telefono:  form.emergenciaTelefono,
            notas:                form.notas || null,
            total_pago:           total,
            participantes_extra:  participantes.length > 0
              ? participantes.map((p, index) => ({
                  nombre:        p.nombre,
                  email:         p.email,
                  telefono:      p.telefono,
                  procedencia:   p.procedencia,
                  moto:          p.moto,
                  genero_jersey: p.generoJersey,
                  talla_jersey:  p.tallaJersey,
                  talla_pulsera: p.tallaPulsera,
                  es_socio:      p.esSocio,
                  precio:        precioParticipante(p),
                  numero_rifa:   rifaNumbers[index + 1],
                }))
              : null,
            comprobante_url: comprovanteUrl,
          });
          break;
        } catch (err) {
          if (err.message && err.message.includes('código ya existe')) {
            console.warn('Colisión de código, reintentando generación');
            continue;
          }
          throw err;
        }
      }

      if (!row) {
        throw new Error('No se pudo generar un código único para tu registro. Intenta de nuevo.');
      }

      setRegistroGuardado(row);
      setStep(3);
      scrollTop();
    } catch (err) {
      console.error(err);
      setSubmitError('Ocurrió un error al enviar tu registro. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors((p) => ({ ...p, comprobante: 'El archivo no debe superar 10 MB' }));
      return;
    }
    setComprobante(file);
    setErrors((p) => ({ ...p, comprobante: '' }));
  };

  const handleDownloadPDF = () => {
    if (!registroGuardado) return;
    const doc = generateRegistroPDF(registroGuardado);
    doc.save(`registro-bmwam-${registroGuardado.codigo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            {step === 3 ? 'Registro Enviado' : 'Registro'}
          </h1>
          {step === 1 && (
            <p className="text-gray-400 text-base font-light leading-relaxed max-w-md mx-auto">
              Por favor registra los siguientes datos para poder crear tu ID de participante.
            </p>
          )}
          {step === 2 && (
            <p className="text-gray-400 text-base font-light leading-relaxed max-w-md mx-auto">
              Realiza tu pago y sube el comprobante para completar el registro.
            </p>
          )}
        </motion.div>

        {step !== 3 && <StepBar current={step} />}

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════
              STEP 1 — DATOS
          ════════════════════════════════════════════════════ */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleStep1}
              className="space-y-6"
              noValidate
            >
              {/* ── Participante principal ── */}
              <Card>
                <ParticipantFields
                  data={form}
                  errors={errors}
                  onField={setField}
                />
              </Card>

              {/* ── Participantes adicionales ── */}
              <AnimatePresence>
                {participantes.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      title={`Participante ${idx + 2}`}
                      onRemove={() => removeParticipante(idx)}
                    >
                      <ParticipantFields
                        data={p}
                        errors={participanteErrors[idx] || {}}
                        onField={(name, value) => updateParticipante(idx, name, value)}
                      />
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* ── Botón agregar participante ── */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={addParticipante}
                className="w-full py-4 border-2 border-dashed border-white/15 hover:border-[#0066CC]/50 text-gray-500 hover:text-[#0066CC] font-semibold rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-2 hover:bg-[#0066CC]/[0.04]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar participante
              </motion.button>

              {/* ── Contacto de Emergencia ── */}
              <Card title="Contacto de Emergencia">
                <Field label="Nombre del contacto" required error={errors.emergenciaNombre}>
                  <input name="emergenciaNombre" value={form.emergenciaNombre} onChange={handleChange}
                    placeholder="Nombre completo" className={inputCls(errors.emergenciaNombre)} />
                </Field>

                <Field label="Número de teléfono de contacto" required error={errors.emergenciaTelefono}>
                  <input name="emergenciaTelefono" type="tel" value={form.emergenciaTelefono} onChange={handleChange}
                    placeholder="+52 55 1234 5678" className={inputCls(errors.emergenciaTelefono)} />
                </Field>
              </Card>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                className="w-full py-4 bg-[#0066CC] hover:bg-[#0052a3] text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,102,204,0.4)] text-sm tracking-wide flex items-center justify-center gap-3"
              >
                Continuar al Pago
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </motion.form>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 2 — PAGO
          ════════════════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}>

              {/* ── Resumen de pago ── */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 mb-6">
                <h3 className="text-base font-bold mb-5">Resumen de Pago</h3>
                <div className="space-y-3">
                  {/* Main participant */}
                  <div className="flex justify-between items-center text-sm gap-4">
                    <div>
                      <span className="text-gray-300 font-medium">{form.nombre || 'Participante 1'}</span>
                      <span className={`ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        form.esSocio
                          ? 'bg-[#0066CC]/20 text-[#6aadff]'
                          : 'bg-white/[0.06] text-gray-500'
                      }`}>
                        {form.esSocio ? 'Socio' : 'General'}
                      </span>
                    </div>
                    <span className="text-white font-semibold tabular-nums flex-shrink-0">
                      ${precioParticipante(form).toLocaleString('es-MX')} MXN
                    </span>
                  </div>

                  {/* Additional participants */}
                  {participantes.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm gap-4">
                      <div>
                        <span className="text-gray-300 font-medium">{p.nombre || `Participante ${idx + 2}`}</span>
                        <span className={`ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.esSocio
                            ? 'bg-[#0066CC]/20 text-[#6aadff]'
                            : 'bg-white/[0.06] text-gray-500'
                        }`}>
                          {p.esSocio ? 'Socio' : 'General'}
                        </span>
                      </div>
                      <span className="text-white font-semibold tabular-nums flex-shrink-0">
                        ${precioParticipante(p).toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-white font-bold">Total a pagar</span>
                    <span className="text-2xl font-black text-[#0066CC] tabular-nums">
                      ${total.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Datos bancarios */}
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#0066CC]/15 border border-[#0066CC]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Datos de Pago</h2>
                    <p className="text-gray-500 text-sm">Realiza la transferencia a la siguiente cuenta</p>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {[
                    { label: 'Banco',               value: PAYMENT_INFO.banco },
                    { label: 'Titular',             value: PAYMENT_INFO.titular },
                    { label: 'Número de Cuenta',    value: PAYMENT_INFO.cuenta },
                    { label: 'CLABE Interbancaria', value: PAYMENT_INFO.clabe },
                    { label: 'Concepto de Pago',    value: `Registro BMWAM 2026 - ${form.nombre}` },
                    { label: 'Total',               value: `$${total.toLocaleString('es-MX')} MXN` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3.5 gap-4">
                      <span className="text-gray-500 text-sm flex-shrink-0">{label}</span>
                      <span className={`text-sm font-semibold text-right ${label === 'Total' ? 'text-[#0066CC]' : 'text-white'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 bg-[#0066CC]/[0.08] border border-[#0066CC]/20 rounded-2xl p-4">
                  <svg className="w-4 h-4 text-[#0066CC] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#6aadff] text-xs leading-relaxed">
                    Una vez realizado el pago, sube tu comprobante a continuación para que podamos validar tu registro.
                  </p>
                </div>
              </div>

              {/* Upload + submit */}
              <form onSubmit={handleStep2}>
                <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold">Comprobante de Pago</h3>
                    {IS_DEV && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 border border-violet-500/30 text-violet-400">
                        DEV — opcional
                      </span>
                    )}
                    {!IS_DEV && <span className="text-[#0066CC] text-sm">*</span>}
                  </div>
                  <p className="text-gray-500 text-sm mb-6">
                    {IS_DEV
                      ? 'En desarrollo puedes omitir el comprobante. En producción es obligatorio.'
                      : 'Sube 1 archivo compatible. El tamaño máximo es de 10 MB.'}
                  </p>

                  <label className={`group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    comprobante ? 'border-[#0066CC]/60 bg-[#0066CC]/[0.06]'
                    : errors.comprobante ? 'border-red-500/50 bg-red-500/[0.04]'
                    : 'border-white/15 hover:border-[#0066CC]/50 hover:bg-[#0066CC]/[0.04]'
                  }`}>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,.pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFile} />
                    {comprobante ? (
                      <div className="text-center px-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#0066CC]/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-white text-sm font-semibold truncate max-w-[240px] mx-auto">{comprobante.name}</p>
                        <p className="text-gray-500 text-xs mt-1">{(comprobante.size / 1024 / 1024).toFixed(2)} MB · Toca para cambiar</p>
                      </div>
                    ) : (
                      <div className="text-center px-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-[#0066CC]/15 transition-colors">
                          <svg className="w-6 h-6 text-gray-500 group-hover:text-[#0066CC] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">
                          Arrastra tu imagen aquí o{' '}
                          <span className="text-[#0066CC]">haz clic para seleccionar</span>
                        </p>
                        <p className="text-gray-600 text-xs mt-2">PNG, JPG, WEBP, PDF — máx. 10 MB</p>
                      </div>
                    )}
                  </label>

                  <AnimatePresence>
                    {errors.comprobante && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-3 text-red-400 text-xs">{errors.comprobante}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error global */}
                <AnimatePresence>
                  {submitError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-sm">{submitError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); scrollTop(); }}
                    className="px-6 py-4 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-medium rounded-2xl transition-all duration-300 text-sm">
                    Regresar
                  </button>
                  <motion.button whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                    type="submit" disabled={loading}
                    className="flex-1 py-4 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,102,204,0.4)] text-sm tracking-wide flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Enviando...
                      </>
                    ) : 'Enviar Registro'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 3 — CONFIRMACIÓN + PDF
          ════════════════════════════════════════════════════ */}
          {step === 3 && registroGuardado && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="text-center">

              <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-10 md:p-14">
                {/* Icono */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#0066CC]/[0.12] border-2 border-[#0066CC]/30 flex items-center justify-center">
                  <svg className="w-11 h-11 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  {/* Badge estado */}
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-6">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">Pendiente de Aprobación</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">¡Registro Enviado!</h2>
                  <p className="text-gray-400 text-base font-light leading-relaxed max-w-md mx-auto mb-8">
                    Hemos recibido tu solicitud y comprobante de pago. Un administrador revisará tu registro y te notificará al correo proporcionado.
                  </p>

                  {/* Código de registro */}
                  <div className="bg-[#0066CC]/[0.08] border border-[#0066CC]/25 rounded-2xl p-6 mb-6">
                    <p className="text-gray-500 text-xs uppercase tracking-widest font-medium mb-2">Tu código de registro</p>
                    <p className="text-4xl font-black text-[#0066CC] tracking-[0.2em] mb-2">
                      {registroGuardado.codigo}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      Guarda este código. Lo necesitarás para consultar el estado de tu registro en{' '}
                      <span className="text-[#6aadff]">/status</span>
                    </p>
                  </div>

                  {/* ID de Rifa */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-8">
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.25em] font-semibold mb-3">
                      ID de Rifa
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{registroGuardado.nombre}</span>
                        <span className="font-black text-white tracking-widest text-lg">#{registroGuardado.rifa_id}</span>
                      </div>
                      {registroGuardado.participantes_extra?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">{p.nombre}</span>
                          <span className="font-black text-white tracking-widest text-lg">#{p.rifa_id}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-600 text-xs mt-3 leading-relaxed">
                      Conserva tu número de rifa para el sorteo del evento.
                    </p>
                  </div>

                  {/* Resumen */}
                  <div className="bg-[#080810] rounded-2xl p-6 text-left border border-white/[0.06] mb-8">
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.25em] font-semibold mb-4">Resumen del registro</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Participante',    value: registroGuardado.nombre },
                        { label: 'Email',            value: registroGuardado.email },
                        { label: 'Membresía',        value: registroGuardado.es_socio ? 'Socio BMW AM' : 'General' },
                        { label: 'Género Jersey',    value: registroGuardado.genero_jersey },
                        { label: 'Talla Jersey',     value: registroGuardado.talla_jersey },
                        { label: 'Talla Pulsera',    value: registroGuardado.talla_pulsera },
                        { label: 'Motocicleta',      value: registroGuardado.moto },
                        { label: 'Total pagado',     value: `$${registroGuardado.total_pago?.toLocaleString('es-MX')} MXN` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center text-sm gap-4">
                          <span className="text-gray-500">{label}</span>
                          <span className={`font-medium text-right ${label === 'Total pagado' ? 'text-[#0066CC]' : 'text-white'}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón descargar PDF */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPDF}
                    className="w-full py-4 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 text-white font-bold rounded-2xl transition-all duration-300 text-sm tracking-wide flex items-center justify-center gap-3 mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar PDF de Registro
                  </motion.button>

                  <p className="text-gray-600 text-xs">
                    ¿Tienes dudas? Contáctanos por WhatsApp
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
