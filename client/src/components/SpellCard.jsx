const SpellCard = ({ spell, onToggle, onDelete }) => {
  // Colores por escuela de magia 3.5
  const schoolColors = {
    Evocación: "border-red-500/50 text-red-400 shadow-red-900/20",
    Necromancia: "border-purple-600/50 text-purple-400 shadow-purple-900/20",
    Abjuración: "border-blue-500/50 text-blue-400 shadow-blue-900/20",
    Conjuración: "border-yellow-500/50 text-yellow-400 shadow-yellow-900/20",
    Ilusión: "border-pink-500/50 text-pink-400 shadow-pink-900/20",
    Encantamiento: "border-green-500/50 text-green-400 shadow-green-900/20",
    Adivinación: "border-cyan-400/50 text-cyan-300 shadow-cyan-900/20",
    Transmutación: "border-orange-500/50 text-orange-400 shadow-orange-900/20"
  };

  const currentColor = schoolColors[spell.school] || "border-slate-700 text-slate-400";

  return (
    <div className={`bg-slate-900/50 border ${currentColor} p-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={() => onToggle(spell._id)}>
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${currentColor} uppercase tracking-widest`}>
              Niv {spell.level}
            </span>
            <h3 className={`font-black uppercase tracking-tighter text-sm ${spell.prepared ? 'line-through opacity-40' : 'opacity-100'}`}>
              {spell.name}
            </h3>
          </div>
          <p className="text-[9px] font-bold opacity-60 mt-1 italic uppercase tracking-widest">
            Escuela: {spell.school}
          </p>
        </div>

        <button 
          onClick={() => onDelete(spell._id)}
          className="text-slate-700 hover:text-red-500 transition-colors ml-2"
        >
          ✕
        </button>
      </div>

      {/* Descripción expandible (puedes añadir lógica de estado para mostrar/ocultar si quieres) */}
      {spell.desc && (
        <div className="mt-3 pt-3 border-t border-slate-800/50">
          <p className="text-[10px] text-slate-400 leading-relaxed normal-case italic">
            {spell.desc}
          </p>
        </div>
      )}

      {/* Indicador de "Preparado" o "Lanzado" */}
      <div className="mt-2 flex justify-end">
        <span className={`text-[8px] font-black ${spell.prepared ? 'text-green-500' : 'text-slate-600'}`}>
          {spell.prepared ? "● CONJURO LANZADO" : "○ DISPONIBLE"}
        </span>
      </div>
    </div>
  );
};

export default SpellCard;