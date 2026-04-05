import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AddSpellModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(0);
  const [school, setSchool] = useState('Evocación');
  const [desc, setDesc] = useState('');

  const schools = [
    "Abjuración", "Adivinación", "Conjuración", "Encantamiento", 
    "Evocación", "Ilusión", "Necromancia", "Transmutación"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, level, school, desc });
    setName(''); setLevel(0); setDesc('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-32 sm:pb-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="bg-slate-900 border border-cyan-500/30 w-full max-w-sm rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black text-cyan-400 mb-6 uppercase tracking-widest italic">Aprender Hechizo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">NOMBRE DEL CONJURO</label>
                <input 
                  autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none focus:ring-2 ring-cyan-500 transition-all font-bold"
                  placeholder="Ej: Bola de Fuego" required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">NIVEL</label>
                  <input 
                    type="number" min="0" max="9" value={level} onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none font-bold focus:ring-2 ring-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">ESCUELA</label>
                  <select 
                    value={school} onChange={(e) => setSchool(e.target.value)}
                    className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none font-bold appearance-none cursor-pointer focus:ring-2 ring-cyan-500 transition-all"
                  >
                    {schools.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest">EFECTO / DESCRIPCIÓN</label>
                <textarea 
                  value={desc} onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-800 p-3 rounded-xl text-white outline-none focus:ring-2 ring-cyan-500 h-24 text-xs font-medium italic resize-none transition-all"
                  placeholder="Ej: 1d6 de daño por nivel..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] hover:bg-slate-800 active:scale-95 transition-all">CANCELAR</button>
                <button type="submit" className="flex-1 bg-cyan-600 p-3 rounded-xl text-white font-black text-[10px] shadow-lg shadow-cyan-900/40 hover:bg-cyan-500 active:scale-95 transition-all uppercase">Aprender</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddSpellModal;