import { useState } from 'react';

export default function InventoryItem({ item, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  // PARACAÍDAS: Si item no existe, no renderiza nada y evita el pantallazo negro
  if (!item) return null;

  return (
    <div className="overflow-hidden border border-slate-800 rounded-2xl bg-slate-900/40 mb-3 transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left active:bg-slate-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shadow-inner">
            {item.icon || '📦'}
          </div>
          <div>
            <p className="font-black text-white text-sm uppercase leading-none mb-1">{item.name || 'Objeto Desconocido'}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.weight || 0} LB</p>
          </div>
        </div>
        <span className={`text-orange-500 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300">
          <div className="h-[1px] bg-slate-800 mb-3 mx-2" />
          <p className="px-2 text-xs text-slate-400 leading-relaxed italic mb-4">
            {item.desc || "Sin descripción."}
          </p>
          
          <button 
            onClick={() => onDelete(item._id)}
            className="w-full py-2 bg-red-900/20 border border-red-900/50 rounded-lg text-[10px] font-black text-red-500 uppercase tracking-tighter active:scale-95 transition-all"
          >
            🗑️ Tirar Objeto
          </button>
        </div>
      )}
    </div>
  );
}