import { useEffect, useState, useContext } from "react";
import api from "./api/axios";
import { AuthContext } from "./context/AuthContext";
import { Toaster, toast } from "sonner";
import Login from "./pages/Login";

// COMPONENTES
import StatCard from "./components/StatCard";
import HealthTracker from "./components/HealthTracker";
import InventoryItem from "./components/InventoryItem";
import AddItemModal from "./components/AddItemModal";
import SpellCard from "./components/SpellCard";
import AddCharacterModal from "./components/AddCharacterModal";
import AddSpellModal from "./components/AddSpellModal";
import UpdateValueModal from "./components/UpdateValueModal";
import NoteCard from "./components/NoteCard";

// --- FUNCIONES DE CONVERSIÓN (FUERA DEL COMPONENTE) ---
const lbToKg = (lb) => (lb * 0.453592).toFixed(1);
const inToCm = (inches) => (inches * 2.54).toFixed(0);

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  
  // ESTADO PARA EL SISTEMA DE UNIDADES (imp = Imperial, metric = Métrico)
  const [unitSystem, setUnitSystem] = useState("imp");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);

  const [editModal, setEditModal] = useState({
    isOpen: false, title: "", label: "", value: "", type: "", statName: null,
  });

  useEffect(() => {
    if (user) {
      api.get("/character").then((res) => {
        setCharacters(res.data);
        if (res.data.length === 1) setSelectedChar(res.data[0]);
      }).catch(() => toast.error("Error al conectar con el grimorio"));
    }
  }, [user]);

  const handleUpdateCharacter = (updatedData) => {
    api.patch(`/character/${selectedChar._id}/update`, updatedData)
      .then((res) => {
        setSelectedChar(res.data);
        toast.success("Héroe actualizado");
      })
      .catch(() => toast.error("Fallo en la tirada (Error DB)"));
  };

  const openEdit = (title, label, value, type, statName = null) => {
    setEditModal({ isOpen: true, title, label, value, type, statName });
  };

  // --- EL CEREBRO DE GUARDADO (ACTUALIZADO) ---
  const handleFinalUpdate = (newValue) => {
    let updateData = {};
    const t = editModal.type;

    if (['race', 'alignment', 'deity', 'speed'].includes(t)) {
      updateData = { [t]: newValue };
    } 
    else if (t === 'level') { updateData = { level: Number(newValue) }; }
    else if (t === 'experience') { updateData = { experience: Number(newValue) }; }
    else if (t === 'physicalWeight') { updateData = { physicalWeight: Number(newValue) }; }
    else if (t === 'height') { updateData = { height: Number(newValue) }; }
    else if (t === 'bab') { updateData = { baseAttack: Number(newValue) }; }
    else if (t === 'init_misc') { updateData = { initiativeMisc: Number(newValue) }; }
    else if (t === 'stat') {
      updateData = { stats: { ...selectedChar.stats, [editModal.statName]: Number(newValue) } };
    }
    else if (t === 'hp') {
      updateData = { hp: { ...selectedChar.hp, current: Number(newValue) } };
    }
    else if (t === 'maxHp') {
      updateData = { hp: { ...selectedChar.hp, max: Number(newValue) } };
    }
    else if (t === 'ca_armor') {
      updateData = { armorClass: { ...selectedChar.armorClass, armor: Number(newValue) } };
    }
    else if (t === 'weightMax') {
      updateData = { weight: { ...selectedChar.weight, max: Number(newValue) } };
    }
    else if (t.startsWith('save_')) {
      const sName = t.split('_')[1];
      updateData = { saves: { ...selectedChar.saves, [sName]: Number(newValue) } };
    }
    else if (t === 'note') {
      api.post(`/character/${selectedChar._id}/notes`, { title: "Diario", content: newValue, color: "cyan" })
        .then((res) => setSelectedChar({ ...selectedChar, notes: [...(selectedChar.notes || []), res.data] }));
      setEditModal({ ...editModal, isOpen: false });
      return;
    }

    handleUpdateCharacter(updateData);
    setEditModal({ ...editModal, isOpen: false });
  };

  // HANDLERS LISTAS
  const handleAddItem = (i) => api.post(`/character/${selectedChar._id}/inventory`, i).then(r => setSelectedChar({...selectedChar, inventory: [...selectedChar.inventory, r.data]}));
  const handleDeleteItem = (id) => api.delete(`/character/${selectedChar._id}/inventory/${id}`).then(() => setSelectedChar({...selectedChar, inventory: selectedChar.inventory.filter(i => i._id !== id)}));
  const handleAddSpell = (s) => api.post(`/character/${selectedChar._id}/spells`, s).then(r => setSelectedChar({...selectedChar, spells: [...selectedChar.spells, r.data]}));
  const handleToggleSpell = (id) => api.patch(`/character/${selectedChar._id}/spells/${id}`).then(r => setSelectedChar({...selectedChar, spells: selectedChar.spells.map(s => s._id === id ? r.data : s)}));
  const handleDeleteSpell = (id) => api.delete(`/character/${selectedChar._id}/spells/${id}`).then(() => setSelectedChar({...selectedChar, spells: selectedChar.spells.filter(s => s._id !== id)}));
  const handleDeleteNote = (id) => api.delete(`/character/${selectedChar._id}/notes/${id}`).then(() => setSelectedChar({...selectedChar, notes: selectedChar.notes.filter(n => n._id !== id)}));
  const handleCreateCharacter = (d) => api.post("/character", d).then(r => { setCharacters([...characters, r.data]); setSelectedChar(r.data); });

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-black">CARGANDO...</div>;
  if (!user) return <Login />;

  if (!selectedChar) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
        <Toaster position="top-center" richColors theme="dark" />
        <h1 className="text-orange-500 font-black text-3xl mb-12 italic uppercase tracking-tighter">Aventureros</h1>
        <div className="grid gap-4 w-full max-w-sm">
          {characters.map((c) => (
            <div key={c._id} className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
              <button onClick={() => setSelectedChar(c)} className="w-full text-left">
                <h2 className="text-white font-black uppercase text-lg">{c.name}</h2>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{c.class} • LVL {c.level}</p>
              </button>
            </div>
          ))}
          <button onClick={() => setIsCharModalOpen(true)} className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-slate-600 font-black text-xs mt-4 uppercase">+ CREAR</button>
        </div>
        <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={handleCreateCharacter} />
      </div>
    );
  }

  // CÁLCULOS
  const dexMod = Math.floor(((selectedChar.stats?.Destreza || 10) - 10) / 2);
  const totalWeight = selectedChar.inventory?.reduce((acc, item) => acc + (item.weight || 0), 0);
  const totalCA = 10 + (selectedChar.armorClass?.armor || 0) + dexMod;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-cyan-500/30 uppercase">
      <Toaster position="top-center" richColors theme="dark" />

      {/* HEADER: NOMBRE, CLASE Y XP */}
      <header className="p-6 pt-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-end">
        <div>
          <button onClick={() => setSelectedChar(null)} className="text-[9px] font-black text-slate-500 mb-2">← CAMBIAR</button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-orange-500 leading-none">{selectedChar.name}</h1>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[8px] font-black text-slate-400 italic tracking-tighter">{selectedChar.class}</span>
          </div>
          <div className="flex gap-3 mt-2">
            <p onClick={() => openEdit("Nivel", "NIVEL ACTUAL", selectedChar.level, 'level')} className="text-[9px] font-black text-slate-500 cursor-pointer">LVL {selectedChar.level} ✎</p>
            <p onClick={() => openEdit("Experiencia", "XP TOTAL", selectedChar.experience || 0, 'experience')} className="text-[9px] font-black text-cyan-600 cursor-pointer">XP {selectedChar.experience || 0} ✎</p>
          </div>
        </div>
        <button onClick={logout} className="text-[9px] bg-slate-800 px-3 py-2 rounded-xl text-slate-500 font-black">Salir</button>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === "stats" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* BIO BAR: RAZA, DIOS, PESO, ESTATURA Y SWITCH DE UNIDADES */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {/* BOTÓN DE CONVERSIÓN */}
              <button 
                onClick={() => setUnitSystem(unitSystem === "imp" ? "metric" : "imp")}
                className="bg-orange-600/20 border border-orange-500/40 px-3 py-2 rounded-2xl text-[8px] font-black text-orange-500 flex-shrink-0"
              >
                UNIDADES: {unitSystem === "imp" ? "LB/FT" : "KG/CM"}
              </button>

              <div onClick={() => openEdit("Raza", "RAZA", selectedChar.race, 'race')} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer">
                <p className="text-[7px] font-black text-slate-600 uppercase italic">Raza</p>
                <p className="text-xs font-bold text-white">{selectedChar.race || "---"}</p>
              </div>

              <div onClick={() => openEdit("Estatura", "PULGADAS TOTALES", selectedChar.height, 'height')} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer">
                <p className="text-[7px] font-black text-slate-600 uppercase italic">Altura</p>
                <p className="text-xs font-bold text-white">
                  {unitSystem === "imp" ? `${selectedChar.height || 0}"` : `${inToCm(selectedChar.height || 0)} cm`}
                </p>
              </div>

              <div onClick={() => openEdit("Peso Corporal", "LBS", selectedChar.physicalWeight, 'physicalWeight')} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer">
                <p className="text-[7px] font-black text-slate-600 uppercase italic">Peso Pers.</p>
                <p className="text-xs font-bold text-orange-400">
                   {unitSystem === "imp" ? `${selectedChar.physicalWeight || 0} lb` : `${lbToKg(selectedChar.physicalWeight || 0)} kg`}
                </p>
              </div>
            </div>

            <HealthTracker
              currentHp={selectedChar.hp?.current || 0}
              maxHp={selectedChar.hp?.max || 0}
              onEditHp={() => openEdit("HP", "HP ACTUAL", selectedChar.hp.current, "hp")}
              onEditMax={() => openEdit("Max HP", "HP MÁXIMO", selectedChar.hp.max, "maxHp")}
            />

            {/* COMBATE DESGLOSADO */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div onClick={() => openEdit("Armadura", "EQUIPO", selectedChar.armorClass?.armor, 'ca_armor')} className="bg-slate-900 border border-cyan-500/20 p-3 rounded-3xl text-center shadow-lg cursor-pointer">
                <p className="text-[8px] font-black text-cyan-400 mb-1 tracking-tighter">C. ARMADURA</p>
                <span className="text-3xl font-black text-white">{totalCA}</span>
                <div className="flex items-center justify-center gap-1 mt-1 opacity-60">
                   <span className="text-[7px] font-bold">10</span>
                   <span className="text-[7px] text-slate-600">+</span>
                   <span className="text-[7px] font-bold text-cyan-500">{selectedChar.armorClass?.armor || 0}</span>
                   <span className="text-[7px] text-slate-600">+</span>
                   <span className="text-[7px] font-bold text-orange-500">{dexMod}</span>
                </div>
              </div>

              <div onClick={() => openEdit("Ataque Base", "BAB", selectedChar.baseAttack, 'bab')} className="bg-slate-900 border border-orange-500/20 p-3 rounded-3xl text-center shadow-lg cursor-pointer flex flex-col justify-center">
                <p className="text-[8px] font-black text-orange-400 mb-1 tracking-tighter italic">BAB</p>
                <span className="text-2xl font-black text-white">+{selectedChar.baseAttack || 0}</span>
              </div>

              <div onClick={() => openEdit("Iniciativa", "MISC", selectedChar.initiativeMisc, 'init_misc')} className="bg-slate-900 border border-purple-500/20 p-3 rounded-3xl text-center shadow-lg cursor-pointer">
                <p className="text-[8px] font-black text-purple-400 mb-1 tracking-tighter">INICIATIVA</p>
                <span className="text-2xl font-black text-white">{(dexMod + (selectedChar.initiativeMisc || 0)) >= 0 ? '+' : ''}{dexMod + (selectedChar.initiativeMisc || 0)}</span>
                <p className="text-[7px] font-bold text-slate-500 mt-1 uppercase">DEX {dexMod} + MISC {selectedChar.initiativeMisc || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 justify-items-center mt-10 italic">
              {Object.entries(selectedChar.stats || {}).map(([stat, val]) => (
                <StatCard key={stat} label={stat} value={val} onClick={() => openEdit(`Ajustar ${stat}`, "VALOR", val, "stat", stat)} />
              ))}
            </div>

            {/* CARGA INVENTARIO */}
            <div className="mt-12 px-2">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase italic">Carga Mochila</span>
                <span onClick={() => openEdit("Carga Max", "LBS MAX", selectedChar.weight?.max, 'weightMax')} className="text-[10px] font-black text-white cursor-pointer tracking-tighter">
                  {unitSystem === "imp" ? `${totalWeight} / ${selectedChar.weight?.max || 100} LB` : `${lbToKg(totalWeight)} / ${lbToKg(selectedChar.weight?.max || 100)} KG`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${Math.min((totalWeight / (selectedChar.weight?.max || 100)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* --- PESTAÑAS SECUNDARIAS --- */}
        {activeTab === "inv" && (
          <div className="animate-in fade-in slide-in-from-right-4"><h2 className="text-2xl font-black text-white mb-6 italic tracking-tighter">Mochila</h2>
          <div className="space-y-1">{selectedChar.inventory?.map(i => <InventoryItem key={i._id} item={i} onDelete={handleDeleteItem} />)}</div>
          <button onClick={() => setIsModalOpen(true)} className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-[10px] uppercase">+ AGREGAR</button></div>
        )}

        {activeTab === "spells" && (
          <div className="animate-in fade-in slide-in-from-right-4"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-white italic tracking-tighter">Grimorio</h2>
          <button onClick={() => setIsSpellModalOpen(true)} className="bg-cyan-600 px-4 py-1 rounded-full text-[10px] font-black">+ APRENDER</button></div>
          <div className="space-y-2 pb-10">{selectedChar.spells?.map(s => <SpellCard key={s._id} spell={s} onToggle={handleToggleSpell} onDelete={handleDeleteSpell} />)}</div></div>
        )}

        {activeTab === "notes" && (
          <div className="animate-in fade-in slide-in-from-right-4"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-white italic tracking-tighter">Diario</h2>
          <button onClick={() => openEdit("Nota", "DIARIO", "", "note")} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">+ ESCRIBIR</button></div>
          <div className="grid gap-4 pb-10">{selectedChar.notes?.map(n => <NoteCard key={n._id} note={n} onDelete={handleDeleteNote} />)}</div></div>
        )}
      </main>

      <UpdateValueModal isOpen={editModal.isOpen} title={editModal.title} label={editModal.label} initialValue={editModal.value} type={editModal.type} onClose={() => setEditModal({ ...editModal, isOpen: false })} onUpdate={handleFinalUpdate} />
      <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={handleCreateCharacter} />
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />
      <AddSpellModal isOpen={isSpellModalOpen} onClose={() => setIsSpellModalOpen(false)} onAdd={handleAddSpell} />

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-8 py-4 flex justify-between items-center z-40">
        {[
          { id: "stats", icon: "⚔️", label: "Stats" },
          { id: "inv", icon: "🎒", label: "Inv" },
          { id: "spells", icon: "🪄", label: "Spells" },
          { id: "notes", icon: "📜", label: "Notas" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center transition-all ${activeTab === tab.id ? "text-cyan-400 scale-110" : "text-slate-600 opacity-60"}`}>
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;