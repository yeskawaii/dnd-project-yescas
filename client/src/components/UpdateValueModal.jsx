import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateValueModal = ({ isOpen, onClose, onUpdate, title, initialValue, label, type }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  const isTextField = ['race', 'alignment', 'deity', 'speed', 'name', 'class'].includes(type);
  const isLongText = type === 'note' || type === 'edit_note';

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalValue = (isTextField || isLongText) ? value : parseInt(value) || 0;
    onUpdate(finalValue);
    onClose();
  };

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
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-sm font-bold text-amber-500 mb-4 uppercase tracking-widest text-center relative z-10">{title}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-2 block tracking-widest text-center uppercase">{label}</label>
                
                {isLongText ? (
                  <textarea
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-black/40 p-4 rounded-2xl text-white text-sm font-medium outline-none border border-white/10 focus:border-amber-500/50 focus:bg-white/5 transition-all h-32 resize-none italic shadow-inner"
                    placeholder="Escribe aquí..."
                  />
                ) : (
                  <input 
                    autoFocus 
                    type={isTextField ? "text" : "number"} 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`w-full bg-black/40 p-4 rounded-2xl text-white text-center font-bold outline-none border border-white/10 focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner ${isTextField ? 'text-xl uppercase' : 'text-4xl'}`}
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/10 mt-2">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all">Confirmar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateValueModal;