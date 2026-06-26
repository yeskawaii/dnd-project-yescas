import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../api/axios";

// Components
import SheetHeader from "../components/character-sheet/SheetHeader";
import StatsTab from "../components/character-sheet/StatsTab";
import FeaturesTab from "../components/character-sheet/FeaturesTab";
import InventoryTab from "../components/character-sheet/InventoryTab";
import SpellsTab from "../components/character-sheet/SpellsTab";
import NotesTab from "../components/character-sheet/NotesTab";

export default function CharacterSheet({ character, setCharacters, setSelectedChar, setMode, logout }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [unitSystem, setUnitSystem] = useState("imp");

  const handleUpdateCharacter = (updatedData) => {
    api.patch(`/character/${character._id}/update`, updatedData)
      .then((res) => {
        setSelectedChar(res.data);
        setCharacters(prev => prev.map(c => c._id === res.data._id ? res.data : c));
        toast.success("Actualizado");
      })
      .catch(() => toast.error("Error actualizando DB"));
  };

  const tabs = [
    { id: "stats", icon: "⚔️", label: "Stats" },
    { id: "features", icon: "🧬", label: "Rasgos" },
    { id: "inv", icon: "🎒", label: "Mochila" },
    { id: "spells", icon: "🪄", label: "Spells" },
    { id: "notes", icon: "📜", label: "Notas" }
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 text-slate-100 font-sans relative overflow-x-hidden">
      <SheetHeader 
        character={character} 
        onUpdate={handleUpdateCharacter} 
        onBack={() => setSelectedChar(null)} 
        logout={logout} 
      />

      <div className="max-w-5xl mx-auto w-full px-4 mt-6">
        {/* Desktop Nav */}
        <nav className="hidden md:flex justify-center gap-2 mb-8 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 w-max mx-auto shadow-lg backdrop-blur-sm">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs ${activeTab === tab.id ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-slate-400 active:text-slate-300 active:bg-slate-800/50"}`}
            >
              <span className="text-lg z-10">{tab.icon}</span>
              <span className="z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="desktop-glow" className="absolute inset-0 border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]" />
              )}
            </button>
          ))}
        </nav>

        <main>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.2 }}
            >
              {activeTab === "stats" && (
                <StatsTab character={character} onUpdate={handleUpdateCharacter} unitSystem={unitSystem} setUnitSystem={setUnitSystem} />
              )}
              {activeTab === "features" && (
                <FeaturesTab character={character} onUpdate={handleUpdateCharacter} />
              )}
              {activeTab === "inv" && (
                <InventoryTab character={character} onUpdate={handleUpdateCharacter} unitSystem={unitSystem} />
              )}
              {activeTab === "spells" && (
                <SpellsTab character={character} onUpdate={handleUpdateCharacter} />
              )}
              {activeTab === "notes" && (
                <NotesTab character={character} onUpdate={handleUpdateCharacter} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-sm bg-slate-900/95 backdrop-blur-md border border-white/10 px-4 py-3 flex justify-between items-center z-40 rounded-3xl shadow-2xl">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`relative flex flex-col items-center transition-all ${activeTab === tab.id ? "text-cyan-400 scale-110" : "text-slate-500"}`}
          >
            {activeTab === tab.id && (
              <motion.div layoutId="mobile-glow" className="absolute -top-1 w-10 h-10 bg-cyan-500/20 blur-xl rounded-full" />
            )}
            <span className="text-xl z-10">{tab.icon}</span>
            <span className="text-[8px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
