import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SpellCard({ spell, onToggle, onDelete, onEdit }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-2"
    >
      <div className="flex justify-between items-center pr-2">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 p-3 flex items-center gap-3 text-left active:bg-slate-800/50 transition-colors"
        >
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-inner flex-shrink-0 ${spell.prepared ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' : 'bg-slate-950 border-slate-700 text-slate-600'}`}>
            <span className="text-xs font-black">N{spell.level}</span>
          </div>
          <div className="truncate">
            <h4 className={`font-black text-xs uppercase tracking-tighter truncate ${spell.prepared ? 'text-white' : 'text-slate-400'}`}>{spell.name}</h4>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{spell.school}</p>
          </div>
        </button>

        {/* SWITCH PREPARADO */}
        <button 
          onClick={() => onToggle(spell._id)}
          className={`w-10 h-5 rounded-full relative transition-colors mr-2 ${spell.prepared ? 'bg-cyan-600' : 'bg-slate-800'}`}
        >
          <motion.div layout className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 ${spell.prepared ? 'right-1' : 'left-1'}`} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="h-[1px] bg-slate-800 w-full mb-3" />
            <p className="text-xs text-slate-400 leading-relaxed italic mb-4">{spell.desc}</p>
            
            <div className="flex gap-2">
              <button 
                onClick={onEdit}
                className="flex-1 py-2 bg-cyan-950/30 border border-cyan-900/50 rounded-xl text-[10px] font-black text-cyan-500 uppercase active:scale-95 transition-transform"
              >
                ✎ Editar
              </button>
              <button 
                onClick={() => onDelete(spell._id)}
                className="flex-1 py-2 bg-red-950/30 border border-red-900/50 rounded-xl text-[10px] font-black text-red-500 uppercase active:scale-95 transition-transform"
              >
                🗑️ Olvidar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}