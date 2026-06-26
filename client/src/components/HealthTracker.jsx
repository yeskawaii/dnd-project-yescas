import { useState } from "react";
import EditableNumber from "./ui/EditableNumber";

const HealthTracker = ({ currentHp, maxHp, onEditHp, onEditMax }) => {
  const [isModifying, setIsModifying] = useState(false);
  const [modValue, setModValue] = useState("");
  
  const percentage = maxHp ? Math.min((currentHp / maxHp) * 100, 100) : 0;

  const handleApply = (type) => {
    const val = Number(modValue);
    if (isNaN(val) || val <= 0) {
      setIsModifying(false);
      setModValue("");
      return;
    }
    
    let newHp = currentHp;
    if (type === "heal") {
      newHp = currentHp + val;
      if (newHp > maxHp) newHp = maxHp;
    } else if (type === "damage") {
      newHp = currentHp - val;
      if (newHp < 0) newHp = 0;
    }
    
    onEditHp(newHp);
    setIsModifying(false);
    setModValue("");
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center text-[10px] font-bold text-slate-400 tracking-widest mb-1 uppercase">
            <span>Vida Máxima:</span>
            <EditableNumber 
              value={maxHp} 
              onSave={onEditMax} 
              className="ml-1 text-slate-300" 
              min={1} 
            />
          </div>
          <div className="flex items-end gap-1">
            <EditableNumber 
              value={currentHp} 
              onSave={onEditHp} 
              className="text-5xl font-black text-white leading-none tracking-tighter" 
            />
            <span className="text-xl text-slate-500 font-bold mb-1">HP</span>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex-shrink-0 w-full md:w-auto">
          {!isModifying ? (
            <button 
              onClick={() => setIsModifying(true)}
              className="w-full md:w-auto bg-white/5 border border-white/20 px-5 py-2.5 rounded-2xl text-amber-400 font-bold text-[10px] tracking-widest uppercase hover:bg-white/10 hover:border-amber-400/50 transition-all active:scale-95 shadow-lg"
            >
              ± Modificar
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
              <input 
                type="number"
                value={modValue}
                onChange={(e) => setModValue(e.target.value)}
                placeholder="0"
                className="w-16 bg-transparent text-white font-bold text-center outline-none px-2"
                autoFocus
                onKeyDown={(e) => {
                  if(e.key === "Escape") { setIsModifying(false); setModValue(""); }
                  if(e.key === "Enter") handleApply("damage"); // Default to damage on enter for fast combat
                }}
              />
              <div className="flex gap-1">
                <button 
                  onClick={() => handleApply("damage")}
                  className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase hover:bg-rose-500/40 transition-colors"
                >
                  Daño
                </button>
                <button 
                  onClick={() => handleApply("heal")}
                  className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-500/40 transition-colors"
                >
                  Curar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div 
          className={`h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
            percentage < 25 ? 'bg-rose-500 shadow-rose-500/50' : 
            percentage > 100 ? 'bg-amber-400 shadow-amber-400/50' : 
            'bg-emerald-500 shadow-emerald-500/50'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default HealthTracker;