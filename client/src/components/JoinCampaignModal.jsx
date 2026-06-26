import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinCampaignModal({ isOpen, onClose, onJoin, characters }) {
  const [code, setCode] = useState("");
  const [charId, setCharId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setCharId(characters[0]?._id || "");
    }
  }, [isOpen, characters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !charId) return;
    onJoin(code.toUpperCase(), charId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }} 
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#1A1C23]/90 backdrop-blur-xl border border-white/10 w-full max-w-[320px] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-cyan-400 mb-6 uppercase tracking-wider relative z-10">Unirse a Contienda</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Código de Invitación</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm uppercase focus:border-cyan-500/50 focus:bg-white/5 outline-none transition-all shadow-inner" 
                  placeholder="EJ: AB12CD" 
                  autoFocus 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Elegir Personaje</label>
                <select 
                  value={charId} 
                  onChange={(e) => setCharId(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm cursor-pointer focus:border-cyan-500/50 focus:bg-white/5 outline-none transition-all shadow-inner"
                >
                  {characters.map(c => (
                    <option key={c._id} value={c._id}>{c.name} (LVL {c.level})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 active:scale-95 transition-all">Entrar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}