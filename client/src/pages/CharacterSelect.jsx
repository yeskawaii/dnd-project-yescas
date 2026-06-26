import { motion } from "framer-motion";
import { useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import AddCharacterModal from "../components/AddCharacterModal";
import JoinCampaignModal from "../components/JoinCampaignModal";

export default function CharacterSelect({ 
  characters, 
  setCharacters, 
  setSelectedChar, 
  setMode, 
  askDelete 
}) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);

  const handleJoinCampaign = (inviteCode, characterId) => {
    api.post("/campaign/join", { inviteCode, characterId })
      .then((res) => {
        toast.success(res.data.message);
        setCharacters(characters.map(c => c._id === characterId ? res.data.character : c));
      })
      .catch((err) => toast.error(err.response?.data?.message || "Error al unirse"));
  };

  const handleDelete = (id) => {
    askDelete("Borrar", "¿Eliminar héroe?", () => 
      api.delete(`/character/${id}`)
        .then(() => setCharacters(characters.filter(char => char._id !== id)))
    );
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <button onClick={() => setMode("lobby")} className="absolute top-8 left-8 text-slate-400 hover:text-white text-[10px] tracking-widest uppercase transition-colors z-10">
        ← VOLVER AL LOBBY
      </button>
      
      <h1 className="text-amber-500 font-bold text-4xl mb-12 tracking-wider z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">Selecciona tu Héroe</h1>
      
      <div className="grid gap-4 w-full max-w-md z-10">
        {characters.map((c) => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }} 
            key={c._id} 
            className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)] group cursor-pointer"
            onClick={() => setSelectedChar(c)}
          >
            <div className="flex-1 text-left truncate">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-black/30 border border-white/5 rounded-full flex items-center justify-center text-lg shadow-inner">
                  {c.class === "Hechicero" ? "🪄" : "⚔️"}
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl truncate leading-none group-hover:text-amber-400 transition-colors">{c.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase">{c.class} • LVL {c.level}</p>
                    {c.campaign && (
                      <span className="bg-amber-500/20 text-amber-400 text-[9px] px-2 py-0.5 font-bold border border-amber-500/30 rounded-full uppercase">
                        🗡️ {c.campaign.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }} 
              className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all opacity-50 group-hover:opacity-100"
              title="Eliminar Héroe"
            >
              🗑️
            </button>
          </motion.div>
        ))}

        <div className="mt-8 flex gap-4 w-full">
          <button 
            onClick={() => setIsJoinModalOpen(true)} 
            className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-violet-400 font-bold text-xs uppercase shadow-sm tracking-widest hover:text-white hover:border-violet-400/50 hover:bg-violet-500/20 transition-all text-center"
          >
            🔗 UNIRSE A CONTIENDA
          </button>

          <button 
            onClick={() => setIsCharModalOpen(true)} 
            className="flex-1 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-amber-400 font-bold text-xs uppercase shadow-sm tracking-widest hover:text-white hover:border-amber-400 hover:bg-amber-500/40 transition-all text-center drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            + CREAR NUEVO
          </button>
        </div>
      </div>

      <JoinCampaignModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        onJoin={handleJoinCampaign} 
        characters={characters} 
      />
      <AddCharacterModal 
        isOpen={isCharModalOpen} 
        onClose={() => setIsCharModalOpen(false)} 
        onAdd={(d) => api.post("/character", d).then((r) => { 
          setCharacters([...characters, r.data]); 
          setSelectedChar(r.data); 
        })} 
      />
    </div>
  );
}
