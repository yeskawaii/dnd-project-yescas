import { useState } from "react";
import NoteCard from "../NoteCard";
import UpdateValueModal from "../UpdateValueModal";
import api from "../../api/axios";

export default function NotesTab({ character, onUpdate }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const handleDeleteNote = (id) => {
    api.delete(`/character/${character._id}/notes/${id}`).then(() => {
      onUpdate({ notes: character.notes.filter(x => x._id !== id) });
    });
  };

  const handleSaveNote = (val) => {
    if (editingNote) {
      api.patch(`/character/${character._id}/notes/${editingNote._id}`, { content: val }).then((res) => {
        onUpdate({ notes: character.notes.map(n => n._id === editingNote._id ? res.data : n) });
        setIsEditModalOpen(false);
      });
    } else {
      api.post(`/character/${character._id}/notes`, { title: "Diario", content: val, color: "cyan" }).then((res) => {
        onUpdate({ notes: [...(character.notes || []), res.data] });
        setIsEditModalOpen(false);
      });
    }
  };

  const openAddNote = () => {
    setEditingNote(null);
    setIsEditModalOpen(true);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  };

  return (
    <div className="pb-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-white tracking-wider uppercase">Diario de Aventuras</h2>
          <button 
            onClick={openAddNote} 
            className="bg-white/5 border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors uppercase tracking-widest"
          >
            + ESCRIBIR
          </button>
        </div>
        <div className="columns-1 md:columns-2 gap-4 relative z-10">
          {character.notes?.map((n) => (
            <NoteCard 
              key={n._id} 
              note={n} 
              onDelete={() => handleDeleteNote(n._id)} 
              onEdit={() => openEditNote(n)} 
            />
          ))}
        </div>
      </div>

      {isEditModalOpen && (
        <UpdateValueModal 
          isOpen={isEditModalOpen} 
          title={editingNote ? "Editar Nota" : "Nueva Nota"} 
          label="DIARIO" 
          initialValue={editingNote ? editingNote.content : ""} 
          type={editingNote ? "edit_note" : "note"} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={handleSaveNote} 
        />
      )}
    </div>
  );
}
