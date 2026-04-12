import { useState, useEffect } from "react";

export default function JoinCampaignModal({ isOpen, onClose, onJoin, characters }) {
  const [code, setCode] = useState("");
  const [charId, setCharId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setCharId(characters[0]?._id || "");
    }
  }, [isOpen, characters]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !charId) return;
    onJoin(code.toUpperCase(), charId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-black text-white mb-4 uppercase tracking-tighter italic">Unirse a Contienda</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Código de Invitación</label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold uppercase focus:border-cyan-500 outline-none transition-colors" 
              placeholder="EJ: AB12CD" 
              autoFocus 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Elegir Personaje</label>
            <select 
              value={charId} 
              onChange={(e) => setCharId(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold uppercase focus:border-cyan-500 outline-none transition-colors"
            >
              {characters.map(c => (
                <option key={c._id} value={c._id}>{c.name} (LVL {c.level})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] uppercase active:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 bg-cyan-600 p-3 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-cyan-900/30 active:bg-cyan-500 transition-colors">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}