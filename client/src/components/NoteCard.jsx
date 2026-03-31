const NoteCard = ({ note, onDelete }) => {
  // Paleta de colores neón para las notas
  const colors = {
    orange: "border-orange-500/30 bg-orange-500/5 text-orange-200 shadow-orange-900/10",
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-200 shadow-cyan-900/10",
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-200 shadow-purple-900/10",
    slate: "border-slate-700 bg-slate-800/40 text-slate-300 shadow-black/20"
  };

  return (
    <div className={`
      relative group animate-in fade-in zoom-in duration-300
      p-5 rounded-3xl border shadow-lg
      break-inside-avoid mb-1
      ${colors[note.color] || colors.slate}
    `}>
      {/* Botón de borrar: lo hice un poco más grande para que sea fácil picarle en el cel */}
      <button 
        onClick={() => onDelete(note._id)}
        className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity text-slate-500 hover:text-red-500 active:scale-90"
      >
        <span className="text-xs font-black">✕</span>
      </button>

      {/* Título de la nota */}
      <h4 className="font-black text-[9px] uppercase tracking-[0.2em] mb-2 opacity-40 italic">
        {note.title || "Nota de Diario"}
      </h4>

      {/* Contenido: quitamos el lowercase forzado por si anotas nombres propios */}
      <p className="text-[13px] font-medium leading-relaxed text-slate-200">
        {note.content}
      </p>

      {/* Decoración visual: una minilínea al final para que parezca pergamino moderno */}
      <div className={`h-1 w-8 mt-4 rounded-full opacity-20 ${note.color === 'cyan' ? 'bg-cyan-400' : 'bg-orange-400'}`} />
    </div>
  );
};

export default NoteCard;