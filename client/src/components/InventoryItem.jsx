import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryItem({ item, onDelete, onEdit }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-2"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center text-left active:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-xl border border-slate-800 flex-shrink-0">
            {item.icon || '📦'}
          </div>
          <div className="truncate">
            <h4 className="text-white font-black text-xs uppercase tracking-tighter truncate">{item.name}</h4>
            <div className="flex gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              <span>{item.weight || 0} LBS</span>
            </div>
          </div>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-500 text-xs ml-2 flex-shrink-0">
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="h-[1px] bg-slate-800 w-full mb-3" />
            
            {item.desc ? (
              <p className="text-xs text-slate-400 leading-relaxed italic mb-4">{item.desc}</p>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed italic mb-4">Sin descripción...</p>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={onEdit}
                className="flex-1 py-2 bg-cyan-950/30 border border-cyan-900/50 rounded-xl text-[10px] font-black text-cyan-500 uppercase active:scale-95 transition-transform"
              >
                ✎ Editar
              </button>
              <button 
                onClick={() => onDelete(item._id)}
                className="flex-1 py-2 bg-red-950/30 border border-red-900/50 rounded-xl text-[10px] font-black text-red-500 uppercase active:scale-95 transition-transform"
              >
                🗑️ Tirar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}