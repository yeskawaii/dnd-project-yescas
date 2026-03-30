const SpellCard = ({ spell, onToggle, onDelete }) => {
  const schoolColors = {
    Evocación: 'border-red-500 text-red-400',
    Necromancia: 'border-purple-500 text-purple-400',
    Abjuración: 'border-blue-500 text-blue-400',
    Ilusión: 'border-pink-500 text-pink-400',
    default: 'border-slate-700 text-slate-400'
  };

  const colorClass = schoolColors[spell.school] || schoolColors.default;

  return (
    <div className={`p-4 rounded-xl border-l-4 bg-slate-900/50 mb-3 flex justify-between items-center ${colorClass}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-sm text-white tracking-tighter">{spell.name}</h3>
          <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full">NIVEL {spell.level}</span>
        </div>
        <p className="text-[10px] opacity-70 normal-case mt-1 italic">{spell.desc}</p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => onToggle(spell._id)}
          className={`text-xl transition-all ${spell.prepared ? 'grayscale-0 scale-110' : 'grayscale opacity-30'}`}
          title={spell.prepared ? "Preparado" : "No preparado"}
        >
          ✨
        </button>
        <button onClick={() => onDelete(spell._id)} className="text-slate-600 hover:text-red-500 text-xs">
          ✕
        </button>
      </div>
    </div>
  );
};

export default SpellCard;