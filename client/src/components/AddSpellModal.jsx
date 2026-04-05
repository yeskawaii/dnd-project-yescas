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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-32 sm:pb-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="bg-slate-900 border border-cyan-500/30 w-full max-w-sm rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-cyan-400 mb-6 uppercase tracking-widest italic">{spellToEdit ? 'Editar Hechizo' : 'Aprender Hechizo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">NOMBRE</label>
                <input autoFocus type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none focus:ring-2 ring-cyan-500 font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">NIVEL</label>
                  <input type="number" min="0" max="9" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none font-bold focus:ring-2 ring-cyan-500" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">ESCUELA</label>
                  <select value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none font-bold focus:ring-2 ring-cyan-500">
                    {schools.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">EFECTO / DESCRIPCIÓN</label>
                <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none focus:ring-2 ring-cyan-500 h-24 text-xs font-medium italic resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] bg-slate-950 active:scale-95">CANCELAR</button>
                <button type="submit" className="flex-1 bg-cyan-600 p-3 rounded-xl text-white font-black text-[10px] active:scale-95 uppercase">{spellToEdit ? 'ACTUALIZAR' : 'APRENDER'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}