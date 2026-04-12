import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import AddCampaignModal from "../components/AddCampaignModal";

export default function DMDashboard({ onBack }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    api.get("/campaign/my-campaigns").then((res) => setCampaigns(res.data));
  }, []);

  const viewCampaign = (id) => {
    api.get(`/campaign/${id}/dashboard`).then((res) => {
      setSelectedCampaign(res.data.campaign);
      setPlayers(res.data.players);
    });
  };

  const handleCreate = (name) => {
    api.post("/campaign/create", { name })
      .then(res => {
        setCampaigns([...campaigns, res.data]);
        toast.success("Contienda creada");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Tronó el backend. Revisa la terminal de tu servidor.");
      });
  };

  if (selectedCampaign) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 uppercase font-sans">
        <button onClick={() => setSelectedCampaign(null)} className="text-cyan-500 font-black text-[10px] mb-6 block">← VOLVER A CONTIENDAS</button>
        <h2 className="text-white font-black text-2xl mb-1 italic">{selectedCampaign.name}</h2>
        <p className="text-slate-500 text-[10px] font-black mb-8 tracking-widest">CÓDIGO: <span className="text-orange-500">{selectedCampaign.inviteCode}</span></p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map(p => (
            <div key={p._id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-black text-sm">{p.name}</h3>
                  <p className="text-[9px] text-slate-500 font-bold">{p.class} LVL {p.level}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 px-2 py-1 rounded text-orange-500 font-black text-[10px]">CA: {p.armorClass?.armor + 10}</div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                  <p className="text-[7px] text-slate-600 font-black mb-1">HP</p>
                  <p className="text-xs font-black text-red-500">{p.hp?.current} / {p.hp?.max}</p>
                </div>
                <div className="flex-1 bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                  <p className="text-[7px] text-slate-600 font-black mb-1">INIC.</p>
                  <p className="text-xs font-black text-purple-500">+{p.initiativeMisc || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 uppercase font-sans">
      <button onClick={onBack} className="text-cyan-500 font-black text-[10px] mb-8">← VOLVER AL LOBBY</button>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-white font-black text-3xl italic tracking-tighter">MIS CONTIENDAS</h1>
        <button onClick={() => setIsCreateOpen(true)} className="bg-orange-600 p-3 rounded-xl text-white font-black text-[10px] active:scale-95 transition-all shadow-lg shadow-orange-900/20">+ CREAR NUEVA</button>
      </div>

      <div className="grid gap-4 max-w-md">
        {campaigns.map(c => (
          <div key={c._id} onClick={() => viewCampaign(c._id)} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl active:bg-slate-800 transition-colors cursor-pointer relative overflow-hidden">
            <h3 className="text-white font-black text-lg">{c.name}</h3>
            <p className="text-[9px] text-slate-500 font-bold tracking-widest mt-1 uppercase">CÓDIGO: {c.inviteCode}</p>
          </div>
        ))}
      </div>
      <AddCampaignModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onAdd={handleCreate} />
    </div>
  );
}