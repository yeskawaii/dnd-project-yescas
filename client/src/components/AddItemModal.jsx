import { useState } from 'react';

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: '', weight: '', desc: '', icon: '📦' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onAdd(formData);
    setFormData({ name: '', weight: '', desc: '', icon: '📦' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-orange-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(234,88,12,0.3)] animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Nuevo Tesoro</h3>
          <button onClick={onClose} className="text-slate-500 text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="NOMBRE..."
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <div className="flex gap-3">
            <input 
              placeholder="PESO..."
              type="number"
              className="w-1/2 bg-slate-800 border border-slate-700 p-4 rounded-xl text-white font-bold outline-none"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: e.target.value})}
            />
            <select 
              className="w-1/2 bg-slate-800 border border-slate-700 p-4 rounded-xl text-white font-bold outline-none"
              value={formData.icon}
              onChange={e => setFormData({...formData, icon: e.target.value})}
            >
              <option value="📦">PACK</option>
              <option value="⚔️">ARMA</option>
              <option value="🛡️">DEF</option>
              <option value="🧪">POTI</option>
              <option value="📜">DOC</option>
            </select>
          </div>
          <textarea 
            placeholder="DESCRIPCIÓN..."
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl text-white text-xs outline-none h-24 italic resize-none"
            value={formData.desc}
            onChange={e => setFormData({...formData, desc: e.target.value})}
          />
          <button type="submit" className="w-full bg-orange-600 p-4 rounded-xl font-black text-white shadow-lg active:scale-95 transition-all">
            GUARDAR
          </button>
        </form>
      </div>
    </div>
  );
}