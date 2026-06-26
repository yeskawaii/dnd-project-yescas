import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }) {
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
            className="bg-[#1A1C23]/90 backdrop-blur-xl border border-rose-500/30 w-full max-w-[320px] rounded-3xl p-6 shadow-[0_8px_30px_rgb(225,29,72,0.15)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4 relative z-10">
              ⚠️
            </div>
            <h2 className="text-sm font-bold text-rose-500 mb-2 uppercase tracking-widest text-center relative z-10">{title}</h2>
            <p className="text-xs font-medium text-slate-400 text-center mb-6 relative z-10">{message}</p>
            
            <div className="flex gap-3 relative z-10 border-t border-white/5 pt-4">
              <button 
                onClick={onClose} 
                className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }} 
                className="flex-1 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition-all"
              >
                🗑️ Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}