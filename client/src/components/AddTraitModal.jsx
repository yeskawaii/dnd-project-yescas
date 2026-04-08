import { useState, useEffect } from "react";

export default function AddTraitModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("Raza");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSource("Raza");
      setDesc("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;
    onAdd({ name, source, description: desc });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-black text-white mb-4 uppercase tracking-tighter italic">Agregar Rasgo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nombre del Rasgo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold uppercase focus:border-blue-500 outline-none transition-colors" placeholder="Ej. Resiliencia Construida" autoFocus />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Origen</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold uppercase focus:border-blue-500 outline-none transition-colors">
              <option value="Raza">Raza</option>
              <option value="Clase">Clase</option>
              <option value="Trasfondo">Trasfondo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Descripción</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-blue-500 outline-none transition-colors resize-none custom-scrollbar" placeholder="¿Qué hace este rasgo?"></textarea>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] uppercase hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 p-3 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}