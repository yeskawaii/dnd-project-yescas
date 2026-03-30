import { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import StatCard from "./components/StatCard";
import HealthTracker from "./components/HealthTracker";
import InventoryItem from "./components/InventoryItem";
import AddItemModal from "./components/AddItemModal";

function App() {
  const [char, setChar] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. OBTENER PERSONAJE (GET)
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/character")
      .then((res) => setChar(res.data))
      .catch((err) => {
        console.error("Error en API:", err);
        toast.error("Error de conexión con el servidor");
      });
  }, []);

  // 2. AGREGAR OBJETO (POST)
  const handleAddItem = (newItem) => {
    axios
      .post("http://localhost:4000/api/inventory", newItem)
      .then((res) => {
        setChar((prev) => ({
          ...prev,
          inventory: [...prev.inventory, res.data],
        }));
        toast.success(`${newItem.name} guardado en la mochila`);
      })
      .catch(() => toast.error("No se pudo guardar el objeto"));
  };

  // 3. ELIMINAR OBJETO (DELETE)
  const handleDeleteItem = (id) => {
    axios.delete(`http://localhost:4000/api/inventory/${id}`).then(() => {
      // Filtramos usando _id
      setChar((prev) => ({
        ...prev,
        inventory: prev.inventory.filter((item) => item._id !== id),
      }));
      toast.error("Objeto eliminado");
    });
  };

  if (!char)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse">
        CARGANDO AVENTURA...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-orange-500/30 uppercase">
      <Toaster position="top-center" richColors theme="dark" />

      {/* HEADER */}
      <header className="p-6 pt-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
        <h1 className="text-2xl font-black tracking-tighter text-orange-500 leading-none">
          {char.name}
        </h1>
        <p className="text-[10px] font-black text-slate-500 mt-1 tracking-widest">
          NIVEL {char.level} • PÍCARO
        </p>
      </header>

      <main className="p-4 max-w-md mx-auto relative z-10">
        {/* PESTAÑA: STATS */}
        {activeTab === "stats" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HealthTracker currentHp={24} maxHp={30} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 justify-items-center mt-6 pb-10">
              {Object.entries(char.stats).map(([stat, val]) => (
                <StatCard key={stat} label={stat} value={val} />
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: INVENTARIO */}
        {activeTab === "inv" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
                Mochila
              </h2>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full font-black">
                {char.inventory?.length || 0} OBJETOS
              </span>
            </div>

            {char.inventory && char.inventory.length > 0 ? (
              <div className="space-y-1">
                {char.inventory.map((item) => (
                  <InventoryItem
                    key={item._id}
                    item={item}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center opacity-20 italic lowercase">
                <p>Tu mochila está vacía...</p>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-6 border-2 border-dashed border-slate-800 p-4 rounded-2xl text-slate-600 font-black text-xs active:scale-95 transition-all hover:border-slate-500 hover:text-slate-400"
            >
              + AGREGAR OBJETO
            </button>
          </div>
        )}

        {/* SECCIONES PENDIENTES */}
        {(activeTab === "spells" || activeTab === "notes") && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 italic lowercase">
            <span className="text-4xl mb-4">🚧</span>
            <p>Sección de {activeTab} en construcción...</p>
          </div>
        )}
      </main>

      {/* MODAL CENTRADO */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
      />

      {/* NAVEGACIÓN INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-8 py-4 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { id: "stats", icon: "⚔️", label: "STATS" },
          { id: "inv", icon: "🎒", label: "INV" },
          { id: "spells", icon: "🪄", label: "SPELLS" },
          { id: "notes", icon: "📜", label: "NOTAS" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center transition-all ${activeTab === tab.id ? "text-orange-500 scale-110" : "text-slate-500 opacity-60"}`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black tracking-tighter">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
