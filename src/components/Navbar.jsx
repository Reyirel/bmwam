import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-[#050505]/95 backdrop-blur-2xl border-b border-white/[0.06] py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white leading-none">
            BMW <span className="text-[#0066CC]">AM</span>
            <span className="block text-[10px] font-medium text-gray-500 tracking-[0.2em] uppercase">Ixmiquilpan · Hidalgo</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Inicio', to: '/' },
            { label: 'El Evento', href: '/#evento' },
            { label: 'Categorías', href: '/#categorias' },
          ].map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide"
              >
                {item.label}
              </a>
            )
          )}
          <Link
            to="/formulario"
            className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,102,204,0.45)] hover:scale-105"
          >
            Registrarme
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white w-10 h-10 flex items-center justify-center"
        >
          <div className="space-y-1.5">
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-white"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-white origin-center"
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[#050505]/98 backdrop-blur-2xl border-t border-white/[0.06]"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link to="/" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Inicio</Link>
              <a href="/#evento" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>El Evento</a>
              <a href="/#categorias" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Categorías</a>
              <Link
                to="/formulario"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-6 py-3 bg-[#0066CC] text-white text-sm font-semibold rounded-full text-center"
              >
                Registrarme
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
