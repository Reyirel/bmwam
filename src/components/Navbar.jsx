import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import logoixmi from '../assets/PNGBLANCO.png';

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
          ? 'bg-[#050505]/95 backdrop-blur-2xl border-b border-white/[0.06] py-2 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative h-16">
        {/* Left - Logo Principal */}
        <Link to="/" className="flex items-center z-20">
          <img src={logoixmi} alt="Logo de ixmiquiloan" className="w-20 h-20 object-contain" />
        </Link>

        {/* Center - Logo Blanco */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
          <img src={logo} alt="BMWAM white logo" className="w-14 h-14 object-contain filter brightness-200" />
        </div>

        {/* Right - Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {[
              { label: 'Inicio', to: '/' },
              { label: 'El Evento', href: '/#evento' },
              { label: 'Costos', href: '/#costos' },
              { label: 'Hotel', href: '/#hotel' },
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
              to="/status"
              className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide"
            >
              Consultar
            </Link>
          </div>
          
          <Link
            to="/formulario"
            className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,102,204,0.45)] hover:scale-105"
          >
            Registrarme
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white w-8 h-8 flex items-center justify-center"
          >
            <div className="space-y-1.5">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-white origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-5 h-0.5 bg-white"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-white origin-center"
              />
            </div>
          </button>
        </div>
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
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              <Link to="/" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Inicio</Link>
              <a href="/#evento" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>El Evento</a>
              <a href="/#costos" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Costos</a>
              <a href="/#hotel" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Hotel</a>
              <Link to="/status" className="text-gray-300 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Consultar Registro</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
