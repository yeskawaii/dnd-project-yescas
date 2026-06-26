import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

const AddCharacterModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [customClass, setCustomClass] = useState('');

  const dndClasses = [
    "Guerrero", "Mago", "Pícaro", "Clérigo", "Bárbaro", "Bardo", 
    "Druida", "Explorador", "Monje", "Paladín", "Hechicero", 
    "Warlock", "Psiónico", "Caballero", "Samurái", "Ninja", "Otra (Personalizada)"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    const finalClass = charClass === "Otra (Personalizada)" ? customClass : charClass;
    onAdd({ name, charClass: finalClass || "Aventurero" });
    setName('');
    setCustomClass('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#1A1C23]/90 backdrop-blur-xl border border-white/10 w-full max-w-sm rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-amber-500 mb-6 uppercase tracking-wider relative z-10">Forjar Héroe</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block tracking-widest text-left uppercase">Nombre del Personaje</label>
                <input 
                  autoFocus type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner"
                  placeholder="Ej: Yescas el Cuervo"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block tracking-widest text-left uppercase">Clase Base 3.5</label>
                <select 
                  value={charClass}
                  onChange={(e) => setCharClass(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none appearance-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner cursor-pointer"
                >
                  {dndClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {charClass === "Otra (Personalizada)" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <label className="text-[10px] font-bold text-amber-500/80 mb-1.5 block tracking-widest text-left uppercase mt-2">Especifica tu clase</label>
                  <input 
                    type="text" value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    className="w-full bg-amber-500/5 border border-amber-500/30 p-4 rounded-xl text-white outline-none focus:border-amber-500/80 transition-all shadow-inner"
                    placeholder="Ej: Archienemigo"
                    required
                  />
                </motion.div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={onClose} className="flex-1 p-4 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-400 font-bold text-[10px] uppercase tracking-widest hover:bg-amber-500/20 active:scale-95 transition-all">+ Crear</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddCharacterModal;