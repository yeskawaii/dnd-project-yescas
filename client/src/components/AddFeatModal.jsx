import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddFeatModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", type: "General", desc: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: "", type: "General", desc: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-4 pb-12 sm:pb-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#1A1C23]/90 backdrop-blur-xl w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-emerald-400 font-bold text-xl mb-6 uppercase tracking-wider relative z-10 flex items-center gap-2">
              <span className="text-2xl">✨</span> Dote / Rasgo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nombre</label>
                <input type="text" placeholder="ej. Ataque Poderoso" required className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none transition-all shadow-inner" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Tipo</label>
                <select className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/5 transition-all shadow-inner cursor-pointer" onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Combate">Combate</option>
                  <option value="Magia">Magia</option>
                  <option value="Raza">Rasgo Racial</option>
                  <option value="Clase">Rasgo de Clase</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Descripción</label>
                <textarea placeholder="Descripción y efectos..." required rows="4" className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white focus:border-emerald-500/50 focus:bg-white/5 outline-none resize-none transition-all shadow-inner" onChange={e => setFormData({...formData, desc: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-bold text-xs text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all uppercase tracking-widest">+ Agregar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}