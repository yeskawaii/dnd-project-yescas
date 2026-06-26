import { useState } from "react";
import InventoryItem from "../InventoryItem";
import AddItemModal from "../AddItemModal";
import EditableNumber from "../ui/EditableNumber";
import { lbToKg } from "../../utils/conversions";
import api from "../../api/axios";

export default function InventoryTab({ character, onUpdate, unitSystem }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const totalWeight = character.inventory?.reduce((acc, item) => acc + (item.weight || 0), 0) || 0;
  const maxWeight = character.weight?.max || 100;

  const handleUpdateMoney = (coin, val) => {
    onUpdate({ money: { ...character.money, [coin]: val } });
  };

  const handleDeleteItem = (id) => {
    api.delete(`/character/${character._id}/inventory/${id}`).then(() => {
      onUpdate({ inventory: character.inventory.filter(x => x._id !== id) });
    });
  };

  const openAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <h3 className="text-sm font-semibold text-slate-300 tracking-widest mb-4 uppercase">🪙 Monedero</h3>
        <div className="grid grid-cols-4 gap-3">
          {["cp", "sp", "gp", "pp"].map(coin => (
            <div key={coin} className="bg-black/20 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center transition-colors hover:bg-white/5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">{coin}</span>
              <EditableNumber
                value={character.money?.[coin] || 0}
                onSave={(val) => handleUpdateMoney(coin, val)}
                className="font-black text-white text-lg"
                min={0}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
            Carga Mochila 
            <span className="text-amber-400 font-bold">({unitSystem === "imp" ? `${totalWeight} lb` : `${lbToKg(totalWeight)} kg`})</span>
          </span>
          <div className="flex items-center text-[10px] font-bold text-slate-400">
            MAX: 
            <EditableNumber
              value={maxWeight}
              onSave={(val) => onUpdate({ weight: { ...character.weight, max: val } })}
              className="mx-1 text-white"
            />
            {unitSystem === "imp" ? "LB" : "KG"}
          </div>
        </div>
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 mb-8 shadow-inner">
          <div 
            className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000" 
            style={{ width: `${Math.min((totalWeight / maxWeight) * 100, 100)}%` }} 
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-wider uppercase">Equipamiento</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {character.inventory?.map((i) => (
            <InventoryItem 
              key={i._id} 
              item={i} 
              onDelete={handleDeleteItem} 
              onEdit={() => openEditItem(i)} 
            />
          ))}
        </div>
        
        <button 
          onClick={openAddItem} 
          className="w-full mt-6 bg-white/5 border border-dashed border-white/20 p-4 rounded-2xl text-slate-300 font-bold text-xs uppercase shadow-sm tracking-widest hover:text-white hover:border-white/40 hover:bg-white/10 transition-all"
        >
          + AGREGAR OBJETO
        </button>
      </div>

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onAdd={(i) => api.post(`/character/${character._id}/inventory`, i).then((r) => onUpdate({ inventory: [...character.inventory, r.data] }))} 
        onEdit={(id, data) => api.patch(`/character/${character._id}/inventory/${id}`, data).then((r) => onUpdate({ inventory: character.inventory.map((item) => (item._id === id ? r.data : item)) }))} 
        itemToEdit={editingItem} 
      />
    </div>
  );
}
