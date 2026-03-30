import { useState } from 'react';

const AddCharacterModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [customClass, setCustomClass] = useState('');

  // Lista extendida de 3.5
  const dndClasses = [
    "Guerrero", "Mago", "Pícaro", "Clérigo", "Bárbaro", "Bardo", 
    "Druida", "Explorador", "Monje", "Paladín", "Hechicero", 
    "Warlock", "Psiónico", "Caballero", "Samurái", "Ninja", "Otra (Personalizada)"
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    
    // Si eligió "Otra", usamos lo que escribió en el campo personalizado
    const finalClass = charClass === "Otra (Personalizada)" ? customClass : charClass;
    
    onAdd({ name, charClass: finalClass || "Aventurero" });
    setName('');
    setCustomClass('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-black text-orange-500 mb-6 uppercase tracking-tighter italic">Forjar Nuevo Héroe</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-500 mb-2 block tracking-widest text-left">NOMBRE DEL PERSONAJE</label>
            <input 
              autoFocus type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 ring-orange-500 transition-all font-bold"
              placeholder="Ej: Yescas el Cuervo"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 mb-2 block tracking-widest text-left">CLASE BASE 3.5</label>
            <select 
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
              className="w-full bg-slate-800 p-4 rounded-xl text-white outline-none appearance-none font-bold cursor-pointer"
            >
              {dndClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Campo extra si elige Personalizada */}
          {charClass === "Otra (Personalizada)" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-orange-500/50 mb-2 block tracking-widest text-left">ESPECIFICA TU CLASE</label>
              <input 
                type="text" value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                className="w-full bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-white outline-none focus:ring-1 ring-orange-500 font-bold"
                placeholder="Ej: Archienemigo"
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 p-4 rounded-xl text-slate-500 font-black text-[10px] hover:bg-slate-800 transition-all">CANCELAR</button>
            <button type="submit" className="flex-1 bg-orange-600 p-4 rounded-xl text-white font-black text-[10px] shadow-lg shadow-orange-900/40 hover:bg-orange-500 transition-all">CREAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCharacterModal;