import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddItemModal({ isOpen, onClose, onAdd, onEdit, itemToEdit }) {
  const [formData, setFormData] = useState({ name: '', weight: '', desc: '', icon: '📦' });

  useEffect(() => {
    if (itemToEdit) setFormData(itemToEdit);
    else setFormData({ name: '', weight: '', desc: '', icon: '📦' });
  }, [itemToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    if (itemToEdit) onEdit(itemToEdit._id, formData);
    else onAdd(formData);
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 pb-12 sm:pb-4" onClick={onClose}>
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }} 
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm bg-[#1A1C23]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.8)] relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-amber-500 tracking-wider uppercase flex items-center gap-2">
                <span className="text-2xl">{formData.icon}</span> {itemToEdit ? 'Editar Tesoro' : 'Nuevo Tesoro'}
              </h3>
              <button onClick={onClose} className="text-slate-500 text-xl hover:text-white active:scale-95 transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Nombre del Objeto</label>
                <input placeholder="ej. Poción de Curación" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Peso (Opcional)</label>
                  <input placeholder="0" type="number" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner text-center" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Categoría</label>
                  <select className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner cursor-pointer text-center" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})}>
                    <option value="📦">MISC (📦)</option>
                    <option value="⚔️">ARMA (⚔️)</option>
                    <option value="🛡️">DEF (🛡️)</option>
                    <option value="🧪">POTI (🧪)</option>
                    <option value="📜">DOC (📜)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Descripción</label>
                <textarea placeholder="Notas, efectos..." className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none h-24 resize-none focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
              </div>

              <div className="pt-4 border-t border-white/10 mt-2">
                <button type="submit" className="w-full bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl font-bold text-xs text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all uppercase tracking-widest">
                  {itemToEdit ? 'Actualizar Objeto' : '+ Agregar Objeto'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}