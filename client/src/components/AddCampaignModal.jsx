import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddCampaignModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#1A1C23]/90 backdrop-blur-xl border border-white/10 w-full max-w-[320px] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-amber-500 mb-6 uppercase tracking-wider relative z-10">Nueva Contienda</h2>
            
            <div className="relative z-10">
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nombre de la partida</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm mb-6 outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner"
                placeholder="ej. La Mina Perdida"
                autoFocus
              />
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button onClick={onClose} className="flex-1 p-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95">Cancelar</button>
                <button onClick={() => { onAdd(name); setName(""); onClose(); }} className="flex-1 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-400 font-bold text-[10px] uppercase tracking-widest hover:bg-amber-500/20 active:scale-95 transition-all">+ Crear</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}