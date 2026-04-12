import { useState } from "react";

export default function AddCampaignModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-[320px] rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-black text-white mb-4 italic">Nueva Contienda</h2>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs mb-4 outline-none focus:border-orange-500"
          placeholder="Nombre de la partida..."
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 p-3 text-slate-500 font-black text-[10px]">CANCELAR</button>
          <button onClick={() => { onAdd(name); setName(""); onClose(); }} className="flex-1 bg-orange-600 p-3 rounded-xl text-white font-black text-[10px]">CREAR</button>
        </div>
      </div>
    </div>
  );
}