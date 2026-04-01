import { calculateSkillTotal, calculateMod } from '../utils/conversions';

export default function SkillTable({ character, onUpdateSkill }) {
  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4">
      <h3 className="text-orange-500 font-black uppercase text-xs tracking-widest mb-4">Habilidades</h3>
      <div className="space-y-1">
        {character.skills?.map((skill) => {
          const total = calculateSkillTotal(skill, character.stats);
          const statMod = calculateMod(character.stats[skill.stat]);

          return (
            <div key={skill.name} className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800">
                <span className={`text-sm font-black ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {total >= 0 ? `+${total}` : total}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-white font-bold uppercase">{skill.name}</p>
                <p className="text-[8px] text-slate-500 uppercase">{skill.stat} ({statMod >= 0 ? `+${statMod}` : statMod})</p>
              </div>
              <input 
                type="number"
                className="w-12 bg-slate-950 border border-slate-800 rounded p-1 text-center text-white text-xs"
                value={skill.ranks}
                onChange={(e) => onUpdateSkill(skill.name, parseInt(e.target.value))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}