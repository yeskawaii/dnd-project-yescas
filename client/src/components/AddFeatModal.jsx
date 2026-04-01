import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddFeatModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", type: "General", desc: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: "", type: "General", desc: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center p-4">
        <motion.div 
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800"
        >
          <h2 className="text-emerald-500 font-black text-xl mb-4 italic uppercase">Nueva Dote / Rasgo</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Nombre (ej. Ataque Poderoso)" required className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white focus:border-emerald-500 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
            
            <select className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none focus:border-emerald-500" onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="General">General</option>
              <option value="Combate">Combate</option>
              <option value="Magia">Magia</option>
              <option value="Raza">Rasgo Racial</option>
              <option value="Clase">Rasgo de Clase</option>
            </select>

            <textarea placeholder="Descripción y efectos..." required rows="4" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white focus:border-emerald-500 outline-none resize-none" onChange={e => setFormData({...formData, desc: e.target.value})} />

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-black text-xs text-slate-500 bg-slate-950 active:scale-95">CANCELAR</button>
              <button type="submit" className="flex-1 p-3 rounded-xl font-black text-xs text-white bg-emerald-600 active:scale-95">+ AGREGAR</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}