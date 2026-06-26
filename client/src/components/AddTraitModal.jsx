import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddTraitModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("Raza");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSource("Raza");
      setDesc("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;
    onAdd({ name, source, description: desc });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-12 sm:pb-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }} 
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm bg-[#1A1C23]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-amber-500 mb-6 uppercase tracking-wider flex items-center gap-2 relative z-10">
              <span className="text-2xl">⚡</span> Agregar Rasgo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Nombre del Rasgo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm focus:border-amber-500/50 focus:bg-white/5 outline-none transition-all shadow-inner" placeholder="Ej. Resiliencia Construida" autoFocus />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Origen</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm cursor-pointer focus:border-amber-500/50 focus:bg-white/5 outline-none transition-all shadow-inner">
                  <option value="Raza">Raza</option>
                  <option value="Clase">Clase</option>
                  <option value="Trasfondo">Trasfondo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Descripción</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="3" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm focus:border-amber-500/50 focus:bg-white/5 outline-none transition-all resize-none custom-scrollbar shadow-inner" placeholder="¿Qué hace este rasgo?"></textarea>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all">+ Guardar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}