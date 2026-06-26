import { useState } from "react";
import { motion } from "framer-motion";
import HealthTracker from "../HealthTracker";
import EditableText from "../ui/EditableText";
import EditableNumber from "../ui/EditableNumber";
import AttackCard from "../AttackCard";
import AddAttackModal from "../AddAttackModal";


import { lbToKg, inToCm, calculateMod } from "../../utils/conversions";
import api from "../../api/axios";

export default function StatsTab({ character, onUpdate, unitSystem, setUnitSystem }) {
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);

  const dexMod = calculateMod(character.stats?.Destreza);
  const totalCA = 10 + (character.armorClass?.armor || 0) + dexMod;


  const handleStatUpdate = (statName, val) => {
    onUpdate({ stats: { ...character.stats, [statName]: val } });
  };

  const handleSaveUpdate = (saveName, val) => {
    onUpdate({ saves: { ...character.saves, [saveName]: val } });
  };

  const handleDeleteAttack = (id) => {
    api.delete(`/character/${character._id}/attacks/${id}`).then(() => {
      onUpdate({ attacks: character.attacks.filter(a => a._id !== id) });
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-md mx-auto"
    >
      {/* 1. Barra de Salud */}
      <motion.div variants={itemVariants}>
        <HealthTracker
          currentHp={character.hp?.current}
          maxHp={character.hp?.max}
          onEditHp={(val) => onUpdate({ hp: { ...character.hp, current: val } })}
          onEditMax={(val) => onUpdate({ hp: { ...character.hp, max: val } })}
        />
      </motion.div>

      {/* 2. Tarjeta de Biografía */}
      <motion.div variants={itemVariants} className="bg-[#1A1C23] rounded-2xl p-4 shadow-lg border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Biografía</h2>
          <button
            onClick={() => setUnitSystem(unitSystem === "imp" ? "metric" : "imp")}
            className="text-amber-400 font-semibold text-[10px] uppercase bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 active:scale-95 transition-all"
          >
            {unitSystem === "imp" ? "LB/FT" : "KG/CM"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Raza</span>
            <EditableText value={character.race} onSave={(val) => onUpdate({ race: val })} label="Raza" className="text-white font-semibold text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alineamiento</span>
            <EditableText value={character.alignment} onSave={(val) => onUpdate({ alignment: val })} label="Alineamiento" className="text-white font-semibold text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Deidad</span>
            <EditableText value={character.deity} onSave={(val) => onUpdate({ deity: val })} label="Deidad" className="text-white font-semibold text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Altura</span>
            <div className="flex items-center text-sm font-semibold text-white tracking-tight">
              <EditableNumber value={character.height} onSave={(val) => onUpdate({ height: val })} label="Altura" />
              <span className="ml-1 text-[10px] text-slate-500">{unitSystem === "imp" ? '"' : `(${inToCm(character.height || 0)}cm)`}</span>
            </div>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Peso Físico Pers.</span>
            <div className="flex items-center text-sm font-semibold text-amber-400 tracking-tight">
              <EditableNumber value={character.physicalWeight} onSave={(val) => onUpdate({ physicalWeight: val })} label="Peso" />
              <span className="ml-1 text-[10px] text-slate-500">{unitSystem === "imp" ? "lb" : `(${lbToKg(character.physicalWeight || 0)}kg)`}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Tarjeta de Atributos */}
      <motion.div variants={itemVariants} className="bg-[#1A1C23] rounded-2xl p-4 shadow-lg border border-white/5">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Atributos</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(character.stats || {}).map(([stat, val]) => (
            <div key={stat} className="bg-black/40 rounded-xl p-3 flex justify-between items-center border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.substring(0, 3)}</span>
                <EditableNumber
                  value={val}
                  onSave={(newVal) => handleStatUpdate(stat, newVal)}
                  className="text-white font-bold text-lg"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                <span className="text-sm font-black text-violet-400">
                  {calculateMod(val) >= 0 ? `+${calculateMod(val)}` : calculateMod(val)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 4. Tarjeta de Combate */}
      <motion.div variants={itemVariants} className="bg-[#1A1C23] rounded-2xl p-4 shadow-lg border border-white/5">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Combate</h2>
        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div className="bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Armor Class</span>
            <span className="text-3xl font-black text-white">{totalCA}</span>
            <div className="mt-1 flex items-center text-[8px] text-slate-500">
              EQP: <EditableNumber value={character.armorClass?.armor} onSave={(val) => onUpdate({ armorClass: { ...character.armorClass, armor: val } })} className="ml-1" />
            </div>
          </div>
          <div className="bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base Attack</span>
            <EditableNumber value={character.baseAttack} onSave={(val) => onUpdate({ baseAttack: val })} className="text-3xl font-black text-white" />
          </div>
          <div className="bg-black/40 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Iniciativa</span>
            <span className="text-3xl font-black text-white">
              {(dexMod + (character.initiativeMisc || 0)) >= 0 ? "+" : ""}
              {dexMod + (character.initiativeMisc || 0)}
            </span>
            <div className="mt-1 flex items-center text-[8px] text-slate-500">
              MISC: <EditableNumber value={character.initiativeMisc} onSave={(val) => onUpdate({ initiativeMisc: val })} className="ml-1" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["fort", "ref", "will"].map((s) => (
            <div key={s} className="bg-black/40 rounded-xl p-2 text-center border border-white/5 relative overflow-hidden">
              <span className="text-[9px] block font-bold text-slate-500 mb-1 tracking-widest uppercase">{s}</span>
              <EditableNumber
                value={character.saves?.[s]}
                onSave={(val) => handleSaveUpdate(s, val)}
                className={`font-black text-xl mx-auto drop-shadow-md ${s === "fort" ? "text-rose-400" : s === "ref" ? "text-cyan-400" : "text-violet-400"}`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* 5. Armas Equipadas */}
      <motion.div variants={itemVariants} className="bg-[#1A1C23] rounded-2xl p-4 shadow-lg border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Armas Equipadas</h2>
          <button
            onClick={() => setIsAttackModalOpen(true)}
            className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg hover:bg-amber-400/20 active:scale-95 transition-all"
          >
            + AGREGAR
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {character.attacks?.length === 0 && <p className="text-xs text-slate-500 italic text-center py-4">No tienes armas equipadas.</p>}
          {character.attacks?.map((atk) => (
            <AttackCard key={atk._id} attack={atk} character={character} onDelete={handleDeleteAttack} />
          ))}
        </div>
      </motion.div>

      {/* MODALES */}
      <AddAttackModal isOpen={isAttackModalOpen} onClose={() => setIsAttackModalOpen(false)} onAdd={(a) => api.post(`/character/${character._id}/attacks`, a).then((r) => onUpdate({ attacks: [...(character.attacks || []), r.data] }))} />


    </motion.div>
  );
}
