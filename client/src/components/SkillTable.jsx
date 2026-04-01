import { useState, useEffect } from "react";
import { calculateSkillTotal, calculateMod } from '../utils/conversions';

export default function SkillTable({ character, onUpdateSkill }) {
  // 1. ESTADOS LOCALES
  // sortBy: 'alpha' (A-Z) o 'value' (Mayor a Menor)
  const [sortBy, setSortBy] = useState('alpha');
  
  // localSkills: Copia temporal para que el usuario edite sin peticiones constantes
  const [localSkills, setLocalSkills] = useState(character.skills || []);
  
  // hasChanges: Para mostrar u ocultar el botón de "Guardar"
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar si el personaje cambia (ej. cambia de aventurero)
  useEffect(() => {
    setLocalSkills(character.skills || []);
    setHasChanges(false);
  }, [character]);

  // 2. ORDENAMIENTO DE LA LISTA
  const sortedSkills = [...localSkills].sort((a, b) => {
    if (sortBy === 'alpha') {
      return a.name.localeCompare(b.name);
    } else {
      // Ordenar por el Total Calculado
      const totalA = calculateSkillTotal(a, character.stats);
      const totalB = calculateSkillTotal(b, character.stats);
      return totalB - totalA; // De mayor a menor
    }
  });

  // 3. HANDLERS
  const handleRankChange = (skillName, newValue) => {
    // Evitar que metan texto o cosas raras, si está vacío es 0
    const newRanks = newValue === '' ? '' : parseInt(newValue) || 0;
    
    setLocalSkills(prev => 
      prev.map(s => s.name === skillName ? { ...s, ranks: newRanks } : s)
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // Antes de guardar, asegurarnos de que los vacíos se vuelvan 0
    const cleanedSkills = localSkills.map(s => ({
      ...s,
      ranks: s.ranks === '' ? 0 : s.ranks
    }));
    
    // Mandamos el array completo a tu App.jsx (que hace la petición PATCH)
    // Nota: Tu prop onUpdateSkill actual solo espera name y ranks, 
    // pero aquí le mandaremos todo el arreglo para mayor eficiencia.
    onUpdateSkill(cleanedSkills); 
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalSkills(character.skills || []);
    setHasChanges(false);
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-2">
      
      {/* CONTROLES SUPERIORES */}
      <div className="flex justify-between items-center px-2 mb-4">
        <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setSortBy('alpha')}
            className={`px-3 py-1 text-[9px] font-black uppercase rounded ${sortBy === 'alpha' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            A-Z
          </button>
          <button 
            onClick={() => setSortBy('value')}
            className={`px-3 py-1 text-[9px] font-black uppercase rounded ${sortBy === 'value' ? 'bg-orange-600/20 text-orange-500' : 'text-slate-500'}`}
          >
            Puntuación
          </button>
        </div>

        {/* BOTONES DE GUARDADO FLOTANTES (Solo si hay cambios) */}
        {hasChanges && (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="px-2 py-1 text-[10px] text-slate-500 font-bold hover:text-red-400">✗</button>
            <button 
              onClick={handleSave} 
              className="bg-cyan-600 px-3 py-1 rounded-lg text-[9px] font-black text-white shadow-[0_0_10px_rgba(8,145,178,0.5)] active:scale-95 transition-all"
            >
              GUARDAR
            </button>
          </div>
        )}
      </div>

      {/* LISTA DE HABILIDADES */}
      <div className="space-y-[2px]">
        {sortedSkills.map((skill) => {
          const total = calculateSkillTotal(skill, character.stats);
          const statMod = calculateMod(character.stats[skill.stat]);

          return (
            <div key={skill.name} className="flex items-center gap-3 p-2 hover:bg-slate-800/40 rounded-xl border border-transparent hover:border-slate-800 transition-colors">
              
              {/* CÍRCULO DEL TOTAL */}
              <div className="w-9 h-9 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 shadow-inner flex-shrink-0">
                <span className={`text-sm font-black ${total > 0 ? 'text-cyan-400' : total < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {total > 0 ? `+${total}` : total}
                </span>
              </div>
              
              {/* TEXTOS */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white font-black uppercase truncate leading-tight">{skill.name}</p>
                <div className="flex gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  <span>{skill.stat.substring(0,3)} {statMod >= 0 ? `+${statMod}` : statMod}</span>
                  {skill.isClassSkill && <span className="text-orange-500/70">CLASE +3</span>}
                </div>
              </div>
              
              {/* INPUT DE RANGOS */}
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-slate-600 mb-0.5">RANGOS</span>
                <input 
                  type="number"
                  className="w-12 bg-slate-950 border border-slate-700 rounded p-1.5 text-center text-white text-xs font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  value={skill.ranks}
                  onChange={(e) => handleRankChange(skill.name, e.target.value)}
                  onFocus={(e) => e.target.select()} // Selecciona todo al picarle para borrar más fácil
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}