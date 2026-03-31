import { useState, useEffect } from 'react';

const UpdateValueModal = ({ isOpen, onClose, onUpdate, title, initialValue, label }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(parseInt(value));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-orange-500/30 w-full max-w-[280px] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
        <h2 className="text-sm font-black text-orange-500 mb-4 uppercase tracking-widest text-center italic">{title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-slate-500 mb-1 block tracking-widest text-center">{label}</label>
            <input 
              autoFocus type="number" value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-slate-800 p-4 rounded-2xl text-white text-center text-2xl font-black outline-none border border-slate-700 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl text-slate-500 font-black text-[10px] uppercase hover:bg-slate-800 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 bg-orange-600 p-3 rounded-xl text-white font-black text-[10px] uppercase shadow-lg shadow-orange-900/40">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateValueModal;