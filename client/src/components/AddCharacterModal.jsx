import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

const AddCharacterModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      toast.error("Debes escribir una descripción para tu personaje.");
      return;
    }
    
    setIsLoading(true);
    try {
      await onAdd({ name, prompt });
      setName('');
      setPrompt('');
      onClose();
    } catch (error) {
      console.error(error);
      // El error (toast) debería manejarse idealmente en la función que llama a onAdd,
      // pero liberamos el estado de carga por si falla.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined}>
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#1A1C23]/90 backdrop-blur-xl border border-white/10 w-full max-w-sm rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-amber-500 mb-6 uppercase tracking-wider relative z-10">
              {isLoading ? 'Forjando con IA...' : 'Forjar Héroe'}
            </h2>
            
            {isLoading ? (
              <div className="relative z-10 flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-amber-400 font-bold text-xs uppercase tracking-widest animate-pulse">Contactando a los dioses...</p>
                <p className="text-slate-500 text-[10px] mt-2 italic text-center">Gemini está calculando HP, Atributos, Clase y Ataques.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block tracking-widest text-left uppercase">
                    Nombre (Opcional)
                  </label>
                  <input 
                    type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner"
                    placeholder="Si lo dejas vacío, la IA lo elegirá."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-amber-500 mb-1.5 flex items-center gap-2 tracking-widest text-left uppercase">
                    <span>✨</span> Descripción para IA
                  </label>
                  <textarea 
                    autoFocus
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner resize-none h-28 text-sm italic"
                    placeholder="Ej: Un paladín draconiano nivel 3 especializado en espadón, caótico bueno."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={onClose} className="flex-1 p-4 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-400 font-bold text-[10px] uppercase tracking-widest hover:bg-amber-500/20 active:scale-95 transition-all">
                    + Generar Héroe
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddCharacterModal;