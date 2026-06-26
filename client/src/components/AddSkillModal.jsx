import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddSkillModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", stat: "Inteligencia", isClassSkill: false });

  const statOptions = ["Fuerza", "Destreza", "Constitución", "Inteligencia", "Sabiduría", "Carisma"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      name: formData.name.trim(),
      stat: formData.stat,
      isClassSkill: formData.isClassSkill,
      ranks: 0,
      miscModifier: 0
    });

    setFormData({ name: "", stat: "Inteligencia", isClassSkill: false });
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-cyan-400 font-bold text-xl mb-6 uppercase tracking-wider relative z-10 flex items-center gap-2">
              <span className="text-2xl">🧠</span> Aprender Habilidad
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nombre de la Habilidad</label>
                <input 
                  type="text" autoFocus placeholder="Ej. Saber (Planos)" required 
                  className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white focus:border-cyan-500/50 focus:bg-white/5 outline-none transition-all shadow-inner" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Atributo Base</label>
                   <select 
                     className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm text-white outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all shadow-inner cursor-pointer"
                     value={formData.stat} onChange={e => setFormData({...formData, stat: e.target.value})}
                   >
                     {statOptions.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <label className="flex items-center justify-center gap-2 bg-black/40 border border-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/5 hover:border-cyan-500/50 transition-all h-[46px] shadow-inner">
                    <input 
                      type="checkbox" className="accent-cyan-500 w-4 h-4 cursor-pointer"
                      checked={formData.isClassSkill} onChange={e => setFormData({...formData, isClassSkill: e.target.checked})}
                    />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">De Clase</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 active:scale-95 transition-all">+ Añadir</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}