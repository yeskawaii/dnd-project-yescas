import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import SkillTable from "./components/SkillTable";
import CollapsibleSection from "./components/CollapsibleSection";
import AttackCard from "./components/AttackCard";
import AddAttackModal from "./components/AddAttackModal";
import FeatCard from "./components/FeatCard";
import AddFeatModal from "./components/AddFeatModal";
import AddSkillModal from "./components/AddSkillModal";

// --- UTILIDADES DE CONVERSIÓN ---
import { lbToKg, kgToLb, inToCm, cmToIn } from "./utils/conversions";

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [unitSystem, setUnitSystem] = useState("imp");
  const [spellSortBy, setSpellSortBy] = useState("level");

  // ESTADOS PARA LOS MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [isFeatModalOpen, setIsFeatModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // ESTADOS PARA EDICIÓN
  const [editingItem, setEditingItem] = useState(null);
  const [editingSpell, setEditingSpell] = useState(null);

  const [editModal, setEditModal] = useState({
    isOpen: false,
    title: "",
    label: "",
    value: "",
    type: "",
    statName: null,
  });

  useEffect(() => {
    if (user) {
      api
        .get("/character")
        .then((res) => {
          setCharacters(res.data);
          if (res.data.length === 1) setSelectedChar(res.data[0]);
        })
        .catch(() => toast.error("Error al conectar con el grimorio"));
    }
  }, [user]);

  const handleUpdateCharacter = (updatedData) => {
    api
      .patch(`/character/${selectedChar._id}/update`, updatedData)
      .then((res) => {
        setSelectedChar(res.data);
        toast.success("Héroe actualizado");
      })
      .catch(() => toast.error("Fallo en la tirada (Error DB)"));
  };

  const openEdit = (title, label, value, type, statName = null) => {
    let displayValue = value;
    if (unitSystem === "metric") {
      if (["physicalWeight", "weightMax"].includes(type))
        displayValue = lbToKg(value);
      else if (type === "height") displayValue = inToCm(value);
    }
    setEditModal({
      isOpen: true,
      title,
      label,
      value: displayValue,
      type,
      statName,
    });
  };

  const handleFinalUpdate = (newValue) => {
    let updateData = {};
    const t = editModal.type;
    let valToSave = newValue;

    if (unitSystem === "metric") {
      if (["physicalWeight", "weightMax"].includes(t))
        valToSave = Number(kgToLb(newValue));
      else if (t === "height") valToSave = Number(cmToIn(newValue));
    }

    switch (t) {
      case "name":
        updateData = { name: valToSave };
        break; 
      case "class":
        updateData = { class: valToSave };
        break; 
      case "race":
      case "alignment":
      case "deity":
      case "speed":
        updateData = { [t]: valToSave };
        break;
      case "level":
        updateData = { level: Number(valToSave) };
        break;
      case "experience":
        updateData = { experience: Number(valToSave) };
        break;
      case "physicalWeight":
        updateData = { physicalWeight: Number(valToSave) };
        break;
      case "height":
        updateData = { height: Number(valToSave) };
        break;
      case "bab":
        updateData = { baseAttack: Number(valToSave) };
        break;
      case "init_misc":
        updateData = { initiativeMisc: Number(valToSave) };
        break;
      case "stat":
        updateData = {
          stats: {
            ...selectedChar.stats,
            [editModal.statName]: Number(valToSave),
          },
        };
        break;
      case "hp":
        updateData = { hp: { ...selectedChar.hp, current: Number(valToSave) } };
        break;
      case "maxHp":
        updateData = { hp: { ...selectedChar.hp, max: Number(valToSave) } };
        break;
      case "ca_armor":
        updateData = {
          armorClass: { ...selectedChar.armorClass, armor: Number(valToSave) },
        };
        break;
      case "weightMax":
        updateData = {
          weight: { ...selectedChar.weight, max: Number(valToSave) },
        };
        break;
      case "save_fort":
      case "save_ref":
      case "save_will":
        const sName = t.split("_")[1];
        updateData = {
          saves: { ...selectedChar.saves, [sName]: Number(valToSave) },
        };
        break;
      case "note":
        api
          .post(`/character/${selectedChar._id}/notes`, {
            title: "Diario",
            content: valToSave,
            color: "cyan",
          })
          .then((res) =>
            setSelectedChar({
              ...selectedChar,
              notes: [...(selectedChar.notes || []), res.data],
            }),
          );
        setEditModal({ ...editModal, isOpen: false });
        return;
      case "edit_note":
        api
          .patch(`/character/${selectedChar._id}/notes/${editModal.statName}`, {
            content: valToSave,
          })
          .then((res) =>
            setSelectedChar({
              ...selectedChar,
              notes: selectedChar.notes.map((n) =>
                n._id === editModal.statName ? res.data : n
              ),
            })
          );
        setEditModal({ ...editModal, isOpen: false });
        return;
      case "cp":
        updateData = {
          money: { ...selectedChar.money, cp: Number(valToSave) },
        };
        break;
      case "sp":
        updateData = {
          money: { ...selectedChar.money, sp: Number(valToSave) },
        };
        break;
      case "gp":
        updateData = {
          money: { ...selectedChar.money, gp: Number(valToSave) },
        };
        break;
      case "pp":
        updateData = {
          money: { ...selectedChar.money, pp: Number(valToSave) },
        };
        break;
    }

    handleUpdateCharacter(updateData);
    setEditModal({ ...editModal, isOpen: false });
  };

  // HANDLERS PARA INVENTARIO
  const handleAddItem = (i) =>
    api.post(`/character/${selectedChar._id}/inventory`, i).then((r) =>
      setSelectedChar({
        ...selectedChar,
        inventory: [...selectedChar.inventory, r.data],
      }),
    );
  const handleUpdateItem = (id, updatedData) => {
    api.patch(`/character/${selectedChar._id}/inventory/${id}`, updatedData).then(r => {
      setSelectedChar({
        ...selectedChar, 
        inventory: selectedChar.inventory.map(i => i._id === id ? r.data : i)
      });
    });
  };
  const handleDeleteItem = (id) =>
    api.delete(`/character/${selectedChar._id}/inventory/${id}`).then(() =>
      setSelectedChar({
        ...selectedChar,
        inventory: selectedChar.inventory.filter((i) => i._id !== id),
      }),
    );

  // HANDLERS PARA HECHIZOS
  const handleAddSpell = (s) =>
    api.post(`/character/${selectedChar._id}/spells`, s).then((r) =>
      setSelectedChar({
        ...selectedChar,
        spells: [...selectedChar.spells, r.data],
      }),
    );
  const handleUpdateSpell = (id, updatedData) => {
    api.patch(`/character/${selectedChar._id}/spells/${id}`, updatedData).then(r => {
      setSelectedChar({
        ...selectedChar, 
        spells: selectedChar.spells.map(s => s._id === id ? r.data : s)
      });
    });
  };
  const handleToggleSpell = (id) =>
    api.patch(`/character/${selectedChar._id}/spells/${id}`).then((r) =>
      setSelectedChar({
        ...selectedChar,
        spells: selectedChar.spells.map((s) => (s._id === id ? r.data : s)),
      }),
    );
  const handleDeleteSpell = (id) =>
    api.delete(`/character/${selectedChar._id}/spells/${id}`).then(() =>
      setSelectedChar({
        ...selectedChar,
        spells: selectedChar.spells.filter((s) => s._id !== id),
      }),
    );

  // OTROS HANDLERS
  const handleDeleteNote = (id) =>
    api.delete(`/character/${selectedChar._id}/notes/${id}`).then(() =>
      setSelectedChar({
        ...selectedChar,
        notes: selectedChar.notes.filter((n) => n._id !== id),
      }),
    );
  const handleCreateCharacter = (d) =>
    api.post("/character", d).then((r) => {
      setCharacters([...characters, r.data]);
      setSelectedChar(r.data);
    });

  const handleAddAttack = (a) =>
    api.post(`/character/${selectedChar._id}/attacks`, a).then((r) =>
      setSelectedChar({
        ...selectedChar,
        attacks: [...(selectedChar.attacks || []), r.data],
      }),
    );
  const handleDeleteAttack = (id) =>
    api.delete(`/character/${selectedChar._id}/attacks/${id}`).then(() =>
      setSelectedChar({
        ...selectedChar,
        attacks: (selectedChar.attacks || []).filter((a) => a._id !== id),
      }),
    );

  const handleAddFeat = (f) =>
    api.post(`/character/${selectedChar._id}/feats`, f).then((r) =>
      setSelectedChar({
        ...selectedChar,
        feats: [...(selectedChar.feats || []), r.data],
      }),
    );
  const handleDeleteFeat = (id) =>
    api.delete(`/character/${selectedChar._id}/feats/${id}`).then(() =>
      setSelectedChar({
        ...selectedChar,
        feats: (selectedChar.feats || []).filter((f) => f._id !== id),
      }),
    );

  if (loading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-black animate-pulse uppercase">
        Cargando...
      </div>
    );
  if (!user) return <Login />;

  if (!selectedChar) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
        <Toaster position="top-center" richColors theme="dark" />
        <h1 className="text-orange-500 font-black text-3xl mb-12 italic uppercase tracking-tighter">
          Aventureros
        </h1>
        <div className="grid gap-4 w-full max-w-sm">
          {characters.map((c) => (
            <motion.div
              whileTap={{ scale: 0.95 }}
              key={c._id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-6 active:scale-95 transition-all"
            >
              <button
                onClick={() => setSelectedChar(c)}
                className="w-full text-left"
              >
                <h2 className="text-white font-black uppercase text-lg">
                  {c.name}
                </h2>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">
                  {c.class} • LVL {c.level}
                </p>
              </button>
            </motion.div>
          ))}
          <button
            onClick={() => setIsCharModalOpen(true)}
            className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-slate-600 font-black text-xs mt-4 uppercase"
          >
            + Crear Nuevo
          </button>
        </div>
        <AddCharacterModal
          isOpen={isCharModalOpen}
          onClose={() => setIsCharModalOpen(false)}
          onAdd={handleCreateCharacter}
        />
      </div>
    );
  }

  const dexMod = Math.floor(((selectedChar.stats?.Destreza || 10) - 10) / 2);
  const totalWeight = selectedChar.inventory?.reduce(
    (acc, item) => acc + (item.weight || 0),
    0,
  );
  const totalCA = 10 + (selectedChar.armorClass?.armor || 0) + dexMod;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans uppercase relative">
      <Toaster position="top-center" richColors theme="dark" />
      
      {/* 🛠️ ARREGLO #1: Header sólido y con z-50 para que no se trasparente ni encime */}
      <header className="px-6 py-4 pt-10 sticky top-0 z-50 bg-slate-950 border-b border-slate-800 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 w-full">
          <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-xl shadow-inner flex-shrink-0">
            {selectedChar.class === "Hechicero" ? "🪄" : "⚔️"}
          </div>
          <div className="flex flex-col w-full overflow-hidden">
            <h1
              onClick={() => openEdit("Renombrar", "NOMBRE DEL HÉROE", selectedChar.name, "name")}
              className="text-xl font-black text-white leading-none tracking-tighter truncate cursor-pointer hover:text-orange-500 transition-colors"
            >
              {selectedChar.name} <span className="text-[10px] text-slate-700">✎</span>
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span onClick={() => openEdit("Clase", "PROFESIÓN", selectedChar.class, "class")} className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-black text-slate-400 uppercase cursor-pointer hover:bg-slate-700">
                {selectedChar.class} ✎
              </span>
              <span onClick={() => openEdit("Nivel", "NIVEL ACTUAL", selectedChar.level, "level")} className="text-[9px] font-black text-slate-500 cursor-pointer hover:text-white">
                LVL {selectedChar.level} ✎
              </span>
              <span className="text-slate-700 text-[8px]">•</span>
              <span onClick={() => openEdit("Experiencia", "XP TOTAL", selectedChar.experience || 0, "experience")} className="text-[9px] font-black text-cyan-600 cursor-pointer hover:text-cyan-400">
                XP: {selectedChar.experience || 0} ✎
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-2 flex-shrink-0">
          <button onClick={() => setSelectedChar(null)} className="w-8 h-8 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 flex items-center justify-center text-xs active:scale-95">🔄</button>
          <button onClick={logout} className="w-8 h-8 bg-red-950/30 rounded-xl border border-red-900/50 text-red-500 flex items-center justify-center text-xs active:scale-95">🚪</button>
        </div>
      </header>

      {/* CONTENEDOR FLEX PARA RESPONSIVE (CELULAR VS PC) */}
      <div className="flex flex-col-reverse md:flex-row max-w-7xl mx-auto w-full gap-6 px-4 mt-8">
        
        {/* NAV (ABAJO EN CELULAR, A LA IZQUIERDA EN PC) */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-white/10 px-6 py-3 flex justify-between items-center z-40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                        md:sticky md:top-32 md:left-0 md:translate-x-0 md:w-24 md:flex-col md:justify-start md:gap-8 md:py-8 md:h-[calc(100vh-140px)]">
          {[
            { id: "stats", icon: "⚔️", label: "Stats" },
            { id: "inv", icon: "🎒", label: "Mochila" },
            { id: "spells", icon: "🪄", label: "Spells" },
            { id: "notes", icon: "📜", label: "Notas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center transition-all duration-300 ${activeTab === tab.id ? "text-cyan-400 scale-110" : "text-slate-500"}`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="glow" className="absolute -top-1 w-10 h-10 bg-cyan-500/10 blur-xl rounded-full" />
              )}
              <span className="text-xl z-10">{tab.icon}</span>
              <span className="text-[8px] font-black uppercase mt-1 tracking-widest md:block hidden">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 w-full pb-32 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              {activeTab === "stats" && (
                <div className="space-y-4">
                  {/* VIDA */}
                  <div className="mb-6">
                    <HealthTracker
                      currentHp={selectedChar.hp?.current || 0}
                      maxHp={selectedChar.hp?.max || 0}
                      onEditHp={() => openEdit("HP", "HP ACTUAL", selectedChar.hp.current, "hp")}
                      onEditMax={() => openEdit("Max HP", "MÁXIMO", selectedChar.hp.max, "maxHp")}
                    />
                  </div>

                  {/* 1. BIOGRAFÍA Y FÍSICO */}
                  <CollapsibleSection title="Biografía y Físico">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <button onClick={() => setUnitSystem(unitSystem === "imp" ? "metric" : "imp")} className="bg-orange-600/20 border border-orange-500/40 px-3 py-2 rounded-2xl text-[8px] font-black text-orange-500 flex-shrink-0">
                        MODO: {unitSystem === "imp" ? "LB/FT" : "KG/CM"}
                      </button>
                      {["race", "alignment", "deity"].map((f) => (
                        <div key={f} onClick={() => openEdit(`Cambiar ${f}`, f.toUpperCase(), selectedChar[f], f)} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer hover:bg-slate-800">
                          <p className="text-[7px] font-black text-slate-600 uppercase">{f}</p>
                          <p className="text-xs font-bold text-white">{selectedChar[f] || "---"}</p>
                        </div>
                      ))}
                      <div onClick={() => openEdit("Altura", "CM O PULGADAS", selectedChar.height, "height")} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer hover:bg-slate-800">
                        <p className="text-[7px] font-black text-slate-600 uppercase">Estatura</p>
                        <p className="text-xs font-bold text-white">{unitSystem === "imp" ? `${selectedChar.height || 0}"` : `${inToCm(selectedChar.height || 0)} cm`}</p>
                      </div>
                      <div onClick={() => openEdit("Peso Corporal", "PESO SIN EQUIPO", selectedChar.physicalWeight, "physicalWeight")} className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl flex-shrink-0 cursor-pointer hover:bg-slate-800">
                        <p className="text-[7px] font-black text-slate-600 uppercase">Peso Pers.</p>
                        <p className="text-xs font-bold text-orange-400">{unitSystem === "imp" ? `${selectedChar.physicalWeight || 0} lb` : `${lbToKg(selectedChar.physicalWeight || 0)} kg`}</p>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* GRID PARA PANTALLAS GRANDES (PC/TABLET) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
                    
                    {/* COLUMNA IZQUIERDA */}
                    <div className="space-y-6">
                      {/* 2. COMBATE */}
                      <CollapsibleSection title="Estadísticas de Combate" defaultOpen={true}>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div onClick={() => openEdit("Armadura", "EQUIPO (ARMADURA+ESCUDO)", selectedChar.armorClass?.armor, "ca_armor")} className="bg-slate-900 border border-cyan-500/20 p-3 rounded-3xl text-center shadow-lg cursor-pointer hover:bg-slate-800">
                            <p className="text-[8px] font-black text-cyan-400 mb-1">C. ARMADURA</p>
                            <span className="text-3xl font-black text-white">{totalCA}</span>
                            <div className="flex items-center justify-center gap-1 mt-1 opacity-40"><span className="text-[7px] font-bold text-slate-300">10+{selectedChar.armorClass?.armor || 0}+{dexMod}</span></div>
                          </div>
                          <div onClick={() => openEdit("Ataque Base", "VALOR BAB", selectedChar.baseAttack, "bab")} className="bg-slate-900 border border-orange-500/20 p-3 rounded-3xl text-center shadow-lg cursor-pointer flex flex-col justify-center hover:bg-slate-800">
                            <p className="text-[8px] font-black text-orange-400 mb-1">BAB</p>
                            <span className="text-2xl font-black text-white">+{selectedChar.baseAttack || 0}</span>
                          </div>
                          <div onClick={() => openEdit("Iniciativa", "BONOS MISC", selectedChar.initiativeMisc, "init_misc")} className="bg-slate-900 border border-purple-500/20 p-3 rounded-3xl text-center shadow-lg cursor-pointer hover:bg-slate-800">
                            <p className="text-[8px] font-black text-purple-400 mb-1 tracking-tighter">INICIATIVA</p>
                            <span className="text-2xl font-black text-white">{dexMod + (selectedChar.initiativeMisc || 0) >= 0 ? "+" : ""}{dexMod + (selectedChar.initiativeMisc || 0)}</span>
                            <p className="text-[7px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">DEX {dexMod} + {selectedChar.initiativeMisc || 0}</p>
                          </div>
                        </div>

                        {/* SALVACIONES */}
                        <div className="flex gap-2">
                          {["fort", "ref", "will"].map((s) => (
                            <div key={s} onClick={() => openEdit(`Salvación ${s}`, s.toUpperCase(), selectedChar.saves?.[s], `save_${s}`)} className={`flex-1 bg-slate-900/80 p-3 rounded-3xl border border-slate-800 text-center cursor-pointer hover:bg-slate-800`}>
                              <span className="text-[7px] block font-black text-slate-600">{s.toUpperCase()}</span>
                              <span className={`font-black text-sm ${s === "fort" ? "text-red-400" : s === "ref" ? "text-blue-400" : "text-purple-400"}`}>+{selectedChar.saves?.[s] || 0}</span>
                            </div>
                          ))}
                        </div>

                        {/* ARMAS Y ATAQUES */}
                        <div className="mt-6 pt-4 border-t border-slate-800">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Armas Equipadas</h3>
                            <button onClick={() => setIsAttackModalOpen(true)} className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded hover:bg-orange-500/20 transition-colors">+ AGREGAR</button>
                          </div>
                          <div className="space-y-2">
                            {selectedChar.attacks?.length > 0 ? (
                              selectedChar.attacks.map((atk) => <AttackCard key={atk._id} attack={atk} character={selectedChar} onDelete={handleDeleteAttack} />)
                            ) : (
                              <p className="text-center text-[10px] text-slate-600 italic py-4">Desarmado. Usa los puños.</p>
                            )}
                          </div>
                        </div>
                      </CollapsibleSection>

                      {/* 3. ATRIBUTOS (STATS) */}
                      <CollapsibleSection title="Atributos Base">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 justify-items-center mt-6">
                          {Object.entries(selectedChar.stats || {}).map(([stat, val]) => (
                            <StatCard key={stat} label={stat} value={val} onClick={() => openEdit(`Ajustar ${stat}`, "VALOR ATRIBUTO", val, "stat", stat)} />
                          ))}
                        </div>
                      </CollapsibleSection>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="space-y-6">
                      {/* 4. HABILIDADES (SKILLS) */}
                      <CollapsibleSection title="Habilidades (Skills)">
                        {/* 🛠️ ARREGLO #2: Límite de altura y scrollbar para PC */}
                        <div className="mt-2 md:max-h-[500px] md:overflow-y-auto pr-1">
                          <SkillTable character={selectedChar} onUpdateSkill={(newSkillsArray) => handleUpdateCharacter({ skills: newSkillsArray })} onOpenAddModal={() => setIsSkillModalOpen(true)} />
                        </div>
                      </CollapsibleSection>

                      {/* 5. DOTES Y RASGOS */}
                      <CollapsibleSection title="Dotes y Rasgos">
                        <div className="flex justify-between items-center mb-3 mt-2">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Habilidades Pasivas</span>
                          <button onClick={() => setIsFeatModalOpen(true)} className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors">+ AGREGAR DOTE</button>
                        </div>
                        <div className="space-y-1">
                          {selectedChar.feats?.length > 0 ? (
                            selectedChar.feats.map((f) => <FeatCard key={f._id} feat={f} onDelete={handleDeleteFeat} />)
                          ) : (
                            <p className="text-center text-[10px] text-slate-600 italic py-4">Sin dotes registradas.</p>
                          )}
                        </div>
                      </CollapsibleSection>
                    </div>

                  </div>

                  {/* CARGA MOCHILA (Ancho completo abajo) */}
                  <div className="mt-8 px-2 pb-8">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase italic">Carga Mochila</span>
                      <span onClick={() => openEdit("Carga Máxima", "LBS MAX", selectedChar.weight?.max, "weightMax")} className="text-[10px] font-black text-white cursor-pointer hover:text-cyan-400">
                        {unitSystem === "imp" ? `${totalWeight} / ${selectedChar.weight?.max || 100} LB` : `${lbToKg(totalWeight)} / ${lbToKg(selectedChar.weight?.max || 100)} KG`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_#06b6d4]" style={{ width: `${Math.min((totalWeight / (selectedChar.weight?.max || 100)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* OTRAS PESTAÑAS (Inv, Spells, Notes) */}
              {activeTab === "inv" && (
                <div className="space-y-6">
                  {/* LA BILLETERA FACHERA */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full"></div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><span>🪙</span> Monedero</h3>
                    <div className="grid grid-cols-4 gap-2 relative z-10">
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Cobre", "MONEDAS DE COBRE (PC)", selectedChar.money?.cp || 0, "cp")} className="bg-slate-950/80 border border-[#b87333]/30 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer hover:border-[#b87333]/60 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-[#b87333]/10 text-[#b87333] flex items-center justify-center text-[9px] font-black mb-1 shadow-[0_0_10px_rgba(184,115,51,0.2)]">PC</span>
                        <span className="font-black text-white text-sm">{selectedChar.money?.cp || 0}</span>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Plata", "MONEDAS DE PLATA (PP)", selectedChar.money?.sp || 0, "sp")} className="bg-slate-950/80 border border-slate-400/30 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400/60 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-slate-400/10 text-slate-400 flex items-center justify-center text-[9px] font-black mb-1 shadow-[0_0_10px_rgba(148,163,184,0.2)]">PP</span>
                        <span className="font-black text-white text-sm">{selectedChar.money?.sp || 0}</span>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Oro", "MONEDAS DE ORO (PO)", selectedChar.money?.gp || 0, "gp")} className="bg-slate-950/80 border border-yellow-500/40 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/80 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-[9px] font-black mb-1 shadow-[0_0_10px_rgba(234,179,8,0.3)]">PO</span>
                        <span className="font-black text-white text-sm">{selectedChar.money?.gp || 0}</span>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }} onClick={() => openEdit("Platino", "MONEDAS DE PLATINO (PPT)", selectedChar.money?.pp || 0, "pp")} className="bg-slate-950/80 border border-cyan-400/40 rounded-2xl p-2 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/80 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center text-[9px] font-black mb-1 shadow-[0_0_10px_rgba(34,211,238,0.3)]">PPT</span>
                        <span className="font-black text-white text-sm">{selectedChar.money?.pp || 0}</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* INVENTARIO NORMAL */}
                  <div>
                    <h2 className="text-2xl font-black text-white mb-4 italic tracking-tighter">Mochila</h2>
                    {/* Grid para PC, Lista para Celular */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedChar.inventory?.map((i) => (
                        <InventoryItem key={i._id} item={i} onDelete={handleDeleteItem} onEdit={() => { setEditingItem(i); setIsModalOpen(true); }} />
                      ))}
                    </div>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-colors">
                      + AGREGAR OBJETO
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "spells" && (() => {
                const sortedSpells = [...(selectedChar.spells || [])].sort((a, b) => {
                  if (spellSortBy === 'alpha') return a.name.localeCompare(b.name);
                  if (a.level === b.level) return a.name.localeCompare(b.name);
                  return a.level - b.level;
                });

                return (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-black text-white italic tracking-tighter">Grimorio</h2>
                      <button onClick={() => { setEditingSpell(null); setIsSpellModalOpen(true); }} className="bg-cyan-600 px-4 py-1 rounded-full text-[10px] font-black hover:bg-cyan-500 transition-colors">
                        + APRENDER
                      </button>
                    </div>

                    <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 w-max mb-4">
                      <button onClick={() => setSpellSortBy('level')} className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-colors ${spellSortBy === 'level' ? 'bg-cyan-600/20 text-cyan-500' : 'text-slate-500'}`}>
                        Nivel
                      </button>
                      <button onClick={() => setSpellSortBy('alpha')} className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-colors ${spellSortBy === 'alpha' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                        A-Z
                      </button>
                    </div>

                    {/* Grid para PC, Lista para Celular */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-10">
                      {sortedSpells.map((s) => (
                        <SpellCard key={s._id} spell={s} onToggle={handleToggleSpell} onDelete={handleDeleteSpell} onEdit={() => { setEditingSpell(s); setIsSpellModalOpen(true); }} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {activeTab === "notes" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter">Diario</h2>
                    <button onClick={() => openEdit("Nota", "ESCRIBIR EN EL DIARIO", "", "note")} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-colors">
                      + ESCRIBIR
                    </button>
                  </div>
                  {/* Grid para notas, en PC se acomodan chingón como tarjetas de corcho */}
                  <div className="columns-1 md:columns-2 gap-4 pb-10">
                    {selectedChar.notes?.map((n) => (
                      <NoteCard
                        key={n._id}
                        note={n}
                        onDelete={handleDeleteNote}
                        onEdit={() => openEdit("Editar Nota", "CONTENIDO DE LA NOTA", n.content, "edit_note", n._id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* MODALES REUNIDOS */}
      <UpdateValueModal isOpen={editModal.isOpen} title={editModal.title} label={editModal.label} initialValue={editModal.value} type={editModal.type} onClose={() => setEditModal({ ...editModal, isOpen: false })} onUpdate={handleFinalUpdate} />
      <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={handleCreateCharacter} />
      <AddItemModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} onAdd={handleAddItem} onEdit={handleUpdateItem} itemToEdit={editingItem} />
      <AddSpellModal isOpen={isSpellModalOpen} onClose={() => { setIsSpellModalOpen(false); setEditingSpell(null); }} onAdd={handleAddSpell} onEdit={handleUpdateSpell} spellToEdit={editingSpell} />
      <AddAttackModal isOpen={isAttackModalOpen} onClose={() => setIsAttackModalOpen(false)} onAdd={handleAddAttack} />
      <AddFeatModal isOpen={isFeatModalOpen} onClose={() => setIsFeatModalOpen(false)} onAdd={handleAddFeat} />
      <AddSkillModal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} onAdd={(newSkill) => { const updatedSkills = [...(selectedChar.skills || []), newSkill]; handleUpdateCharacter({ skills: updatedSkills }); }} />
    </div>
  );
}

export default App;