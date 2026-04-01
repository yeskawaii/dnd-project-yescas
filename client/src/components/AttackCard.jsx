import { motion } from "framer-motion";
import { calculateAttackTotal, calculateDamageBonus } from "../utils/conversions";

export default function AttackCard({ attack, character, onDelete }) {
  const totalAtk = calculateAttackTotal(attack, character);
  const totalDmgBonus = calculateDamageBonus(attack, character);
  
  // Para que se vea "+3" o "-1"
  const formatBonus = (num) => (num >= 0 ? `+${num}` : num);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 relative group overflow-hidden flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-black text-white text-sm uppercase tracking-tighter flex items-center gap-2">
            {attack.type === 'Ranged' ? '🏹' : '⚔️'} {attack.name}
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {attack.type} • {attack.damageType}
          </p>
        </div>
        <button 
          onClick={() => onDelete(attack._id)}
          className="text-red-500/50 hover:text-red-500 text-xs p-1"
        >
          🗑️
        </button>
      </div>

      <div className="flex gap-2 mt-1">
        <div className="flex-1 bg-slate-950 border border-cyan-900/30 rounded-xl p-2 text-center">
          <p className="text-[8px] font-black text-cyan-600 mb-0.5 uppercase">Ataque</p>
          <p className="text-lg font-black text-white leading-none">{formatBonus(totalAtk)}</p>
        </div>
        
        <div className="flex-[2] bg-slate-950 border border-orange-900/30 rounded-xl p-2 text-center flex flex-col justify-center">
          <p className="text-[8px] font-black text-orange-600 mb-0.5 uppercase">Daño</p>
          <p className="text-lg font-black text-white leading-none">
            {attack.damageDice} <span className="text-sm text-slate-400">{formatBonus(totalDmgBonus)}</span>
          </p>
        </div>

        <div className="flex-1 bg-slate-950 border border-purple-900/30 rounded-xl p-2 text-center">
          <p className="text-[8px] font-black text-purple-600 mb-0.5 uppercase">Crítico</p>
          <p className="text-[10px] font-black text-white leading-none mt-1">
            {attack.critRange}<br/><span className="text-slate-500">{attack.critMultiplier}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}