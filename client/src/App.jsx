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
      api.get("/character").then((res) => setCharacters(res.data)).catch(() => toast.error("Error de conexión"));
    }
  }, [user]);

  // --- LOGICA DE ACTUALIZACIÓN ---
  const handleUpdateCharacter = (updatedData) => {
    api.patch(`/character/${selectedChar._id}/update`, updatedData).then((res) => {
      setSelectedChar(res.data);
      toast.success("Héroe actualizado");
    }).catch(() => toast.error("Fallo en la DB"));
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
      case "bab": updateData = { baseAttack: Number(valToSave) }; break;
      case "init_misc": updateData = { initiativeMisc: Number(valToSave) }; break;
      case "stat": updateData = { stats: { ...selectedChar.stats, [editModal.statName]: Number(valToSave) } }; break;
      case "hp": updateData = { hp: { ...selectedChar.hp, current: Number(valToSave) } }; break;
      case "maxHp": updateData = { hp: { ...selectedChar.hp, max: Number(valToSave) } }; break;
      case "ca_armor": updateData = { armorClass: { ...selectedChar.armorClass, armor: Number(valToSave) } }; break;
      case "weightMax": updateData = { weight: { ...selectedChar.weight, max: Number(valToSave) } }; break;
      case "save_fort": case "save_ref": case "save_will":
        const sName = t.split("_")[1];
        updateData = { saves: { ...selectedChar.saves, [sName]: Number(valToSave) } };
        break;
      case "cp": updateData = { money: { ...selectedChar.money, cp: Number(valToSave) } }; break;
      case "sp": updateData = { money: { ...selectedChar.money, sp: Number(valToSave) } }; break;
      case "gp": updateData = { money: { ...selectedChar.money, gp: Number(valToSave) } }; break;
      case "pp": updateData = { money: { ...selectedChar.money, pp: Number(valToSave) } }; break;
      case "note":
        api.post(`/character/${selectedChar._id}/notes`, { title: "Diario", content: valToSave, color: "cyan" })
          .then((res) => setSelectedChar({ ...selectedChar, notes: [...(selectedChar.notes || []), res.data] }));
        setEditModal({ ...editModal, isOpen: false }); return;
      case "edit_note":
        api.patch(`/character/${selectedChar._id}/notes/${editModal.statName}`, { content: valToSave })
          .then((res) => setSelectedChar({ ...selectedChar, notes: selectedChar.notes.map((n) => n._id === editModal.statName ? res.data : n) }));
        setEditModal({ ...editModal, isOpen: false }); return;
    }
    handleUpdateCharacter(updateData);
    setEditModal({ ...editModal, isOpen: false });
  };

  const handleJoinCampaign = (inviteCode, characterId) => {
    api.post("/campaign/join", { inviteCode, characterId }).then((res) => {
      toast.success(res.data.message);
      setCharacters(characters.map(c => c._id === characterId ? { ...c, campaign: res.data.campaign._id } : c));
    }).catch((err) => toast.error(err.response?.data?.message || "Error al unirse"));
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

      {/* 1. LOBBY */}
      {mode === "lobby" && <Lobby onSelectMode={(m) => setMode(m)} logout={logout} />}

      {/* 2. DM DASHBOARD */}
      {mode === "dm" && <DMDashboard onBack={() => setMode("lobby")} />}

      {/* 3. MODO JUGADOR */}
      {mode === "player" && (
        <>
          {!selectedChar ? (
            /* SELECTOR DE PERSONAJES */
            <div className="min-h-screen p-8 flex flex-col items-center">
              <div className="w-full max-w-sm mb-6">
                <button onClick={() => setMode("lobby")} className="text-cyan-500 font-black text-[10px] active:scale-95 transition-transform tracking-widest">← VOLVER AL LOBBY</button>
              </div>
              <h1 className="text-orange-500 font-black text-3xl mb-12 italic tracking-tighter">Aventureros</h1>
              <div className="grid gap-4 w-full max-w-sm">
                {characters.map((c) => (
                  <motion.div whileTap={{ scale: 0.95 }} key={c._id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between gap-3 shadow-lg">
                    <button onClick={() => setSelectedChar(c)} className="flex-1 text-left overflow-hidden">
                      <h2 className="text-white font-black uppercase text-lg truncate">{c.name}</h2>
                      <p className="text-slate-500 text-[10px] font-bold mt-1 tracking-widest">{c.class} • LVL {c.level}</p>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); askDelete("Borrar Personaje", "¿Matar a este héroe?", () => api.delete(`/character/${c._id}`).then(() => setCharacters(characters.filter(char => char._id !== c._id)))); }} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl active:scale-90 transition-all">🗑️</button>
                  </motion.div>
                ))}
                <button onClick={() => setIsJoinModalOpen(true)} className="w-full border-2 border-cyan-900/30 p-4 rounded-2xl text-cyan-600 font-black text-xs mt-4 active:bg-cyan-900/10 transition-colors uppercase italic tracking-widest">🔗 UNIRSE A CONTIENDA</button>
                <button onClick={() => setIsCharModalOpen(true)} className="w-full border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-xs mt-2 active:bg-slate-900 transition-colors uppercase tracking-widest">+ CREAR NUEVO</button>
              </div>
            </div>
          ) : (
            /* HOJA DE PERSONAJE SELECCIONADO */
            <div className="flex flex-col min-h-screen pb-24">
              <header className="px-6 py-4 pt-10 sticky top-0 z-50 bg-slate-950 border-b border-slate-800 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-xl">{selectedChar.class === "Hechicero" ? "🪄" : "⚔️"}</div>
                  <div>
                    <h1 onClick={() => openEdit("Renombrar", "NOMBRE", selectedChar.name, "name")} className="text-xl font-black text-white active:text-orange-500 italic tracking-tighter leading-none">{selectedChar.name} ✎</h1>
                    <p className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest">{selectedChar.class} LVL {selectedChar.level}</p>
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
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      
                      {/* PESTAÑA: STATS */}
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
                                <div onClick={() => openEdit("Peso", "SIN EQUIPO", selectedChar.physicalWeight, "physicalWeight")} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer active:bg-slate-800 transition-colors">
                                  <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">Peso</p>
                                  <p className="text-xs font-bold text-orange-400 tracking-tight">{unitSystem === "imp" ? `${selectedChar.physicalWeight || 0} lb` : `${lbToKg(selectedChar.physicalWeight || 0)} kg`}</p>
                                </div>
                              </div>
                            </CollapsibleSection>
                            
                            <CollapsibleSection title="Combate" defaultOpen={true}>
                              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                                <div onClick={() => openEdit("Armadura", "EQUIPO", selectedChar.armorClass?.armor, "ca_armor")} className="bg-slate-900 border border-cyan-500/20 p-3 rounded-3xl active:bg-slate-800 transition-colors"><p className="text-[8px] font-black text-cyan-400 mb-1 tracking-widest">C. ARMADURA</p><span className="text-3xl font-black text-white">{totalCA}</span></div>
                                <div onClick={() => openEdit("BAB", "BASE", selectedChar.baseAttack, "bab")} className="bg-slate-900 border border-orange-500/20 p-3 rounded-3xl active:bg-slate-800"><p className="text-[8px] font-black text-orange-400 mb-1 tracking-widest">BAB</p><span className="text-2xl font-black text-white">+{selectedChar.baseAttack || 0}</span></div>
                                <div onClick={() => openEdit("Iniciativa", "MISC", selectedChar.initiativeMisc, "init_misc")} className="bg-slate-900 border border-purple-500/20 p-3 rounded-3xl active:bg-slate-800"><p className="text-[8px] font-black text-purple-400 mb-1 tracking-widest">INICIATIVA</p><span className="text-2xl font-black text-white">{dexMod + (selectedChar.initiativeMisc || 0) >= 0 ? "+" : ""}{dexMod + (selectedChar.initiativeMisc || 0)}</span></div>
                              </div>
                              <div className="flex gap-2">
                                {["fort", "ref", "will"].map((s) => (
                                  <div key={s} onClick={() => openEdit(`Salvación ${s}`, s.toUpperCase(), selectedChar.saves?.[s], `save_${s}`)} className="flex-1 bg-slate-900/80 p-3 rounded-3xl border border-slate-800 text-center cursor-pointer active:bg-slate-800 transition-colors">
                                    <span className="text-[7px] block font-black text-slate-600 mb-1">{s.toUpperCase()}</span>
                                    <span className={`font-black text-sm ${s === "fort" ? "text-red-400" : s === "ref" ? "text-blue-400" : "text-purple-400"}`}>+{selectedChar.saves?.[s] || 0}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-3"><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Armas Equipadas</h3><button onClick={() => setIsAttackModalOpen(true)} className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded active:scale-95 transition-transform">+ AGREGAR</button></div>
                                <div className="space-y-2">{selectedChar.attacks?.length > 0 ? selectedChar.attacks.map((atk) => <AttackCard key={atk._id} attack={atk} character={selectedChar} onDelete={(id) => askDelete("Destruir Arma", "¿Seguro?", () => api.delete(`/character/${selectedChar._id}/attacks/${id}`).then(() => {const up = selectedChar.attacks.filter(a => a._id !== id); handleUpdateCharacter({ attacks: up });}))} />) : <p className="text-center text-[10px] text-slate-600 italic py-4 italic">Sin armas registradas.</p>}</div>
                              </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Atributos">
                               <div className="grid grid-cols-2 gap-4 mt-4">
                                 {Object.entries(selectedChar.stats || {}).map(([stat, val]) => (
                                   <StatCard key={stat} label={stat} value={val} onClick={() => openEdit(`Ajustar ${stat}`, "VALOR", val, "stat", stat)} />
                                 ))}
                               </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Habilidades (Skills)">
                              <div className="mt-2 md:max-h-[500px] md:overflow-y-auto pr-1 custom-scrollbar">
                                <SkillTable character={selectedChar} onUpdateSkill={(newSkillsArray) => handleUpdateCharacter({ skills: newSkillsArray })} onOpenAddModal={() => setIsSkillModalOpen(true)} />
                              </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Rasgos de Raza y Clase">
                              <div className="flex justify-between mb-2"><span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Innatas</span><button onClick={() => setIsTraitModalOpen(true)} className="text-[9px] font-black text-blue-500 active:scale-95 uppercase tracking-widest">+ AGREGAR</button></div>
                              {selectedChar.traits?.length > 0 ? selectedChar.traits.map(t => <TraitCard key={t._id} trait={t} onDelete={(id) => askDelete("Olvidar Rasgo", "¿Eliminarlo?", () => { const up = selectedChar.traits.filter(x => x._id !== id); handleUpdateCharacter({ traits: up }); })} />) : <p className="text-center text-[10px] text-slate-600 italic py-4">No tienes rasgos aún.</p>}
                            </CollapsibleSection>

                            <CollapsibleSection title="Dotes (Feats)">
                              <div className="flex justify-between mb-2"><span className="text-[8px] font-black text-slate-500 uppercase italic tracking-widest">Logros de nivel</span><button onClick={() => setIsFeatModalOpen(true)} className="text-[9px] font-black text-emerald-500 active:scale-95 uppercase tracking-widest">+ AGREGAR</button></div>
                              {selectedChar.feats?.length > 0 ? selectedChar.feats.map(f => <FeatCard key={f._id} feat={f} onDelete={(id) => askDelete("Olvidar Dote", "¿Eliminarlo?", () => api.delete(`/character/${selectedChar._id}/feats/${id}`).then(() => { const up = selectedChar.feats.filter(x => x._id !== id); handleUpdateCharacter({ feats: up }); }))} />) : <p className="text-center text-[10px] text-slate-600 italic py-4">Sin dotes registradas.</p>}
                            </CollapsibleSection>
                          </div>
                          
                          <div className="mt-8 px-2">
                            <div className="flex justify-between items-end mb-2"><span className="text-[8px] font-black text-slate-600 tracking-widest uppercase italic">Mochila ({totalWeight} lb)</span><span onClick={() => openEdit("Máximo", "CARGA MAX", selectedChar.weight?.max, "weightMax")} className="text-[10px] font-black text-white active:text-cyan-400">MAX: {selectedChar.weight?.max || 100} LB</span></div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden"><div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${Math.min((totalWeight / (selectedChar.weight?.max || 100)) * 100, 100)}%` }} /></div>
                          </div>
                        </div>
                      )}

                      {/* PESTAÑA: INVENTARIO */}
                      {activeTab === "inv" && (
                        <div className="space-y-6">
                          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 relative overflow-hidden">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">🪙 Monedero</h3>
                            <div className="grid grid-cols-4 gap-2">
                              <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Cobre", "PC", selectedChar.money?.cp, "cp")} className="bg-slate-950 border border-[#b87333]/30 rounded-2xl p-2 flex flex-col items-center justify-center active:bg-slate-900 transition-colors cursor-pointer"><span className="text-[9px] font-black text-[#b87333]">PC</span><span className="font-black text-white text-sm">{selectedChar.money?.cp || 0}</span></motion.div>
                              <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Plata", "PP", selectedChar.money?.sp, "sp")} className="bg-slate-950 border border-slate-400/30 rounded-2xl p-2 flex flex-col items-center justify-center active:bg-slate-900 transition-colors cursor-pointer"><span className="text-[9px] font-black text-slate-400">PP</span><span className="font-black text-white text-sm">{selectedChar.money?.sp || 0}</span></motion.div>
                              <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Oro", "PO", selectedChar.money?.gp, "gp")} className="bg-slate-950 border border-yellow-500/40 rounded-2xl p-2 flex flex-col items-center justify-center active:bg-slate-900 transition-colors cursor-pointer"><span className="text-[9px] font-black text-yellow-500">PO</span><span className="font-black text-white text-sm">{selectedChar.money?.gp || 0}</span></motion.div>
                              <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Platino", "PPT", selectedChar.money?.pp, "pp")} className="bg-slate-950 border border-cyan-400/40 rounded-2xl p-2 flex flex-col items-center justify-center active:bg-slate-900 transition-colors cursor-pointer"><span className="text-[9px] font-black text-cyan-400">PPT</span><span className="font-black text-white text-sm">{selectedChar.money?.pp || 0}</span></motion.div>
                            </div>
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white mb-4 italic tracking-tighter">Mochila</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedChar.inventory?.map((i) => <InventoryItem key={i._id} item={i} onDelete={(id) => askDelete("Tirar Objeto", "¿Seguro?", () => api.delete(`/character/${selectedChar._id}/inventory/${id}`).then(() => { const up = selectedChar.inventory.filter(x => x._id !== id); handleUpdateCharacter({ inventory: up }); }))} onEdit={() => { setEditingItem(i); setIsModalOpen(true); }} />)}
                            </div>
                            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-[10px] active:bg-slate-900 active:text-white transition-colors uppercase">+ AGREGAR OBJETO</button>
                          </div>
                        </div>
                      )}

                      {/* PESTAÑA: HECHIZOS */}
                      {activeTab === "spells" && (
                        <div>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter">Grimorio</h2>
                            <button onClick={() => { setEditingSpell(null); setIsSpellModalOpen(true); }} className="bg-cyan-600 px-4 py-1.5 rounded-full text-[10px] font-black active:bg-cyan-500 transition-colors shadow-lg active:scale-95">+ APRENDER</button>
                          </div>
                          <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 w-max mb-6">
                            <button onClick={() => setSpellSortBy("level")} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-md transition-colors ${spellSortBy === "level" ? "bg-cyan-600/20 text-cyan-500" : "text-slate-500 active:text-white"}`}>Nivel</button>
                            <button onClick={() => setSpellSortBy("alpha")} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-md transition-colors ${spellSortBy === "alpha" ? "bg-slate-800 text-white" : "text-slate-500 active:text-white"}`}>A-Z</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
                            {[...(selectedChar.spells || [])].sort((a,b) => spellSortBy === "alpha" ? a.name.localeCompare(b.name) : a.level - b.level).map((s) => (
                              <SpellCard key={s._id} spell={s} onToggle={(id) => api.patch(`/character/${selectedChar._id}/spells/${id}`).then(r => { const up = selectedChar.spells.map(x => x._id === id ? r.data : x); handleUpdateCharacter({ spells: up }); })} onDelete={(id) => askDelete("Olvidar Hechizo", "¿Borrar este hechizo?", () => api.delete(`/character/${selectedChar._id}/spells/${id}`).then(() => { const up = selectedChar.spells.filter(x => x._id !== id); handleUpdateCharacter({ spells: up }); }))} onEdit={() => { setEditingSpell(s); setIsSpellModalOpen(true); }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PESTAÑA: NOTAS */}
                      {activeTab === "notes" && (
                        <div>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white italic tracking-tighter">Diario</h2>
                            <button onClick={() => openEdit("Nota", "DIARIO", "", "note")} className="bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-black active:bg-slate-700 transition-all shadow-lg active:scale-95 uppercase">+ ESCRIBIR</button>
                          </div>
                          <div className="columns-1 md:columns-2 gap-4 pb-10">
                            {selectedChar.notes?.map((n) => <NoteCard key={n._id} note={n} onDelete={(id) => askDelete("Quemar Nota", "¿Arrancar página?", () => api.delete(`/character/${selectedChar._id}/notes/${id}`).then(() => { const up = selectedChar.notes.filter(x => x._id !== id); handleUpdateCharacter({ notes: up }); }))} onEdit={() => openEdit("Editar Nota", "DIARIO", n.content, "edit_note", n._id)} />)}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </main>
              </div>

              {/* NAV CELULAR */}
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

      {/* --- MODALES GLOBALES (SÓLO AQUÍ) --- */}
      <ConfirmDeleteModal isOpen={deleteAlert.isOpen} title={deleteAlert.title} message={deleteAlert.msg} onClose={() => setDeleteAlert({ ...deleteAlert, isOpen: false })} onConfirm={() => { deleteAlert.action(); setDeleteAlert({ ...deleteAlert, isOpen: false }); }} />
      <JoinCampaignModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoinCampaign} characters={characters} />
      <UpdateValueModal isOpen={editModal.isOpen} title={editModal.title} label={editModal.label} initialValue={editModal.value} type={editModal.type} onClose={() => setEditModal({ ...editModal, isOpen: false })} onUpdate={handleFinalUpdate} />
      <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={(d) => api.post("/character", d).then((r) => { setCharacters([...characters, r.data]); setSelectedChar(r.data); })} />
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