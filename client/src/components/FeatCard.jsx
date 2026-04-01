import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeatCard({ feat, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-2"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center text-left active:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner text-xs">
            🌟
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-tighter">{feat.name}</h4>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{feat.type}</p>
          </div>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-emerald-500 text-xs">▼</motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="h-[1px] bg-slate-800 w-full mb-3" />
            <p className="text-xs text-slate-400 leading-relaxed italic mb-3">{feat.desc}</p>
            <button 
              onClick={() => onDelete(feat._id)}
              className="w-full py-2 bg-red-950/30 border border-red-900/50 rounded-xl text-[10px] font-black text-red-500 uppercase active:scale-95 transition-transform"
            >
              🗑️ Olvidar Dote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}