import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import heroImage from '../assets/herosetionimage.jpg';
const BMW_VIDEO_SRC = 'https://www.youtube.com/embed/lSJ19gQq-0Q?autoplay=1&mute=1&loop=1&controls=0&playlist=lSJ19gQq-0Q&modestbranding=1&rel=0&showinfo=0'
import imagen3 from '../assets/imagen3.jpg'
import logo from '../assets/logo.png'
import chinoLogo from '../assets/chino_en_moto_web.png'
import ixmiquilpanLogo from '../assets/PNGBLANCO.png'
import bmw1 from '../assets/bmw1.jpeg'
import bmw2 from '../assets/bmw2.jpeg'
import bmwLogo from '../assets/bmwlogo.png'
import gobiernoLogo from '../assets/gobierno.png'
import bmwMotoradLogo from '../assets/bmwmotorrad.jpeg'
import bmwAmAmigosLogo from '../assets/bmwamamigos.jpeg'
import palmasLogo from '../assets/palmas.png'

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
  { value: 2, suffix: '', label: 'Rutas Diseñadas' },
  { value: 300, suffix: '+', label: 'Cupos Disponibles' },
  { value: 120, suffix: ' km', label: 'Por dia' },
];

const ROOMS = [
  { type: 'Habitación estándar', specs: '1 cama Queen Size', capacity: '2 pax', price: '$2,800' },
  { type: 'Habitación estándar plus', specs: '1 cama King Size', capacity: '2 pax', price: '$3,100' },
  { type: 'Habitación premium', specs: '1 cama King Size', capacity: '2 pax', price: '$3,600' },
  { type: 'Habitación suite', specs: '1 cama King Size', capacity: '2 pax', price: '$4,500' },
  { type: 'Suite jacuzzi', specs: '1 cama King Size · jacuzzi', capacity: '2 pax', price: '$5,200' },
  { type: 'Estándar doble', specs: '2 camas Queen Size', capacity: '4 pax', price: '$4,800' },
  { type: 'Premium doble', specs: '2 camas Queen Size', capacity: '4 pax', price: '$5,000' },
  { type: 'Premium terraza', specs: '2 camas Queen Size · terraza', capacity: '4 pax', price: '$5,300' },
  { type: 'Estándar familiar', specs: '—', capacity: '8 pax', price: '$7,900' },
  { type: 'Penthouse', specs: '3 recámaras · 3 camas King Size', capacity: '6 pax', price: '$14,250' },
  { type: 'Penthouse Plus', specs: '3 recámaras · 3 camas King Size + 1 sofá cama', capacity: '8 pax', price: '$16,700' },
];

