import { useState, useEffect } from 'react';

const UpdateValueModal = ({ isOpen, onClose, onUpdate, title, initialValue, label, type }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Si es nota, mandamos string; si es stat/hp, mandamos número
    const finalValue = type === 'note' ? value : parseInt(value);
    onUpdate(finalValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-orange-500/30 w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
        <h2 className="text-sm font-black text-orange-500 mb-4 uppercase tracking-widest text-center italic">{title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest text-center uppercase">{label}</label>
            
            {/* Si es una nota, usamos un textarea para que quepa todo el chisme */}
            {type === 'note' ? (
              <textarea
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-800 p-4 rounded-2xl text-white text-sm font-medium outline-none border border-slate-700 focus:border-cyan-500 transition-all h-32 resize-none italic"
                placeholder="Escribe aquí tu hazaña..."
              />
            ) : (
              <input 
                autoFocus 
                type="number" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-800 p-4 rounded-2xl text-white text-center text-4xl font-black outline-none border border-slate-700 focus:border-orange-500 transition-all"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] uppercase hover:bg-slate-800 transition-all tracking-widest">Cancelar</button>
            <button type="submit" className="flex-1 bg-orange-600 p-3 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-orange-900/40 tracking-widest">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateValueModal;