import { useState } from "react";
import SkillTable from "../SkillTable";
import TraitCard from "../TraitCard";
import FeatCard from "../FeatCard";
import AddSkillModal from "../AddSkillModal";
import AddTraitModal from "../AddTraitModal";
import AddFeatModal from "../AddFeatModal";
import api from "../../api/axios";

export default function FeaturesTab({ character, onUpdate }) {
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white tracking-wider uppercase">Habilidades (Skills)</h2>
        </div>
        <div className="md:max-h-[500px] overflow-y-auto custom-scrollbar relative z-10">
          <SkillTable 
            character={character} 
            onUpdateSkill={(up) => onUpdate({ skills: up })} 
            onOpenAddModal={() => setIsSkillModalOpen(true)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -ml-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-lg font-bold text-white tracking-wider uppercase">Rasgos Innatos</h2>
            <button 
              onClick={() => setIsTraitModalOpen(true)} 
              className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-4 py-2 rounded-full hover:bg-amber-400/20 transition-colors"
            >
              + AGREGAR
            </button>
          </div>
          <div className="space-y-3 relative z-10">
            {character.traits?.length === 0 && <p className="text-sm text-slate-400 italic">No hay rasgos registrados.</p>}
            {character.traits?.map(t => (
              <TraitCard 
                key={t._id} 
                trait={t} 
                onDelete={(id) => onUpdate({ traits: character.traits.filter(x => x._id !== id) })} 
              />
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-lg font-bold text-white tracking-wider uppercase">Dotes (Feats)</h2>
            <button 
              onClick={() => setIsFeatModalOpen(true)} 
              className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full hover:bg-emerald-400/20 transition-colors"
            >
              + AGREGAR
            </button>
          </div>
          <div className="space-y-3 relative z-10">
            {character.feats?.length === 0 && <p className="text-sm text-slate-400 italic">No hay dotes registradas.</p>}
            {character.feats?.map(f => (
              <FeatCard 
                key={f._id} 
                feat={f} 
                onDelete={(id) => api.delete(`/character/${character._id}/feats/${id}`).then(() => onUpdate({ feats: character.feats.filter(x => x._id !== id) }))} 
              />
            ))}
          </div>
        </div>
      </div>

      <AddSkillModal 
        isOpen={isSkillModalOpen} 
        onClose={() => setIsSkillModalOpen(false)} 
        onAdd={(newSkill) => onUpdate({ skills: [...(character.skills || []), newSkill] })} 
      />
      <AddTraitModal 
        isOpen={isTraitModalOpen} 
        onClose={() => setIsTraitModalOpen(false)} 
        onAdd={(newTrait) => onUpdate({ traits: [...(character.traits || []), newTrait] })} 
      />
      <AddFeatModal 
        isOpen={isFeatModalOpen} 
        onClose={() => setIsFeatModalOpen(false)} 
        onAdd={(f) => api.post(`/character/${character._id}/feats`, f).then((r) => onUpdate({ feats: [...(character.feats || []), r.data] }))} 
      />
    </div>
  );
}
