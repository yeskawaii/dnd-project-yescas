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
      <div className="min-h-screen bg-slate-950 px-4 pt-4 pb-24 uppercase font-sans">
        
        {/* HEADER STICKY */}
        <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 border-b border-slate-800/50 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedCampaign(null)} className="text-cyan-500 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform bg-cyan-500/10 px-3 py-2 rounded-xl">
              ← VOLVER
            </button>
            <button onClick={() => copyCode(selectedCampaign.inviteCode)} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl active:bg-slate-800 transition-colors">
              <span className="text-[8px] text-slate-500 font-black tracking-widest">CÓDIGO:</span>
              <span className="text-xs font-black text-orange-500 tracking-widest">{selectedCampaign.inviteCode}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={clearCombat}
              className="w-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-xl bg-slate-900 border border-slate-800 text-slate-500 active:scale-95 transition-all shadow-lg"
            >
              🔄
            </button>
            <button 
              onClick={() => setSortByInitiative(!sortByInitiative)}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all active:scale-95 shadow-lg ${sortByInitiative ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}
            >
              {sortByInitiative ? "⚔️ ORDENADO POR INICIATIVA" : "👥 ORDEN DE LISTA"}
            </button>
          </div>
        </div>

        <h2 className="text-white font-black text-2xl italic tracking-tighter mb-6 pl-2">{selectedCampaign.name}</h2>

        {/* LISTA ANIMADA DE JUGADORES */}
        <div className="flex flex-col gap-4">
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
                  className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl relative overflow-hidden flex flex-col"
                >
                  {sortByInitiative && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-purple-700 shadow-[0_0_15px_#a855f7]" />
                  )}
                  
                  {/* CABECERA DE TARJETA */}
                  <div className="flex justify-between items-start mb-4 ml-1">
                    <div className="flex items-center gap-3 w-2/3">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                        {p.class === "Hechicero" ? "🪄" : "⚔️"}
                      </div>
                      <div className="w-full">
                        {/* AQUÍ ESTÁ EL ARREGLO DEL NOMBRE */}
                        <h3 className="text-white font-black text-base md:text-lg leading-tight italic break-words pr-2">
                          {p.name}
                        </h3>
                        <p className="text-[9px] text-slate-500 font-bold tracking-widest mt-1">{p.class} • LVL {p.level}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-xl text-cyan-400 font-black text-[10px] shadow-sm mb-1">
                        CA: {p.armorClass?.armor + 10 + dexMod}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-lg">
                        👁️ PP: {passivePerception}
                      </div>
                    </div>
                  </div>

                  {/* CONTROLES DE COMBATE */}
                  <div className="flex gap-2">
                    {/* HP BLOCK */}
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 text-center flex-1 flex flex-col justify-center items-center shadow-inner">
                      <p className="text-[8px] text-slate-600 font-black mb-1 tracking-widest">VIDA</p>
                      <p className={`text-sm font-black ${(p.hp?.current / p.hp?.max) < 0.3 ? 'text-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-slate-200'}`}>
                        {p.hp?.current} <span className="text-[10px] text-slate-600">/ {p.hp?.max}</span>
                      </p>
                    </div>

                    {/* INICIATIVA BLOCK */}
                    <div className="bg-slate-950/80 p-2 rounded-2xl border border-purple-500/30 flex-[2] flex flex-col justify-center shadow-inner relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 text-4xl opacity-5">🎲</div>
                      
                      <div className="flex justify-between items-center w-full px-2">
                        <div className="flex flex-col items-center">
                          <p className="text-[7px] text-slate-500 font-black tracking-widest mb-1">TIRADA</p>
                          <input 
                            type="number" 
                            value={currentRoll} 
                            onChange={(e) => handleRollChange(p._id, e.target.value)}
                            placeholder="d20"
                            className="w-12 h-10 bg-slate-900 border-2 border-slate-700 rounded-xl text-center text-sm text-white font-black outline-none focus:border-purple-500 transition-colors shadow-lg"
                          />
                        </div>
                        
                        <div className="text-slate-600 font-black text-xs">+</div>

                        <div className="flex flex-col items-center">
                          <p className="text-[7px] text-slate-500 font-black tracking-widest mb-1">BONO</p>
                          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                            {initTotal}
                          </div>
                        </div>

                        <div className="text-slate-600 font-black text-xs">=</div>

                        <div className="flex flex-col items-center">
                          <p className="text-[7px] text-purple-400 font-black tracking-widest mb-1">TOTAL</p>
                          <div className="w-12 h-10 bg-purple-500/20 border border-purple-500/50 rounded-xl flex items-center justify-center text-purple-400 font-black text-lg shadow-[0_0_10px_rgba(168,85,247,0.2)]">
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
    <div className="min-h-screen bg-slate-950 p-6 uppercase font-sans">
      <button onClick={onBack} className="text-cyan-500 font-black text-[10px] mb-8 tracking-widest italic active:scale-95 transition-transform">← VOLVER AL LOBBY</button>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-white font-black text-3xl italic tracking-tighter">MIS CONTIENDAS</h1>
        <button onClick={() => setIsCreateOpen(true)} className="bg-orange-600 px-4 py-3 rounded-2xl text-white font-black text-[10px] active:scale-95 transition-all shadow-lg shadow-orange-900/40 tracking-widest">+ CREAR</button>
      </div>

      <div className="grid gap-4 max-w-md">
        {campaigns.map(c => (
          <div key={c._id} onClick={() => viewCampaign(c._id)} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl active:scale-[0.98] active:bg-slate-800 transition-all cursor-pointer relative group overflow-hidden shadow-lg flex justify-between items-center">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-orange-500 opacity-80" />
            <div className="pl-2">
              <h3 className="text-white font-black text-xl tracking-tight mb-1">{c.name}</h3>
              <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase flex items-center gap-1">
                CÓDIGO: <span className="bg-slate-950 px-2 py-0.5 rounded text-orange-400 border border-slate-800">{c.inviteCode}</span>
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-slate-600 font-black text-lg">
              →
            </div>
          </div>
        ))}
      </div>
      <AddCampaignModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onAdd={handleCreate} />
    </div>
  );
}