const COSTS = [
  {
    tag: 'Socios',
    label: 'Socios BMW AM',
    price: '$2,400.00',
    currency: 'MXN',
  },
  {
    tag: 'General',
    label: 'No Socios',
    price: '$2,600.00',
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

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '55%']);
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
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl md:text-[76px] font-black leading-[1.02] mb-6 tracking-tight"
          >
            <span className="block text-white">XV Convención Internacional</span>
            <span className="block bg-gradient-to-r from-[#0066CC] via-[#1a8fff] to-[#00c6ff] bg-clip-text text-transparent">
              Amigos Motociclistas BMW IXMIQUILPAN 2026
            </span>
            <span className="block text-right text-white text-xl sm:text-2xl md:text-3xl font-black mt-3">Del 26 al 29 noviembre 2026</span>

          </motion.h1>
        
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="text-lg sm:text-xl text-gray-300/90 mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            El evento de motociclismo más emocionante de México llega a Hidalgo: rutas únicas y la adrenalina BMW en cada kilómetro.          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap"
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
            <a
              href="#hotel"
              className="px-8 py-4 border border-white/20 hover:border-white/60 text-white font-medium rounded-full transition-all duration-300 hover:bg-white/[0.06] backdrop-blur-sm text-sm tracking-wide"
            >
              Reserva tu Hotel
            </a>
          </motion.div>

          {/* Logos debajo de los botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-row gap-6 justify-center items-center mt-10 flex-wrap"
          >
            <img src={chinoLogo} alt="Chino en moto" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
            <img src={logo} alt="BMW AM" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
            <img src={ixmiquilpanLogo} alt="Ixmiquilpan" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
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
          HOTEL — PALMAS HOTEL & SPA (HOSPEDAJE OFICIAL)
      ══════════════════════════════════════════════════════ */}


      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20 border-y border-white/[0.06] bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {STATS.map((s, i) => (
              <FadeUp key={i} delay={i * 0.08} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0066CC] mb-2 tabular-nums">
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
      <section id="evento" className="py-16 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Text */}
          <FadeUp>
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-5">
              Sobre el Evento
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 md:mb-7 leading-[1.1] tracking-tight">
              Una experiencia{' '}
              <span className="bg-gradient-to-r from-[#0066CC] to-[#1a8fff] bg-clip-text text-transparent">
                única en Hidalgo
              </span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-5 font-light">
La XV Convención Internacional de Amigos Motociclistas BMW llega a Ixmiquilpan para reunir a los verdaderos apasionados de las dos ruedas en un escenario inigualable.

Prepárate para recorrer rutas diseñadas por expertos a través del majestuoso Valle del Mezquital, donde la adrenalina del motociclismo se fusiona con algunos de los paisajes más impresionantes del centro de México. Vive la experiencia completa: disfruta su reconocida gastronomía, relájate en sus aguas termales y déjate envolver por la calidez de su gente.

Reserva tu lugar y sé parte de este encuentro único, donde la pasión por rodar nos une y cada kilómetro se convierte en una historia por contar.            </p>
            <p className="text-gray-400 text-base leading-relaxed font-light">
              Reserva tu lugar antes de que se agoten los cupos.
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
              <iframe
                src={BMW_VIDEO_SRC}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
                className="absolute w-full"
                style={{
                  border: 'none',
                  pointerEvents: 'none',
                  top: '-60px',
                  left: 0,
                  height: 'calc(100% + 120px)',
                }}
                title="BMW AM video"
              />
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
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-[#080810]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-8 sm:mb-12">
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              Ixmiquilpan, Hidalgo
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
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
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-[#0066CC] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-1">Sede del Evento</p>
              <p className="text-white text-sm sm:text-lg font-black leading-tight">Ixmiquilpan · Hidalgo · 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FULL-BLEED IMAGE BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-36 px-4 sm:px-6 overflow-hidden">
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
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-none">
              Asegura tu{' '}
              <span className="bg-gradient-to-r from-[#0066CC] via-[#1a8fff] to-[#00c6ff] bg-clip-text text-transparent">
                lugar ahora
              </span>
            </h2>
            <p className="text-xl text-gray-300/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              No te quedes fuera de la experiencia BMWAM en Ixmiquilpan.
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
      <section id="costos" className="py-16 md:py-32 px-4 sm:px-6 bg-[#080810]">
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
            <p className="text-gray-500 text-base mt-4 font-light tracking-wide">
              No se emitirá factura por concepto de inscripción al evento            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            {COSTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                viewport={{ once: true }}
                className={`relative p-8 md:p-12 rounded-3xl text-center border transition-all duration-300 ${item.featured
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
                <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-2 tabular-nums">
                  {item.price}
                </div>
                <div className="text-[#0066CC] font-bold text-base tracking-[0.2em]">
                  {item.currency}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Incluye */}
          <FadeUp delay={0.2} className="mt-12">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 md:p-10">
              <p className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase text-center mb-8">
                Incluye
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Kit (Jersey, portallaves, pulseras, stickers)',
                  'Cóctel de bienvenida',
                  'Cena Rompehielo',
                  'Verbena Popular',
                  'Experiencias gastronómicas y culturales',
                  'Cena de Clausura',
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0066CC]/20 border border-[#0066CC]/40 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA CARD
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative p-8 md:p-16 rounded-3xl overflow-hidden text-center border border-[#0066CC]/20"
          >
            {/* BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/10 via-[#080820] to-[#050505]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#0066CC]/15 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#0066CC]/8 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <p className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase mb-4">
                Formulario de Registro
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">
                ¿Listo para unirte?
              </h2>
              <p className="text-gray-300/80 text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
                Completa el formulario de registro para reservar tu lugar en la convención.
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

      <section id="hotel" className="py-16 md:py-32 px-4 sm:px-6 bg-[#080810]">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <FadeUp className="text-center mb-16">
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              Hospedaje Oficial
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              <a
                href="https://www.hotelpalmastephe.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0066CC] transition-colors duration-300"
              >
                Palmas Hotel &amp; Spa
              </a>
            </h2>
            <p className="text-gray-500 text-sm font-light tracking-wide mb-1">
              Carretera México–Laredo Km 152 · El Tephé, Ixmiquilpan, Hidalgo
            </p>
            <a
              href="https://www.hotelpalmastephe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#0066CC] text-xs font-medium hover:underline underline-offset-4 mt-1"
            >
              hotelpalmastephe.com
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <p className="text-gray-600 text-xs font-light tracking-widest uppercase mt-4">
              Tarifa Rack 2026
            </p>
          </FadeUp>

          {/* Includes */}
          <FadeUp delay={0.1} className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {[
                'Acceso al Parque Acuático El Tephé',
                '1 desayuno por noche de hospedaje, de acuerdo con la capacidad de la habitación',
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-5 py-4"
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#0066CC]/20 border border-[#0066CC]/40 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Room table */}
          <FadeUp delay={0.15} className="mb-12">
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <div className="rounded-none sm:rounded-2xl border-y sm:border border-white/[0.07]">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/[0.07]">
                      <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[#0066CC] font-semibold tracking-widest uppercase text-[10px] sm:text-[11px]">Habitación</th>
                      <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[#0066CC] font-semibold tracking-widest uppercase text-[10px] sm:text-[11px] hidden sm:table-cell">Especificaciones</th>
                      <th className="text-center px-3 sm:px-4 py-3 sm:py-4 text-[#0066CC] font-semibold tracking-widest uppercase text-[10px] sm:text-[11px]">Cap.</th>
                      <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-[#0066CC] font-semibold tracking-widest uppercase text-[10px] sm:text-[11px]">Tarifa MXN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROOMS.map((room, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/[0.05] transition-colors hover:bg-white/[0.03] ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                          }`}
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-white font-medium text-xs sm:text-sm">{room.type}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 text-xs sm:text-sm hidden sm:table-cell">{room.specs}</td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                          <span className="inline-block bg-[#0066CC]/10 border border-[#0066CC]/25 text-[#0066CC] text-[10px] sm:text-[11px] font-semibold tracking-wide px-2 sm:px-3 py-1 rounded-full">
                            {room.capacity}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-white font-bold tabular-nums text-xs sm:text-sm">{room.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeUp>

          {/* Phone numbers */}
          <FadeUp delay={0.17} className="mb-6">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-[#0066CC] text-xs font-semibold tracking-[0.35em] uppercase flex-shrink-0">
                Contacto del hotel
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                {[
                  { label: 'Teléfono / WhatsApp', value: '771-711-0007' },
                  { label: 'Teléfono', value: '771-110-4815' },
                  { label: 'Teléfono / WhatsApp', value: '772-150-0156' },
                ].map(({ label, value }) => (
                  <div key={value} className="flex flex-col gap-0.5">
                    <span className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-medium">{label}</span>
                    <span className="text-white text-sm font-medium tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Discount code */}
          <FadeUp delay={0.2}>
            <div className="max-w-md mx-auto bg-[#0066CC]/[0.07] border border-[#0066CC]/30 rounded-2xl p-5 sm:p-8 flex flex-col justify-center text-center">
              <p className="text-[#0066CC] text-xs font-semibold tracking-[0.35em] uppercase mb-6">
                Código de descuento exclusivo
              </p>
              <div className="mb-4">
                <div className="inline-block bg-[#050505] border-2 border-dashed border-[#0066CC]/50 rounded-2xl px-6 sm:px-10 py-4 sm:py-5">
                  <span className="text-2xl sm:text-4xl font-black text-white tracking-widest">AMBMW2026</span>
                </div>
              </div>
              <div className="inline-flex items-center justify-center gap-2 mx-auto bg-[#0066CC] text-white text-sm font-bold rounded-full px-6 py-2 mb-6">
                25% de descuento
              </div>
              <p className="text-gray-400 text-xs leading-relaxed font-light">
                Menciona este código al momento de realizar tu reservación para que el descuento sea aplicado.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACTOS PARA INFORMACIÓN DEL EVENTO
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#050505]">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-12">
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              ¿Tienes dudas?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Contactos para información del evento
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              {[
                { number: '772 216 7718' },
                { number: '564 670 6945' },
                { number: '772 409 4381' },
                { number: '773 122 7378' },
              ].map((contact, i) => (
                <motion.a
                  key={i}
                  href={`https://wa.me/52${contact.number.replace(/\s/g, '')}?text=${encodeURIComponent('Hola, me gustaría obtener información sobre la XV Convención Internacional BMW AM Ixmiquilpan 2026')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm tabular-nums group-hover:text-[#25D366] transition-colors">
                    {contact.number}
                  </span>
                </motion.a>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2} className="mt-8">
            <p className="text-center text-gray-500 text-sm font-light">
              Comunícate con nosotros para resolver cualquier duda sobre el evento
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LOGOS PARTNERS
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#050505] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              Nuestros Aliados
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Organizadores y Partners Oficiales
            </h2>
          </FadeUp>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
            {/* Logo BMW */}
            <FadeUp delay={0.05}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={bmwLogo}
                  alt="BMW"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo Chino en Moto */}
            <FadeUp delay={0.08}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={chinoLogo}
                  alt="Chino en Moto"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo BMW AM */}
            <FadeUp delay={0.11}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={logo}
                  alt="BMW AM"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo Ixmiquilpan */}
            <FadeUp delay={0.14}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={ixmiquilpanLogo}
                  alt="Ixmiquilpan"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo BMW 1 */}
            <FadeUp delay={0.17}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={bmw1}
                  alt="BMW 1"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg rounded-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo BMW 2 */}
            <FadeUp delay={0.2}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={bmw2}
                  alt="BMW 2"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg rounded-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo Gobierno */}
            <FadeUp delay={0.23}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={gobiernoLogo}
                  alt="Gobierno"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo BMW Motorrad */}
            <FadeUp delay={0.26}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={bmwMotoradLogo}
                  alt="BMW Motorrad"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg rounded-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo BMW AM Amigos */}
            <FadeUp delay={0.29}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={bmwAmAmigosLogo}
                  alt="BMW AM Amigos"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg rounded-lg"
                />
              </motion.div>
            </FadeUp>

            {/* Logo Palmas Hotel & Spa */}
            <FadeUp delay={0.32}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex items-center justify-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#0066CC]/40 transition-all duration-300 hover:bg-white/[0.05] w-full h-40"
              >
                <img
                  src={palmasLogo}
                  alt="Palmas Hotel & Spa"
                  className="max-w-[120px] max-h-[120px] object-contain filter drop-shadow-lg"
                />
              </motion.div>
            </FadeUp>
          </div>

          {/* Decorative elements */}
          <div className="mt-12 pt-12 border-t border-white/[0.06]">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                En colaboración con los principales protagonistas del motociclismo en México
              </p>
            </motion.div>
          </div>
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

            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'El Evento', href: '#evento' },
                { label: 'Costos', href: '#costos' },
                { label: 'Hotel', href: '#hotel' },
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
              © {new Date().getFullYear()} Create by Luis Alberto Chavero Chavez y Hazel Jared Almaraz Martinez. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
