import { useState } from "react";
import SpellCard from "../SpellCard";
import AddSpellModal from "../AddSpellModal";
import api from "../../api/axios";

export default function SpellsTab({ character, onUpdate }) {
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState(null);

  const handleDeleteSpell = (id) => {
    onUpdate({ spells: character.spells.filter(x => x._id !== id) });
  };

  const handleToggleSpell = (id) => {
    api.patch(`/character/${character._id}/spells/${id}`).then(r => {
      onUpdate({ spells: character.spells.map(x => x._id === id ? r.data : x) });
    });
  };

  const openAddSpell = () => {
    setEditingSpell(null);
    setIsSpellModalOpen(true);
  };

  const openEditSpell = (spell) => {
    setEditingSpell(spell);
    setIsSpellModalOpen(true);
  };

  return (
    <div className="pb-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white tracking-wider uppercase">Grimorio Mágico</h2>
          <button 
            onClick={openAddSpell} 
            className="bg-violet-600/20 border border-violet-500/30 px-4 py-2 rounded-full text-[10px] font-bold text-violet-300 hover:bg-violet-600/40 hover:text-white transition-colors tracking-widest uppercase shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            + APRENDER
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {character.spells?.sort((a,b) => a.level - b.level).map((s) => (
            <SpellCard 
              key={s._id} 
              spell={s} 
              onToggle={() => handleToggleSpell(s._id)} 
              onDelete={() => handleDeleteSpell(s._id)} 
              onEdit={() => openEditSpell(s)} 
            />
          ))}
        </div>
      </div>

      <AddSpellModal 
        isOpen={isSpellModalOpen} 
        onClose={() => { setIsSpellModalOpen(false); setEditingSpell(null); }} 
        onAdd={(s) => api.post(`/character/${character._id}/spells`, s).then((r) => onUpdate({ spells: [...character.spells, r.data] }))} 
        onEdit={(id, data) => api.patch(`/character/${character._id}/spells/${id}`, data).then((r) => onUpdate({ spells: character.spells.map((s) => (s._id === id ? r.data : s)) }))} 
        spellToEdit={editingSpell} 
      />
    </div>
  );
}
