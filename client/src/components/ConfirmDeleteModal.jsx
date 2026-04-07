export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-red-500/30 w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mx-auto mb-3">
          ⚠️
        </div>
        <h2 className="text-sm font-black text-red-500 mb-2 uppercase tracking-widest text-center italic">{title}</h2>
        <p className="text-xs font-medium text-slate-400 text-center mb-6">{message}</p>
        
        <div className="flex gap-2">
          <button 
            onClick={onClose} 
            className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] uppercase hover:bg-slate-800 transition-all tracking-widest active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-1 bg-red-950/40 border border-red-900/50 p-3 rounded-xl text-red-500 font-black text-[10px] uppercase shadow-lg shadow-red-900/20 tracking-widest active:scale-95 hover:bg-red-900/60 transition-all"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}