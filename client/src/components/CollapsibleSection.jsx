// src/components/CollapsibleSection.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 bg-slate-900/30 border border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-5 py-4 flex justify-between items-center text-slate-400 active:bg-slate-800/50 transition-colors"
      >
        <span className="font-black text-[10px] uppercase tracking-widest text-slate-300">{title}</span>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          className="text-orange-500 text-xs"
        >
          ▼
        </motion.span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="px-5 pb-5 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}