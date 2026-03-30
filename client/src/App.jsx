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

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get("/character")
        .then((res) => {
          setCharacters(res.data);
          if (res.data.length === 1) setSelectedChar(res.data[0]);
        })
        .catch(() => toast.error("Error al conectar con la DB"));
    }
  }, [user]);

  const handleDeleteCharacter = (charId, charName, e) => {
    e.stopPropagation();
    toast.custom((t) => (
      <div className="bg-slate-900 border-2 border-red-600/50 p-6 rounded-3xl shadow-2xl w-full max-w-[320px]">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-4xl mb-2">💀</span>
          <h3 className="text-white font-black uppercase tracking-tighter text-xl leading-none">¿Borrar a {charName}?</h3>
          <p className="text-red-500/60 text-[9px] font-black uppercase mt-2 tracking-[0.2em]">Acción Irreversible</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.dismiss(t)} className="flex-1 bg-slate-800 py-3 rounded-xl text-slate-400 font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">Cancelar</button>
          <button onClick={() => {
            toast.dismiss(t);
            api.delete(`/character/${charId}`).then(() => {
              setCharacters(characters.filter(c => c._id !== charId));
              toast.error(`${charName} eliminado.`);
              if (selectedChar?._id === charId) setSelectedChar(null);
            });
          }} className="flex-1 bg-red-600 py-3 rounded-xl text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-red-900/40 active:scale-95 transition-all">Borrar</button>
        </div>
      </div>
    ), { position: 'top-center' });
  };

  const handleCreateCharacter = (data) => {
    api.post("/character", data).then((res) => {
      setCharacters([...characters, res.data]);
      setSelectedChar(res.data);
      toast.success(`¡${res.data.name} ha nacido!`);
    }).catch(() => toast.error("Error al forjar héroe"));
  };

  const handleAddItem = (newItem) => {
    api.post(`/character/${selectedChar._id}/inventory`, newItem).then((res) => {
      setSelectedChar({ ...selectedChar, inventory: [...selectedChar.inventory, res.data] });
      toast.success(`${newItem.name} guardado`);
    });
  };

  const handleDeleteItem = (itemId) => {
    api.delete(`/character/${selectedChar._id}/inventory/${itemId}`).then(() => {
      const updatedInv = selectedChar.inventory.filter(i => i._id !== itemId);
      setSelectedChar({ ...selectedChar, inventory: updatedInv });
      toast.error("Ítem eliminado");
    });
  };

  const handleAddSpell = () => {
    const name = prompt("Nombre del hechizo:");
    if (!name) return;
    api.post(`/character/${selectedChar._id}/spells`, { name, level: 1, school: "Evocación", desc: "Hechizo de prueba." })
      .then((res) => {
        setSelectedChar({ ...selectedChar, spells: [...selectedChar.spells, res.data] });
        toast.success("¡Hechizo aprendido!");
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
      toast.error("Hechizo olvidado");
    });
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-black animate-pulse uppercase">Conectando...</div>;
  if (!user) return <Login />;

  if (!selectedChar) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
        <Toaster position="bottom-center" richColors theme="dark" />
        <div className="text-center mb-12">
          <h1 className="text-orange-500 font-black text-3xl tracking-tighter italic uppercase drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">Tus Aventureros</h1>
          <p className="text-[10px] text-slate-600 font-bold tracking-[0.3em] uppercase mt-1">Elige tu destino</p>
        </div>
        <div className="grid gap-4 w-full max-w-sm">
          {characters.map((c) => (
            <div key={c._id} className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 active:scale-95 transition-all">
              <button onClick={() => setSelectedChar(c)} className="w-full p-6 pr-14 text-left">
                <h2 className="text-white font-black uppercase tracking-widest text-lg leading-tight">{c.name}</h2>
                <p className="text-slate-500 text-[10px] font-bold tracking-wider mt-1 uppercase">Nivel {c.level} • {c.class || "Aventurero"}</p>
              </button>
              <button onClick={(e) => handleDeleteCharacter(c._id, c.name, e)} className="absolute top-0 right-0 bottom-0 w-12 bg-red-950/20 border-l border-red-500/10 flex items-center justify-center active:bg-red-600 transition-colors">
                <span className="text-lg opacity-40">🗑️</span>
              </button>
            </div>
          ))}
          <button onClick={() => setIsCharModalOpen(true)} className="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-slate-600 font-black text-xs hover:border-orange-500/50 hover:text-orange-400 transition-all active:scale-95 mt-4">
            + CREAR NUEVO PERSONAJE
          </button>
        </div>
        <button onClick={logout} className="mt-16 text-[10px] font-black text-slate-700 hover:text-red-500 tracking-widest uppercase">Cerrar Sesión</button>
        <AddCharacterModal isOpen={isCharModalOpen} onClose={() => setIsCharModalOpen(false)} onAdd={handleCreateCharacter} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-orange-500/30 uppercase">
      <Toaster position="bottom-center" richColors theme="dark" />
      <header className="p-6 pt-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 flex justify-between items-end">
        <div>
          <button onClick={() => setSelectedChar(null)} className="text-[9px] font-black text-slate-500 mb-2 hover:text-orange-500 transition-colors uppercase tracking-widest">← Volver</button>
          <h1 className="text-2xl font-black tracking-tighter text-orange-500 leading-none">{selectedChar.name}</h1>
          <p className="text-[10px] font-black text-slate-500 mt-1 uppercase">Nivel {selectedChar.level} • {selectedChar.class || "PÍCARO"}</p>
        </div>
        <button onClick={logout} className="text-[10px] bg-slate-800 px-3 py-1 rounded-md text-slate-500 font-black hover:text-red-500 transition-colors uppercase">Salir</button>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === "stats" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <HealthTracker currentHp={selectedChar.hp?.current || 0} maxHp={selectedChar.hp?.max || 0} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 justify-items-center mt-6 pb-10">
              {Object.entries(selectedChar.stats).map(([stat, val]) => (
                <StatCard key={stat} label={stat} value={val} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "inv" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Mochila</h2>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{selectedChar.inventory?.length || 0} Objetos</span>
            </div>
            <div className="space-y-1">
              {selectedChar.inventory?.map((item) => (
                <InventoryItem key={item._id} item={item} onDelete={handleDeleteItem} />
              ))}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-xs active:scale-95 transition-all">+ Agregar Objeto</button>
          </div>
        )}

        {activeTab === "spells" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Grimorio</h2>
              <button onClick={handleAddSpell} className="bg-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">+ Aprender</button>
            </div>
            <div className="space-y-2">
              {selectedChar.spells?.map((s) => (
                <SpellCard key={s._id} spell={s} onToggle={handleToggleSpell} onDelete={handleDeleteSpell} />
              ))}
              {selectedChar.spells?.length === 0 && <p className="text-center py-20 opacity-20 italic lowercase text-xs tracking-[0.2em]">Tu libro de magia está vacío...</p>}
            </div>
          </div>
        )}
      </main>

      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-8 py-4 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { id: "stats", icon: "⚔️", label: "STATS" },
          { id: "inv", icon: "🎒", label: "INV" },
          { id: "spells", icon: "🪄", label: "SPELLS" },
          { id: "notes", icon: "📜", label: "NOTAS" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center transition-all ${activeTab === tab.id ? "text-orange-500 scale-110" : "text-slate-500 opacity-60"}`}>
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black tracking-tighter uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;