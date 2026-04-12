import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "./api/axios";
import { AuthContext } from "./context/AuthContext";
import { Toaster, toast } from "sonner";
import Login from "./pages/Login";

// PAGINAS
import Lobby from "./pages/Lobby";
import DMDashboard from "./pages/DMDashboard";

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
import SkillTable from "./components/SkillTable";
import CollapsibleSection from "./components/CollapsibleSection";
import AttackCard from "./components/AttackCard";
import AddAttackModal from "./components/AddAttackModal";
import FeatCard from "./components/FeatCard";
import AddFeatModal from "./components/AddFeatModal";
import AddSkillModal from "./components/AddSkillModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import TraitCard from "./components/TraitCard"; 
import AddTraitModal from "./components/AddTraitModal"; 
import JoinCampaignModal from "./components/JoinCampaignModal";

// --- UTILIDADES DE CONVERSIÓN ---
import { lbToKg, kgToLb, inToCm, cmToIn } from "./utils/conversions";

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [unitSystem, setUnitSystem] = useState("imp");
  const [spellSortBy, setSpellSortBy] = useState("level");
  const [mode, setMode] = useState("lobby"); 

  // ESTADOS MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false); 
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, title: "", msg: "", action: null });
  const [editingItem, setEditingItem] = useState(null);
  const [editingSpell, setEditingSpell] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, title: "", label: "", value: "", type: "", statName: null });

  const askDelete = (title, msg, action) => setDeleteAlert({ isOpen: true, title, msg, action });

  useEffect(() => {
    if (user) {
      api.get("/character")
        .then((res) => setCharacters(res.data.filter(Boolean)))
        .catch(() => toast.error("Error de conexión"));
    }
  }, [user]);

  // --- HANDLERS LÓGICA ---
  const handleUpdateCharacter = (updatedData) => {
    api.patch(`/character/${selectedChar._id}/update`, updatedData).then((res) => {
      setSelectedChar(res.data);
      setCharacters(prev => prev.map(c => c._id === res.data._id ? res.data : c));
      toast.success("Actualizado");
    }).catch(() => toast.error("Fallo DB"));
  };

  const handleJoinCampaign = (inviteCode, characterId) => {
    api.post("/campaign/join", { inviteCode, characterId }).then((res) => {
      toast.success(res.data.message);
      setCharacters(characters.map(c => c._id === characterId ? res.data.character : c));
    }).catch((err) => toast.error(err.response?.data?.message || "Error al unirse"));
  };

  const handleLeaveCampaign = (characterId) => {
    askDelete("Abandonar Contienda", "¿Quieres dejar esta partida?", () => {
      api.post("/campaign/leave", { characterId }).then((res) => {
        toast.success("Héroe liberado");
        setCharacters(characters.map(c => c._id === characterId ? { ...c, campaign: null } : c));
      }).catch(() => toast.error("Error al salir"));
    });
  };

  const handleFinalUpdate = (newValue) => {
    let updateData = {};
    const t = editModal.type;
    let valToSave = newValue;

    if (unitSystem === "metric") {
      if (["physicalWeight", "weightMax"].includes(t)) valToSave = Number(kgToLb(newValue));
      else if (t === "height") valToSave = Number(cmToIn(newValue));
    }

    switch (t) {
      case "name": updateData = { name: valToSave }; break;
      case "class": updateData = { class: valToSave }; break;
      case "race": case "alignment": case "deity": case "speed": updateData = { [t]: valToSave }; break;
      case "level": updateData = { level: Number(valToSave) }; break;
      case "init_misc": updateData = { initiativeMisc: Number(valToSave) }; break;
      case "stat": updateData = { stats: { ...selectedChar.stats, [editModal.statName]: Number(valToSave) } }; break;
      case "hp": updateData = { hp: { ...selectedChar.hp, current: Number(valToSave) } }; break;
      case "maxHp": updateData = { hp: { ...selectedChar.hp, max: Number(valToSave) } }; break;
      case "ca_armor": updateData = { armorClass: { ...selectedChar.armorClass, armor: Number(valToSave) } }; break;
      case "weightMax": updateData = { weight: { ...selectedChar.weight, max: Number(valToSave) } }; break;
      case "save_fort": case "save_ref": case "save_will":
        updateData = { saves: { ...selectedChar.saves, [t.split("_")[1]]: Number(valToSave) } };
        break;
      case "note":
        api.post(`/character/${selectedChar._id}/notes`, { title: "Diario", content: valToSave, color: "cyan" })
          .then((res) => setSelectedChar({ ...selectedChar, notes: [...(selectedChar.notes || []), res.data] }));
        setEditModal({ ...editModal, isOpen: false }); return;
    }
    handleUpdateCharacter(updateData);
    setEditModal({ ...editModal, isOpen: false });
  };

  const openEdit = (title, label, value, type, statName = null) => {
    let displayValue = value;
    if (unitSystem === "metric") {
      if (["physicalWeight", "weightMax"].includes(type)) displayValue = lbToKg(value);
      else if (type === "height") displayValue = inToCm(value);
    }
    setEditModal({ isOpen: true, title, label, value: displayValue, type, statName });
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-black animate-pulse uppercase">Cargando...</div>;
  if (!user) return <Login />;

  const dexMod = selectedChar ? Math.floor(((selectedChar.stats?.Destreza || 10) - 10) / 2) : 0;
  const totalWeight = selectedChar?.inventory?.reduce((acc, item) => acc + (item.weight || 0), 0) || 0;
  const totalCA = selectedChar ? (10 + (selectedChar.armorClass?.armor || 0) + dexMod) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans uppercase relative overflow-x-hidden">
      <Toaster position="top-center" richColors theme="dark" />

      {mode === "lobby" && <Lobby onSelectMode={(m) => setMode(m)} logout={logout} />}
      {mode === "dm" && <DMDashboard onBack={() => setMode("lobby")} />}

      {mode === "player" && (
        <>
          {!selectedChar ? (
            <div className="min-h-screen p-8 flex flex-col items-center">
              <div className="w-full max-w-sm mb-6">
                <button onClick={() => setMode("lobby")} className="text-cyan-500 font-black text-[10px] active:scale-95 italic">← VOLVER</button>
              </div>
              <h1 className="text-orange-500 font-black text-3xl mb-12 italic tracking-tighter">Aventureros</h1>
              <div className="grid gap-4 w-full max-w-sm">
                {characters.map((c) => (
                  <motion.div whileTap={{ scale: 0.95 }} key={c._id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between gap-3 shadow-lg">
                    <button onClick={() => setSelectedChar(c)} className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-white font-black uppercase text-lg truncate leading-none">{c.name}</h2>
                        {c.campaign && (
                          <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 rounded-sm pr-1">
                            <span className="text-orange-500 text-[7px] px-2 py-0.5 tracking-widest font-black">🗡️ {c.campaign.name || "..."}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleLeaveCampaign(c._id); }} className="text-orange-500/50 hover:text-orange-500 text-[8px] font-black px-1">✕</button>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold tracking-widest">{c.class} • LVL {c.level}</p>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); askDelete("Borrar", "¿Eliminar héroe?", () => api.delete(`/character/${c._id}`).then(() => setCharacters(characters.filter(char => char._id !== c._id)))); }} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl active:scale-90">🗑️</button>
                  </motion.div>
                ))}
                <button onClick={() => setIsJoinModalOpen(true)} className="w-full border-2 border-cyan-900/30 p-4 rounded-2xl text-cyan-600 font-black text-xs mt-4 active:bg-cyan-900/10 uppercase italic">🔗 UNIRSE A CONTIENDA</button>
                <button onClick={() => setIsCharModalOpen(true)} className="w-full border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-xs mt-2 active:bg-slate-900 uppercase">+ CREAR NUEVO</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col min-h-screen pb-24">
              <header className="px-6 py-4 pt-10 sticky top-0 z-50 bg-slate-950 border-b border-slate-800 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-xl shadow-inner">{selectedChar.class === "Hechicero" ? "🪄" : "⚔️"}</div>
                  <div>
                    <h1 onClick={() => openEdit("Renombrar", "NOMBRE", selectedChar.name, "name")} className="text-xl font-black text-white active:text-orange-500 italic tracking-tighter leading-none">{selectedChar.name} ✎</h1>
                    <p className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                      <span>{selectedChar.class} LVL {selectedChar.level}</span>
                      {selectedChar.campaign && <span className="bg-orange-500/10 border border-orange-500/30 text-orange-500 px-2 py-0.5 rounded-sm">🗡️ {selectedChar.campaign.name}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedChar(null)} className="w-8 h-8 bg-slate-900 rounded-xl text-slate-400 flex items-center justify-center text-xs active:scale-95">🔄</button>
                  <button onClick={logout} className="w-8 h-8 bg-red-950/30 text-red-500 rounded-xl flex items-center justify-center text-xs active:scale-95">🚪</button>
                </div>
              </header>

              <div className="max-w-5xl mx-auto w-full px-4 mt-6">
                <main>
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      
                      {activeTab === "stats" && (
                        <div className="space-y-4">
                          <HealthTracker currentHp={selectedChar.hp?.current} maxHp={selectedChar.hp?.max} onEditHp={() => openEdit("HP", "ACTUAL", selectedChar.hp.current, "hp")} onEditMax={() => openEdit("Max HP", "MÁXIMO", selectedChar.hp.max, "maxHp")} />
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
                            
                            <CollapsibleSection title="Biografía y Físico">
                              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                <button onClick={() => setUnitSystem(unitSystem === "imp" ? "metric" : "imp")} className="bg-orange-600/20 border border-orange-500/40 px-3 py-2 rounded-2xl text-[8px] font-black text-orange-500 flex-shrink-0 active:bg-orange-600/30 transition-colors">MODO: {unitSystem === "imp" ? "LB/FT" : "KG/CM"}</button>
                                {["race", "alignment", "deity"].map((f) => (
                                  <div key={f} onClick={() => openEdit(`Cambiar ${f}`, f.toUpperCase(), selectedChar[f], f)} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer active:bg-slate-800 transition-colors">
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">{f}</p>
                                    <p className="text-xs font-bold text-white tracking-tight">{selectedChar[f] || "---"}</p>
                                  </div>
                                ))}
                                <div onClick={() => openEdit("Altura", "ESTATURA", selectedChar.height, "height")} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer active:bg-slate-800 transition-colors">
                                  <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Altura</p>
                                  <p className="text-xs font-bold text-white tracking-tight">{unitSystem === "imp" ? `${selectedChar.height || 0}"` : `${inToCm(selectedChar.height || 0)} cm`}</p>
                                </div>
                              </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Combate" defaultOpen={true}>
                              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                                <div onClick={() => openEdit("Armadura", "EQUIPO", selectedChar.armorClass?.armor, "ca_armor")} className="bg-slate-900 border border-cyan-500/20 p-3 rounded-3xl active:bg-slate-800 transition-colors"><p className="text-[8px] font-black text-cyan-400 mb-1 tracking-widest">C. ARMADURA</p><span className="text-3xl font-black text-white">{totalCA}</span></div>
                                <div onClick={() => openEdit("BAB", "BASE", selectedChar.baseAttack, "bab")} className="bg-slate-900 border border-orange-500/20 p-3 rounded-3xl active:bg-slate-800"><p className="text-[8px] font-black text-orange-400 mb-1 tracking-widest">BAB</p><span className="text-2xl font-black text-white">+{selectedChar.baseAttack || 0}</span></div>
                                <div onClick={() => openEdit("Iniciativa", "MISC", selectedChar.initiativeMisc, "init_misc")} className="bg-slate-900 border border-purple-500/20 p-3 rounded-3xl active:bg-slate-800"><p className="text-[8px] font-black text-purple-400 mb-1 tracking-widest">INICIATIVA</p><span className="text-2xl font-black text-white">{dexMod + (selectedChar.initiativeMisc || 0) >= 0 ? "+" : ""}{dexMod + (selectedChar.initiativeMisc || 0)}</span></div>
                              </div>
                              <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-3"><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic tracking-widest">Armas</h3><button onClick={() => setIsAttackModalOpen(true)} className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded active:scale-95 tracking-tighter">+ AGREGAR</button></div>
                                <div className="space-y-2">{selectedChar.attacks?.length > 0 ? selectedChar.attacks.map((atk) => <AttackCard key={atk._id} attack={atk} character={selectedChar} onDelete={(id) => askDelete("Eliminar", "¿Seguro?", () => api.delete(`/character/${selectedChar._id}/attacks/${id}`).then(() => handleUpdateCharacter({ attacks: selectedChar.attacks.filter(a => a._id !== id) })))} />) : <p className="text-center text-[10px] text-slate-600 italic py-4">Sin armas.</p>}</div>
                              </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Habilidades (Skills)">
                              <SkillTable character={selectedChar} onUpdateSkill={(up) => handleUpdateCharacter({ skills: up })} onOpenAddModal={() => setIsSkillModalOpen(true)} />
                            </CollapsibleSection>

                            <CollapsibleSection title="Rasgos de Raza y Clase">
                              <div className="flex justify-between mb-2"><span className="text-[8px] font-black text-slate-500 uppercase italic">Innatas</span><button onClick={() => setIsTraitModalOpen(true)} className="text-[9px] font-black text-blue-500 active:scale-95 uppercase">+ AGREGAR</button></div>
                              {selectedChar.traits?.map(t => <TraitCard key={t._id} trait={t} onDelete={(id) => askDelete("Olvidar", "¿Seguro?", () => handleUpdateCharacter({ traits: selectedChar.traits.filter(x => x._id !== id) }))} />)}
                            </CollapsibleSection>
                          </div>
                        </div>
                      )}

                      {activeTab === "inv" && (
                        <div className="space-y-6">
                          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-2xl">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">🪙 Monedero</h3>
                            <div className="grid grid-cols-4 gap-2">
                              {["cp", "sp", "gp", "pp"].map(coin => (
                                <motion.div key={coin} whileTap={{ scale: 0.9 }} onClick={() => openEdit(coin.toUpperCase(), coin.toUpperCase(), selectedChar.money?.[coin], coin)} className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer active:bg-slate-900 transition-colors">
                                  <span className="text-[9px] font-black text-slate-500">{coin.toUpperCase()}</span>
                                  <span className="font-black text-white text-sm">{selectedChar.money?.[coin] || 0}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white mb-4 italic tracking-tighter">Mochila</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedChar.inventory?.map((i) => <InventoryItem key={i._id} item={i} onDelete={(id) => askDelete("Tirar", "¿Borrar?", () => handleUpdateCharacter({ inventory: selectedChar.inventory.filter(x => x._id !== id) }))} onEdit={() => { setEditingItem(i); setIsModalOpen(true); }} />)}
                            </div>
                            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-[10px] active:bg-slate-900 uppercase shadow-xl">+ AGREGAR OBJETO</button>
                          </div>
                        </div>
                      )}

                      {activeTab === "spells" && (
                        <div className="pb-10">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter">Grimorio</h2>
                            <button onClick={() => { setEditingSpell(null); setIsSpellModalOpen(true); }} className="bg-cyan-600 px-4 py-1.5 rounded-full text-[10px] font-black active:bg-cyan-500 shadow-lg shadow-cyan-900/30 active:scale-95">+ APRENDER</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedChar.spells?.sort((a,b) => a.level - b.level).map((s) => (
                              <SpellCard key={s._id} spell={s} onToggle={(id) => api.patch(`/character/${selectedChar._id}/spells/${id}`).then(r => handleUpdateCharacter({ spells: selectedChar.spells.map(x => x._id === id ? r.data : x) }))} onDelete={(id) => askDelete("Olvidar", "¿Borrar?", () => handleUpdateCharacter({ spells: selectedChar.spells.filter(x => x._id !== id) }))} onEdit={() => { setEditingSpell(s); setIsSpellModalOpen(true); }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "notes" && (
                        <div className="pb-10">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter">Diario</h2>
                            <button onClick={() => openEdit("Nota", "DIARIO", "", "note")} className="bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-black active:bg-slate-700 transition-all shadow-lg active:scale-95 uppercase">+ ESCRIBIR</button>
                          </div>
                          <div className="columns-1 md:columns-2 gap-4">
                            {selectedChar.notes?.map((n) => <NoteCard key={n._id} note={n} onDelete={(id) => askDelete("Quemar", "¿Borrar?", () => handleUpdateCharacter({ notes: selectedChar.notes.filter(x => x._id !== id) }))} onEdit={() => openEdit("Editar Nota", "DIARIO", n.content, "edit_note", n._id)} />)}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </main>
              </div>

              <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/95 backdrop-blur-md border border-white/10 px-6 py-3 flex justify-between items-center z-40 rounded-3xl shadow-2xl">
                {[{ id: "stats", icon: "⚔️", label: "Stats" }, { id: "inv", icon: "🎒", label: "Mochila" }, { id: "spells", icon: "🪄", label: "Spells" }, { id: "notes", icon: "📜", label: "Notas" }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex flex-col items-center transition-all ${activeTab === tab.id ? "text-cyan-400 scale-110" : "text-slate-500"}`}>
                    {activeTab === tab.id && <motion.div layoutId="mobile-glow" className="absolute -top-1 w-10 h-10 bg-cyan-500/20 blur-xl rounded-full" />}
                    <span className="text-xl z-10">{tab.icon}</span><span className="text-[8px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}

      {/* --- MODALES GLOBALES --- */}
      <ConfirmDeleteModal isOpen={deleteAlert.isOpen} title={deleteAlert.title} message={deleteAlert.msg} onClose={() => setDeleteAlert({ ...deleteAlert, isOpen: false })} onConfirm={() => { deleteAlert.action(); setDeleteAlert({ ...deleteAlert, isOpen: false }); }} />
      <JoinCampaignModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoinCampaign} characters={characters} />
      <UpdateValueModal isOpen={editModal.isOpen} title={editModal.title} label={editModal.label} initialValue={editModal.value} type={editModal.type} onClose={() => setEditModal({ ...editModal, isOpen: false })} onUpdate={handleFinalUpdate} />
      <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={(d) => api.post("/character", d).then((r) => { setCharacters([...characters, r.data]); setSelectedChar(r.data); mode === "lobby" && setMode("player"); })} />
      <AddTraitModal isOpen={isTraitModalOpen} onClose={() => setIsTraitModalOpen(false)} onAdd={(newTrait) => handleUpdateCharacter({ traits: [...(selectedChar.traits || []), newTrait] })} />
      <AddItemModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} onAdd={(i) => api.post(`/character/${selectedChar._id}/inventory`, i).then((r) => handleUpdateCharacter({ inventory: [...selectedChar.inventory, r.data] }))} onEdit={(id, data) => api.patch(`/character/${selectedChar._id}/inventory/${id}`, data).then((r) => handleUpdateCharacter({ inventory: selectedChar.inventory.map((i) => (i._id === id ? r.data : i)) }))} itemToEdit={editingItem} />
      <AddSpellModal isOpen={isSpellModalOpen} onClose={() => { setIsSpellModalOpen(false); setEditingSpell(null); }} onAdd={(s) => api.post(`/character/${selectedChar._id}/spells`, s).then((r) => handleUpdateCharacter({ spells: [...selectedChar.spells, r.data] }))} onEdit={(id, data) => api.patch(`/character/${selectedChar._id}/spells/${id}`, data).then((r) => handleUpdateCharacter({ spells: selectedChar.spells.map((s) => (s._id === id ? r.data : s)) }))} spellToEdit={editingSpell} />
      <AddAttackModal isOpen={isAttackModalOpen} onClose={() => setIsAttackModalOpen(false)} onAdd={(a) => api.post(`/character/${selectedChar._id}/attacks`, a).then((r) => handleUpdateCharacter({ attacks: [...(selectedChar.attacks || []), r.data] }))} />
      <AddFeatModal isOpen={isFeatModalOpen} onClose={() => setIsFeatModalOpen(false)} onAdd={(f) => api.post(`/character/${selectedChar._id}/feats`, f).then((r) => handleUpdateCharacter({ feats: [...(selectedChar.feats || []), r.data] }))} />
      <AddSkillModal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} onAdd={(newSkill) => handleUpdateCharacter({ skills: [...(selectedChar.skills || []), newSkill] })} />
    </div>
  );
}

export default App;