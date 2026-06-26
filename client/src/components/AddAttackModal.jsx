import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddAttackModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "", type: "Melee", damageDice: "1d8", damageType: "Cortante",
    attackBonus: 0, damageBonus: 0, critRange: "20", critMultiplier: "x2"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: "", type: "Melee", damageDice: "1d8", damageType: "Cortante", attackBonus: 0, damageBonus: 0, critRange: "20", critMultiplier: "x2" });
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h2 className="text-amber-500 font-bold text-xl mb-6 uppercase tracking-wider relative z-10 flex items-center gap-2">
              <span className="text-2xl">⚔️</span> Forjar Arma
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nombre</label>
                <input type="text" placeholder="ej. Espada Larga" required className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white focus:border-amber-500/50 focus:bg-white/5 outline-none transition-all shadow-inner" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Tipo</label>
                  <select className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Melee">Cuerpo a Cuerpo</option>
                    <option value="Ranged">A Distancia</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Dado</label>
                  <input type="text" placeholder="ej. 1d8" required className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none text-center focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" onChange={e => setFormData({...formData, damageDice: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold mb-1.5 block ml-1 uppercase tracking-widest">Bono Ataque</label>
                  <input type="number" placeholder="0" className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none text-center focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" onChange={e => setFormData({...formData, attackBonus: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold mb-1.5 block ml-1 uppercase tracking-widest">Bono Daño</label>
                  <input type="number" placeholder="0" className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none text-center focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" onChange={e => setFormData({...formData, damageBonus: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold mb-1.5 block ml-1 uppercase tracking-widest">Crítico</label>
                  <input type="text" placeholder="ej. 19-20" className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none text-center focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" onChange={e => setFormData({...formData, critRange: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold mb-1.5 block ml-1 uppercase tracking-widest">Multiplicador</label>
                  <input type="text" placeholder="ej. x2" className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none text-center focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" onChange={e => setFormData({...formData, critMultiplier: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-bold text-xs text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all uppercase tracking-widest">+ Equipar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}