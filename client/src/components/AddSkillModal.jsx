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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-4 pb-32 sm:pb-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-cyan-400 font-black text-xl mb-4 italic uppercase tracking-widest">Aprender Habilidad</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">NOMBRE DE LA HABILIDAD</label>
                <input 
                  type="text" autoFocus placeholder="Ej. Saber (Planos)" required 
                  className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none transition-all" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">ATRIBUTO BASE</label>
                   <select 
                     className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none focus:border-cyan-500 transition-all"
                     value={formData.stat} onChange={e => setFormData({...formData, stat: e.target.value})}
                   >
                     {statOptions.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <label className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all h-[46px]">
                    <input 
                      type="checkbox" className="accent-cyan-500 w-4 h-4"
                      checked={formData.isClassSkill} onChange={e => setFormData({...formData, isClassSkill: e.target.checked})}
                    />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">¿Es de Clase?</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-black text-[10px] text-slate-500 hover:bg-slate-800 active:scale-95 transition-all">CANCELAR</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-black text-[10px] uppercase text-white bg-cyan-600 active:scale-95 transition-all">+ AÑADIR</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}