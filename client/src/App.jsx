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

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");

  // ESTADOS DE MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);

  // ESTADO PARA EDICIÓN (HP, STATS Y NOTAS)
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
      api.get("/character").then((res) => {
        setCharacters(res.data);
        if (res.data.length === 1) setSelectedChar(res.data[0]);
      }).catch(() => toast.error("Error al conectar con la DB"));
    }
  }, [user]);

  // --- LÓGICA DE ACTUALIZACIÓN ---
  const handleUpdateCharacter = (updatedData) => {
    api.patch(`/character/${selectedChar._id}/update`, updatedData)
      .then((res) => {
        setSelectedChar(res.data);
        toast.success("Personaje actualizado");
      })
      .catch(() => toast.error("Error al guardar cambios"));
  };

  const openEdit = (title, label, value, type, statName = null) => {
    setEditModal({ isOpen: true, title, label, value, type, statName });
  };

  const handleFinalUpdate = (newValue) => {
    if (editModal.type === "hp") {
      const clampedHp = Math.min(Math.max(0, newValue), selectedChar.hp.max);
      handleUpdateCharacter({ hp: { ...selectedChar.hp, current: clampedHp } });
    } else if (editModal.type === "maxHp") {
      handleUpdateCharacter({ hp: { ...selectedChar.hp, max: newValue } });
    } else if (editModal.type === "stat") {
      handleUpdateCharacter({ stats: { ...selectedChar.stats, [editModal.statName]: newValue } });
    } else if (editModal.type === "note") {
      api.post(`/character/${selectedChar._id}/notes`, { title: "Diario", content: newValue, color: "cyan" })
        .then((res) => {
          setSelectedChar({ ...selectedChar, notes: [...(selectedChar.notes || []), res.data] });
          toast.success("Nota guardada en el pergamino");
        });
    }
    setEditModal({ ...editModal, isOpen: false });
  };

  // --- LÓGICA DE BORRADO Y CREACIÓN ---
  const handleCreateCharacter = (data) => {
    api.post("/character", data).then((res) => {
      setCharacters([...characters, res.data]);
      setSelectedChar(res.data);
    });
  };

  const handleDeleteCharacter = (charId, charName, e) => {
    e.stopPropagation();
    toast.custom((t) => (
      <div className="bg-slate-900 border-2 border-red-600/50 p-6 rounded-3xl shadow-2xl w-full max-w-[320px]">
        <div className="flex flex-col items-center text-center mb-6 text-white font-black uppercase tracking-tighter">
          <span className="text-4xl mb-2">💀</span>
          <h3 className="text-xl leading-none">¿Borrar a {charName}?</h3>
        </div>
        <div className="flex gap-2 font-black uppercase text-[9px] tracking-widest">
          <button onClick={() => toast.dismiss(t)} className="flex-1 bg-slate-800 py-4 rounded-xl text-slate-400">Cancelar</button>
          <button onClick={() => {
            toast.dismiss(t);
            api.delete(`/character/${charId}`).then(() => {
              setCharacters(characters.filter(c => c._id !== charId));
              if (selectedChar?._id === charId) setSelectedChar(null);
            });
          }} className="flex-1 bg-red-600 py-4 rounded-xl text-white">Borrar</button>
        </div>
      </div>
    ), { position: "top-center" });
  };

  // --- LÓGICA DE INVENTARIO Y SPELLS ---
  const handleAddItem = (newItem) => {
    api.post(`/character/${selectedChar._id}/inventory`, newItem).then((res) => {
      setSelectedChar({ ...selectedChar, inventory: [...selectedChar.inventory, res.data] });
    });
  };

  const handleDeleteItem = (itemId) => {
    api.delete(`/character/${selectedChar._id}/inventory/${itemId}`).then(() => {
      const updatedInv = selectedChar.inventory.filter(i => i._id !== itemId);
      setSelectedChar({ ...selectedChar, inventory: updatedInv });
    });
  };

  const handleAddSpell = (spellData) => {
    api.post(`/character/${selectedChar._id}/spells`, spellData).then((res) => {
      setSelectedChar({ ...selectedChar, spells: [...selectedChar.spells, res.data] });
    });
  };

  const handleToggleSpell = (spellId) => {
    api.patch(`/character/${selectedChar._id}/spells/${spellId}`).then((res) => {
      const updatedSpells = selectedChar.spells.map(s => s._id === spellId ? res.data : s);
      setSelectedChar({ ...selectedChar, spells: updatedSpells });
    });
  };

  const handleDeleteSpell = (spellId) => {
    api.delete(`/character/${selectedChar._id}/spells/${spellId}`).then(() => {
      const updatedSpells = selectedChar.spells.filter(s => s._id !== spellId);
      setSelectedChar({ ...selectedChar, spells: updatedSpells });
    });
  };

  const handleDeleteNote = (noteId) => {
    api.delete(`/character/${selectedChar._id}/notes/${noteId}`).then(() => {
      const updatedNotes = selectedChar.notes.filter(n => n._id !== noteId);
      setSelectedChar({ ...selectedChar, notes: updatedNotes });
      toast.error("Nota destruida");
    });
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-black animate-pulse uppercase tracking-[0.4em]">Cargando...</div>;
  if (!user) return <Login />;

  if (!selectedChar) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
        <Toaster position="top-center" richColors theme="dark" />
        <h1 className="text-orange-500 font-black text-3xl mb-12 italic uppercase tracking-tighter">Tus Aventureros</h1>
        <div className="grid gap-4 w-full max-w-sm">
          {characters.map((c) => (
            <div key={c._id} className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 active:scale-95 transition-all">
              <button onClick={() => setSelectedChar(c)} className="w-full p-6 pr-14 text-left">
                <h2 className="text-white font-black uppercase text-lg leading-none">{c.name}</h2>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">Nivel {c.level} • {c.class}</p>
              </button>
              <button onClick={(e) => handleDeleteCharacter(c._id, c.name, e)} className="absolute top-0 right-0 bottom-0 w-12 bg-red-950/20 border-l border-red-500/10 flex items-center justify-center text-lg opacity-40">🗑️</button>
            </div>
          ))}
          <button onClick={() => setIsCharModalOpen(true)} className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-slate-600 font-black text-[10px] mt-4 uppercase tracking-[0.2em]">+ Crear Nuevo</button>
        </div>
        <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={handleCreateCharacter} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans uppercase">
      <Toaster position="top-center" richColors theme="dark" />

      <header className="p-6 pt-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-end">
        <div>
          <button onClick={() => setSelectedChar(null)} className="text-[9px] font-black text-slate-500 mb-2 hover:text-cyan-500 tracking-widest transition-colors">← Volver</button>
          <h1 className="text-2xl font-black tracking-tighter text-orange-500 leading-none">{selectedChar.name}</h1>
          <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest">Nivel {selectedChar.level} • {selectedChar.class}</p>
        </div>
        <button onClick={logout} className="text-[9px] bg-slate-800 px-3 py-2 rounded-xl text-slate-500 font-black hover:text-red-500 transition-all uppercase">Salir</button>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === "stats" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HealthTracker
              currentHp={selectedChar.hp?.current || 0}
              maxHp={selectedChar.hp?.max || 0}
              onEditHp={() => openEdit("Daño / Cura", "HP ACTUAL", selectedChar.hp.current, "hp")}
              onEditMax={() => openEdit("Ajustar Máximo", "HP MÁXIMO", selectedChar.hp.max, "maxHp")}
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 justify-items-center mt-8 pb-10">
              {Object.entries(selectedChar.stats).map(([stat, val]) => (
                <StatCard key={stat} label={stat} value={val} onClick={() => openEdit(`Ajustar ${stat}`, "VALOR ATRIBUTO", val, "stat", stat)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "inv" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-white mb-6 tracking-tighter italic">Mochila</h2>
            <div className="space-y-1">
              {selectedChar.inventory?.map((item) => (
                <InventoryItem key={item._id} item={item} onDelete={handleDeleteItem} />
              ))}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-[10px] uppercase">+ Agregar Objeto</button>
          </div>
        )}

        {activeTab === "spells" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter italic">Grimorio</h2>
              <button onClick={() => setIsSpellModalOpen(true)} className="bg-cyan-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">+ Aprender</button>
            </div>
            <div className="space-y-2 pb-10">
              {selectedChar.spells?.map((s) => (
                <SpellCard key={s._id} spell={s} onToggle={handleToggleSpell} onDelete={handleDeleteSpell} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter italic">Diario</h2>
              <button onClick={() => openEdit("Escribir Diario", "CONTENIDO DE LA NOTA", "", "note")} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:text-cyan-400 transition-all">+ Escribir</button>
            </div>
            {selectedChar.notes?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 pb-10">
                {selectedChar.notes.map((note) => (
                  <NoteCard key={note._id} note={note} onDelete={handleDeleteNote} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center opacity-20 italic text-xs tracking-[0.4em] lowercase w-full">pergamino vacío...</div>
            )}
          </div>
        )}
      </main>

      {/* --- MODALES --- */}
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />
      <AddSpellModal isOpen={isSpellModalOpen} onClose={() => setIsSpellModalOpen(false)} onAdd={handleAddSpell} />
      <UpdateValueModal 
        isOpen={editModal.isOpen} title={editModal.title} label={editModal.label} initialValue={editModal.value}
        type={editModal.type} onClose={() => setEditModal({ ...editModal, isOpen: false })} onUpdate={handleFinalUpdate} 
      />

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-8 py-4 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
        {[
          { id: "stats", icon: "⚔️", label: "Stats" },
          { id: "inv", icon: "🎒", label: "Inv" },
          { id: "spells", icon: "🪄", label: "Spells" },
          { id: "notes", icon: "📜", label: "Notas" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center transition-all duration-300 ${activeTab === tab.id ? "text-cyan-400 scale-110" : "text-slate-600 opacity-60"}`}>
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;