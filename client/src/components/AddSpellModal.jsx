import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddSpellModal({ isOpen, onClose, onAdd, onEdit, spellToEdit }) {
  const [formData, setFormData] = useState({ name: '', level: 0, school: 'Evocación', desc: '' });
  const schools = ["Abjuración", "Adivinación", "Conjuración", "Encantamiento", "Evocación", "Ilusión", "Necromancia", "Transmutación"];

  useEffect(() => {
    if (spellToEdit) setFormData(spellToEdit);
    else setFormData({ name: '', level: 0, school: 'Evocación', desc: '' });
  }, [spellToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    if (spellToEdit) onEdit(spellToEdit._id, formData);
    else onAdd(formData);
    
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
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span className="text-2xl">✨</span> {spellToEdit ? 'Editar Hechizo' : 'Aprender Hechizo'}
              </h2>
              <button onClick={onClose} className="text-slate-500 text-xl hover:text-white active:scale-95 transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nombre del Hechizo</label>
                <input autoFocus type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all shadow-inner" placeholder="ej. Bola de Fuego" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nivel</label>
                  <input type="number" min="0" max="9" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none text-center focus:border-cyan-500/50 focus:bg-white/5 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Escuela</label>
                  <select value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none cursor-pointer text-center focus:border-cyan-500/50 focus:bg-white/5 transition-all shadow-inner">
                    {schools.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Efecto / Descripción</label>
                <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none h-24 resize-none focus:border-cyan-500/50 focus:bg-white/5 transition-all shadow-inner" placeholder="Efectos, tiradas de salvación..." />
              </div>
              <div className="pt-4 border-t border-white/10 mt-2">
                <button type="submit" className="w-full bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl font-bold text-xs text-cyan-400 hover:bg-cyan-500/20 active:scale-95 transition-all uppercase tracking-widest">
                  {spellToEdit ? 'Actualizar Hechizo' : '+ Aprender Hechizo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}