const NoteCard = ({ note, onDelete }) => {
  const colors = {
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-200 shadow-orange-900/20",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-cyan-900/20",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-200 shadow-purple-900/20",
    slate: "border-slate-700 bg-slate-800/60 text-slate-300 shadow-black/40"
  };

  return (
    <div className={`
      relative animate-in fade-in zoom-in duration-300
      p-5 rounded-[2rem] border shadow-xl
      break-inside-avoid mb-4
      ${colors[note.color] || colors.slate}
    `}>
      {/* BOTÓN DE BORRAR SIEMPRE VISIBLE EN CELULAR */}
      <button 
        onClick={() => onDelete(note._id)}
        className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 shadow-lg active:scale-75 transition-all z-10"
      >
        <span className="text-[10px] font-bold">✕</span>
      </button>

      {/* CABECERA DE LA NOTA */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-[8px] uppercase tracking-[0.3em] opacity-40 italic">
          {note.title || "DIARIO"}
        </h4>
        <div className={`w-2 h-2 rounded-full animate-pulse ${note.color === 'cyan' ? 'bg-cyan-400' : 'bg-orange-400'}`} />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <p className="text-[14px] font-medium leading-relaxed text-slate-100 mb-1">
        {note.content}
      </p>

      {/* DECORACIÓN INFERIOR (Estilo Pergamino Moderno) */}
      <div className="flex justify-end mt-2 opacity-10">
        <span className="text-[7px] font-black tracking-widest tracking-tighter">B.O.H. SYSTEM v1.0</span>
      </div>
    </div>
  );
};

export default NoteCard;