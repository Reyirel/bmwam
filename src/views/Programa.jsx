import { motion } from 'framer-motion';
import programaPDF from '../assets/XV CONVENCION 2026 programa.pdf';

export default function Programa() {
  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 pb-10">
      {/* Header */}
      <section className="px-4 sm:px-6 mb-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#0066CC] text-xs font-semibold tracking-[0.45em] uppercase block mb-4">
              XV Convención Internacional
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Programa de{' '}
              <span className="bg-gradient-to-r from-[#0066CC] via-[#1a8fff] to-[#00c6ff] bg-clip-text text-transparent">
                Actividades
              </span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* PDF Viewer */}
      <section className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden"
          >
            <iframe
              src={programaPDF}
              title="Programa de Actividades XV Convención 2026"
              className="w-full h-[80vh] min-h-[600px]"
              style={{ border: 'none' }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
