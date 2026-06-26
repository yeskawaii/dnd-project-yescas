import { motion } from "framer-motion";
import { calculateAttackTotal, calculateDamageBonus } from "../utils/conversions";

export default function AttackCard({ attack, character, onDelete }) {
  const totalAtk = calculateAttackTotal(attack, character);
  const totalDmgBonus = calculateDamageBonus(attack, character);
  
  const formatBonus = (num) => (num >= 0 ? `+${num}` : num);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-inner"
    >
      {/* 1. Header (Name + Controls) */}
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-white text-sm tracking-wider uppercase flex items-center gap-2">
          {attack.type === 'Ranged' ? '🏹' : '⚔️'} {attack.name}
        </h3>
        <button 
          onClick={() => onDelete(attack._id)}
          className="text-rose-500/50 hover:text-rose-500 text-sm p-1 active:scale-95 transition-all"
        >
          🗑️
        </button>
      </div>

      {/* 2. Subtitle (Type & Damage Type) */}
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-2">
        {attack.type} • {attack.damageType}
      </p>

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {/* Col 1: Ataque (Cyan border) */}
        <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-2 text-center flex flex-col justify-center">
          <p className="text-[9px] font-bold text-cyan-500 mb-1 uppercase tracking-widest">Ataque</p>
          <p className="text-xl font-black text-white leading-none">{formatBonus(totalAtk)}</p>
        </div>
        
        {/* Col 2: Daño (Orange/Red border) */}
        <div className="bg-white/5 border border-amber-500/30 rounded-xl p-2 text-center flex flex-col justify-center">
          <p className="text-[9px] font-bold text-amber-500 mb-1 uppercase tracking-widest">Daño</p>
          <p className="text-xl font-black text-white leading-none">
            {attack.damageDice} <span className="text-sm text-slate-400">{formatBonus(totalDmgBonus)}</span>
          </p>
        </div>

        {/* Col 3: Crítico (Purple border) */}
        <div className="bg-white/5 border border-violet-500/30 rounded-xl p-2 text-center flex flex-col justify-center">
          <p className="text-[9px] font-bold text-violet-500 mb-1 uppercase tracking-widest">Crítico</p>
          <p className="text-xs font-black text-white leading-tight">
            {attack.critRange}<br/><span className="text-[10px] text-slate-500">{attack.critMultiplier}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}