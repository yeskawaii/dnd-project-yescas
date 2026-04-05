import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddAttackModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "", type: "Melee", damageDice: "1d8", damageType: "Cortante",
    attackBonus: 0, damageBonus: 0, critRange: "20", critMultiplier: "x2"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: "", type: "Melee", damageDice: "1d8", damageType: "Cortante", attackBonus: 0, damageBonus: 0, critRange: "20", critMultiplier: "x2" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-4 pb-32 sm:pb-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-orange-500 font-black text-xl mb-4 italic uppercase">Forjar Arma</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Nombre (ej. Espada Larga)" required className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white focus:border-orange-500 outline-none transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Melee">Melee (Fuerza)</option>
                  <option value="Ranged">A Distancia (Destreza)</option>
                </select>
                <input type="text" placeholder="Dado (ej. 1d8)" required className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none text-center focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, damageDice: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] text-slate-500 font-black px-1">BONO ATAQUE MÁGICO</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none text-center focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, attackBonus: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 font-black px-1">BONO DAÑO MÁGICO</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none text-center focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, damageBonus: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Crítico (ej. 19-20)" className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none text-center focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, critRange: e.target.value})} />
                <input type="text" placeholder="Multiplicador (ej. x2)" className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm text-white outline-none text-center focus:border-orange-500 transition-all" onChange={e => setFormData({...formData, critMultiplier: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl font-black text-xs text-slate-500 bg-slate-950 active:scale-95 transition-all">CANCELAR</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-black text-xs text-white bg-orange-600 active:scale-95 transition-all">+ EQUIPAR</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}