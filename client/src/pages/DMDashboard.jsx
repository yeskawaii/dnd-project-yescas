import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { toast } from "sonner";
import AddCampaignModal from "../components/AddCampaignModal";

export default function DMDashboard({ onBack }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // ESTADOS PARA COMBATE
  const [sortByInitiative, setSortByInitiative] = useState(false);
  const [rolls, setRolls] = useState({});

  useEffect(() => {
    api.get("/campaign/my-campaigns").then((res) => setCampaigns(res.data));
  }, []);

  const viewCampaign = (id) => {
    api.get(`/campaign/${id}/dashboard`).then((res) => {
      setSelectedCampaign(res.data.campaign);
      setPlayers(res.data.players);
      setRolls({});
    });
  };

  const handleCreate = (name) => {
    api.post("/campaign/create", { name }).then(res => {
      setCampaigns([...campaigns, res.data]);
      toast.success("Contienda creada");
    }).catch(() => toast.error("Error al crear"));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado al portapapeles");
  };

  const handleRollChange = (id, value) => {
    setRolls(prev => ({ ...prev, [id]: value === "" ? "" : Number(value) }));
  };

  const clearCombat = () => {
    setRolls({});
    setSortByInitiative(false);
    toast.success("Combate reiniciado");
  };

  const displayedPlayers = sortByInitiative 
    ? [...players].sort((a, b) => {
        const modA = Math.floor(((a.stats?.Destreza || 10) - 10) / 2) + (a.initiativeMisc || 0);
        const modB = Math.floor(((b.stats?.Destreza || 10) - 10) / 2) + (b.initiativeMisc || 0);
        const totalA = (rolls[a._id] || 0) + modA;
        const totalB = (rolls[b._id] || 0) + modB;
        return totalB - totalA; 
      })
    : players;

  if (selectedCampaign) {
    return (
      <div className="min-h-screen relative overflow-hidden px-4 pt-4 pb-24 font-sans">
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

        {/* HEADER STICKY */}
        <div className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl pb-4 pt-4 -mx-4 px-4 border-b border-white/10 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedCampaign(null)} className="text-amber-500 font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl hover:bg-amber-500/20">
              ← VOLVER
            </button>
            <button onClick={() => copyCode(selectedCampaign.inviteCode)} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl active:bg-white/10 hover:border-white/20 transition-all shadow-inner">
              <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">CÓDIGO:</span>
              <span className="text-xs font-bold text-amber-400 tracking-widest">{selectedCampaign.inviteCode}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={clearCombat}
              className="w-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-xl bg-white/5 border border-white/10 text-slate-400 active:scale-95 hover:bg-white/10 transition-all shadow-inner"
            >
              🔄
            </button>
            <button 
              onClick={() => setSortByInitiative(!sortByInitiative)}
              className={`flex-1 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border ${sortByInitiative ? 'bg-violet-600/20 text-violet-300 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'}`}
            >
              {sortByInitiative ? "⚔️ ORDENADO POR INICIATIVA" : "👥 ORDEN DE LISTA"}
            </button>
          </div>
        </div>

        <h2 className="text-amber-500 font-bold text-2xl tracking-wider mb-6 pl-2 uppercase">{selectedCampaign.name}</h2>

        {/* LISTA ANIMADA DE JUGADORES */}
        <div className="flex flex-col gap-4 relative z-10">
          <AnimatePresence>
            {displayedPlayers.map((p) => {
              const dexMod = Math.floor(((p.stats?.Destreza || 10) - 10) / 2);
              const wisMod = Math.floor(((p.stats?.Sabiduría || 10) - 10) / 2);
              const initTotal = dexMod + (p.initiativeMisc || 0);
              const passivePerception = 10 + wisMod;
              const currentRoll = rolls[p._id] !== undefined ? rolls[p._id] : "";
              const finalInitiative = (rolls[p._id] || 0) + initTotal;

              return (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  key={p._id} 
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden flex flex-col"
                >
                  {sortByInitiative && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-400 to-violet-700 shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                  )}
                  
                  {/* CABECERA DE TARJETA */}
                  <div className="flex justify-between items-start mb-4 ml-1">
                    <div className="flex items-center gap-3 w-2/3">
                      <div className="w-10 h-10 bg-black/30 border border-white/5 rounded-full flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                        {p.class === "Hechicero" ? "🪄" : "⚔️"}
                      </div>
                      <div className="w-full">
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight break-words pr-2">
                          {p.name}
                        </h3>
                        <p className="text-[9px] text-slate-400 font-semibold tracking-widest mt-1 uppercase">{p.class} • LVL {p.level}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-400 font-bold text-[10px] shadow-sm mb-1">
                        CA: {p.armorClass?.armor + 10 + dexMod}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-lg">
                        👁️ PP: {passivePerception}
                      </div>
                    </div>
                  </div>

                  {/* CONTROLES DE COMBATE */}
                  <div className="flex gap-2">
                    {/* HP BLOCK */}
                    <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center flex-1 flex flex-col justify-center items-center shadow-inner">
                      <p className="text-[8px] text-slate-500 font-bold mb-1 tracking-widest uppercase">VIDA</p>
                      <p className={`text-sm font-black tracking-wider ${(p.hp?.current / p.hp?.max) < 0.3 ? 'text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'text-slate-200'}`}>
                        {p.hp?.current} <span className="text-[10px] text-slate-500">/ {p.hp?.max}</span>
                      </p>
                    </div>

                    {/* INICIATIVA BLOCK */}
                    <div className="bg-black/40 p-2 rounded-2xl border border-violet-500/30 flex-[2] flex flex-col justify-center shadow-inner relative overflow-hidden">
                      <div className="absolute -right-2 -bottom-2 text-4xl opacity-10">🎲</div>
                      
                      <div className="flex justify-between items-center w-full px-2 relative z-10">
                        <div className="flex flex-col items-center">
                          <p className="text-[7px] text-slate-500 font-bold tracking-widest mb-1 uppercase">TIRADA</p>
                          <input 
                            type="number" 
                            value={currentRoll} 
                            onChange={(e) => handleRollChange(p._id, e.target.value)}
                            placeholder="d20"
                            className="w-12 h-10 bg-white/5 border border-white/10 rounded-xl text-center text-sm text-white font-black outline-none focus:border-violet-500/50 focus:bg-white/10 transition-colors shadow-inner"
                          />
                        </div>
                        
                        <div className="text-slate-500 font-black text-xs">+</div>

                        <div className="flex flex-col items-center">
                          <p className="text-[7px] text-slate-500 font-bold tracking-widest mb-1 uppercase">BONO</p>
                          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs shadow-inner">
                            {initTotal}
                          </div>
                        </div>

                        <div className="text-slate-500 font-black text-xs">=</div>

                        <div className="flex flex-col items-center">
                          <p className="text-[7px] text-violet-400 font-bold tracking-widest mb-1 uppercase">TOTAL</p>
                          <div className="w-12 h-10 bg-violet-500/20 border border-violet-500/50 rounded-xl flex items-center justify-center text-violet-300 font-black text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                            {finalInitiative}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // LOBBY DE CAMPAÑAS (MODO DM)
  return (
    <div className="min-h-screen p-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <button onClick={onBack} className="text-slate-400 font-bold text-[10px] mb-8 tracking-widest uppercase hover:text-white transition-colors relative z-10 flex items-center gap-1">
        ← VOLVER AL LOBBY
      </button>
      
      <div className="flex justify-between items-center mb-10 relative z-10">
        <h1 className="text-amber-500 font-bold text-4xl tracking-wider uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">Mis Contiendas</h1>
        <button onClick={() => setIsCreateOpen(true)} className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl text-amber-400 font-bold text-[10px] active:scale-95 transition-all shadow-lg hover:bg-amber-500/20 hover:border-amber-500/50 tracking-widest uppercase">
          + CREAR
        </button>
      </div>

      <div className="grid gap-4 max-w-md relative z-10">
        {campaigns.map(c => (
          <div key={c._id} onClick={() => viewCampaign(c._id)} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl active:scale-[0.98] hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer relative group overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex justify-between items-center">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <div className="pl-3">
              <h3 className="text-white font-bold text-2xl tracking-wide mb-2 group-hover:text-amber-400 transition-colors uppercase">{c.name}</h3>
              <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase flex items-center gap-2">
                CÓDIGO: <span className="bg-black/40 px-2 py-0.5 rounded-md text-amber-500 border border-white/5">{c.inviteCode}</span>
              </p>
            </div>
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400 font-bold text-lg group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors shadow-inner">
              →
            </div>
          </div>
        ))}
      </div>
      <AddCampaignModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onAdd={handleCreate} />
    </div>
  );
}