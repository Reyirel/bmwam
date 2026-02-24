import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import heroImage from '../assets/herosetionimage.png';
import secondImage from '../assets/imagen2.png'
import imagen3 from '../assets/imagen3.png'

/* ─── Animated Counter ─────────────────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return ctrl.stop;
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Section fade-in wrapper ──────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ──────────────────────────────────────────────────────── */
const STATS = [
  { value: 4,   suffix: '',     label: 'Categorías de Competencia' },
  { value: 3,   suffix: '',     label: 'Rutas Diseñadas' },
  { value: 300, suffix: '+',   label: 'Cupos Disponibles' },
  { value: 120, suffix: ' km', label: 'Total de Recorrido' },
];

const COSTS = [
  {
    tag: 'Socios',
    label: 'Socios BMW AM',
    price: '$3,200.00',
    currency: 'MXN',
  },
  {
    tag: 'General',
    label: 'No Socios',
    price: '$3,450.00',
    currency: 'MXN',
    featured: true,
  },
];

/* ─── Component ─────────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const bgY      = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const textY    = useTransform(scrollYProgress, [0, 1], ['0%', '55%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <div className="bg-[#050505] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          HERO — PARALLAX
      ══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden flex items-center justify-center">

        {/* Parallax background */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 w-full h-[135%] top-[-17.5%]"
        >
          <img
            src={heroImage}
            alt="BMW hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-[#050505]/40" />
        </motion.div>

        {/* Hero text */}
        <motion.div
          style={{ y: textY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-[#0066CC] text-xs font-semibold uppercase mb-6 tracking-[0.5em]"
          >
            BMWAM · Ixmiquilpan, Hidalgo
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl sm:text-7xl md:text-[88px] font-black leading-[1.02] mb-6 tracking-tight"
          >
            <span className="block text-white">Gran Competencia</span>
            <span className="block bg-gradient-to-r from-[#0066CC] via-[#1a8fff] to-[#00c6ff] bg-clip-text text-transparent">
              BMWAM 2026
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="text-lg sm:text-xl text-gray-300/90 mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            El evento de motociclismo más emocionante del estado de Hidalgo. Rutas únicas, categorías para todos los niveles y la adrenalina BMW en cada kilómetro.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/formulario"
              className="px-8 py-4 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,102,204,0.5)] text-sm tracking-wide"
            >
              Reservar mi Lugar
            </Link>
            <a
              href="#evento"
              className="px-8 py-4 border border-white/20 hover:border-white/60 text-white font-medium rounded-full transition-all duration-300 hover:bg-white/[0.06] backdrop-blur-sm text-sm tracking-wide"
            >
              Conocer el Evento
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light">Scroll</span>
          <motion.div
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent origin-top"
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 border-y border-white/[0.06] bg-[#080810]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            {STATS.map((s, i) => (
              <FadeUp key={i} delay={i * 0.08} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-[#0066CC] mb-2 tabular-nums">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-medium">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT / EL EVENTO
      ══════════════════════════════════════════════════════ */}
      <section id="evento" className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          {/* Text */}
          <FadeUp>
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-5">
              Sobre el Evento
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-7 leading-[1.1] tracking-tight">
              Una experiencia{' '}
              <span className="bg-gradient-to-r from-[#0066CC] to-[#1a8fff] bg-clip-text text-transparent">
                única en Hidalgo
              </span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-5 font-light">
              La Gran Competencia BMWAM llega a Ixmiquilpan, Hidalgo — un evento pensado para apasionados de las dos ruedas. Con rutas diseñadas por expertos a través del Valle del Mezquital, vivirás la adrenalina del motociclismo en uno de los paisajes más impresionantes del centro de México.
            </p>
            <p className="text-gray-400 text-base leading-relaxed font-light">
              Ya seas piloto experimentado o estés comenzando tu camino en el mundo BMWAM, este evento tiene una categoría para ti. Reserva tu lugar antes de que se agoten los cupos.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <Link
                to="/formulario"
                className="px-7 py-3.5 bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,102,204,0.4)] hover:scale-105"
              >
                Reservar Lugar
              </Link>
              <a href="#costos" className="text-gray-400 hover:text-white text-sm font-medium transition-colors underline underline-offset-4">
                Ver costos
              </a>
            </div>
          </FadeUp>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={secondImage} alt="BMWAM Ixmiquilpan" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
              {/* Badge */}
              <div className="absolute bottom-5 left-5 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3">
                <p className="text-[#0066CC] text-xs font-semibold tracking-widest uppercase">Evento Oficial</p>
                <p className="text-white text-sm font-bold">BMWAM · Hidalgo 2026</p>
              </div>
            </div>
            {/* Decorative borders */}
            <div className="absolute -bottom-5 -right-5 w-36 h-36 border border-[#0066CC]/25 rounded-2xl -z-10" />
            <div className="absolute -top-5 -left-5 w-24 h-24 border border-white/10 rounded-xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          IMAGEN BMW IXMIQUILPAN
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#080810]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-12">
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              Ixmiquilpan, Hidalgo
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              BMWAM en el Valle del Mezquital
            </h2>
          </FadeUp>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden aspect-video"
          >
            <img
              src={imagen3}
              alt="BMWAM Ixmiquilpan Hidalgo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
              <p className="text-[#0066CC] text-xs font-semibold tracking-widest uppercase mb-1">Sede del Evento</p>
              <p className="text-white text-lg font-black leading-tight">Ixmiquilpan · Hidalgo · 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FULL-BLEED IMAGE BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]" />
          {/* Blue glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0066CC]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <FadeUp>
            <p className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase mb-5">
              Cupos Limitados
            </p>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight leading-none">
              Asegura tu{' '}
              <span className="bg-gradient-to-r from-[#0066CC] via-[#1a8fff] to-[#00c6ff] bg-clip-text text-transparent">
                lugar ahora
              </span>
            </h2>
            <p className="text-xl text-gray-300/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Los registros son por orden de llegada y los cupos son limitados. No te quedes fuera de la experiencia BMWAM en Ixmiquilpan.
            </p>
            <Link
              to="/formulario"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#0066CC] hover:bg-[#0052a3] text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(0,102,204,0.45)] text-base"
            >
              Registrarme Ahora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          COSTOS DE ADMISIÓN
      ══════════════════════════════════════════════════════ */}
      <section id="costos" className="py-32 px-6 bg-[#080810]">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              Lo que debes saber
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Información del Evento
            </h2>
            <p className="text-gray-500 text-base mt-4 font-light tracking-wide uppercase text-xs">
              Costos de Admisión
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            {COSTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                viewport={{ once: true }}
                className={`relative p-12 rounded-3xl text-center border transition-all duration-300 ${
                  item.featured
                    ? 'bg-[#0066CC]/[0.08] border-[#0066CC]/40'
                    : 'bg-white/[0.03] border-white/[0.07]'
                }`}
              >
                {item.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0066CC] text-white text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-1 rounded-full">
                    General
                  </div>
                )}
                <p className="text-[#0066CC] text-xs font-semibold tracking-[0.35em] uppercase mb-8">
                  {item.label}
                </p>
                <div className="text-6xl md:text-7xl font-black text-white mb-2 tabular-nums">
                  {item.price}
                </div>
                <div className="text-[#0066CC] font-bold text-base tracking-[0.2em]">
                  {item.currency}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA CARD
      ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden text-center border border-[#0066CC]/20"
          >
            {/* BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/10 via-[#080820] to-[#050505]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0066CC]/15 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#0066CC]/8 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <p className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase mb-4">
                Formulario de Registro
              </p>
              <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
                ¿Listo para competir?
              </h2>
              <p className="text-gray-300/80 text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
                Completa el formulario de registro para reservar tu lugar. Los cupos son limitados y se asignan por orden de solicitud.
              </p>
              <Link
                to="/formulario"
                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#050505] hover:bg-[#0066CC] hover:text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,102,204,0.4)] text-sm tracking-wide"
              >
                Ir al Registro
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-[#080810]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-xl font-black tracking-tight leading-none">
                BMW <span className="text-[#0066CC]">AM</span>
              </h3>
              <p className="text-gray-600 text-xs mt-1 tracking-wider">Ixmiquilpan · Hidalgo · 2026</p>
            </div>

            <div className="flex gap-8">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'El Evento', href: '#evento' },
                { label: 'Costos', href: '#costos' },
                { label: 'Registro', to: '/formulario' },
              ].map((item) =>
                item.to ? (
                  <Link key={item.label} to={item.to} className="text-gray-500 hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} href={item.href} className="text-gray-500 hover:text-white transition-colors text-sm">
                    {item.label}
                  </a>
                )
              )}
            </div>

            <p className="text-gray-700 text-xs">
              © {new Date().getFullYear()} BMWAM. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
