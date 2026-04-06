const NoteCard = ({ note, onDelete, onEdit }) => {
  const colors = {
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-200 shadow-orange-900/20",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 shadow-cyan-900/20",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-200 shadow-purple-900/20",
    slate: "border-slate-700 bg-slate-800/60 text-slate-300 shadow-black/40"
  };

  // Función directa para procesar los enters y los guiones
  const formatText = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
      // Si la línea está vacía (un doble Enter), metemos un salto despacio
      if (line.trim() === '') return <div key={index} className="h-2" />;
      
      // Si empieza con guión, la empujamos tantito a la derecha
      if (line.trim().startsWith('-')) {
        return <p key={index} className="pl-4 mb-1 relative before:content-['•'] before:absolute before:left-0 before:text-slate-500">{line.replace('-', '').trim()}</p>;
      }
      
      // Texto normal
      return <p key={index} className="mb-1">{line}</p>;
    });
  };

  return (
    <div className={`
      relative animate-in fade-in zoom-in duration-300
      p-5 rounded-[2rem] border shadow-xl
      break-inside-avoid mb-4
      ${colors[note.color] || colors.slate}
    `}>
      {/* BOTONES FLOTANTES EN CELULAR */}
      <div className="absolute -top-3 -right-1 flex gap-1 z-10">
        <button 
          onClick={onEdit}
          className="w-8 h-8 bg-slate-900 border border-cyan-500/50 rounded-full flex items-center justify-center text-cyan-500 shadow-lg active:scale-75 transition-all"
        >
          <span className="text-[12px] font-bold">✎</span>
        </button>
        <button 
          onClick={() => onDelete(note._id)}
          className="w-8 h-8 bg-slate-900 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 shadow-lg active:scale-75 transition-all"
        >
          <span className="text-[10px] font-bold">✕</span>
        </button>
      </div>

      {/* CABECERA DE LA NOTA */}
      <div className="flex items-center justify-between mb-3 pr-14">
        <h4 className="font-black text-[8px] uppercase tracking-[0.3em] opacity-40 italic truncate">
          {note.title || "DIARIO"}
        </h4>
        <div className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${note.color === 'cyan' ? 'bg-cyan-400' : 'bg-orange-400'}`} />
      </div>

      {/* CONTENIDO PRINCIPAL FORMATEADO */}
      <div className="text-[14px] font-medium leading-relaxed text-slate-100 mb-1">
        {formatText(note.content)}
      </div>

      {/* DECORACIÓN INFERIOR */}
      <div className="flex justify-end mt-2 opacity-10">
        <span className="text-[7px] font-black tracking-widest tracking-tighter">B.O.H. SYSTEM v1.0</span>
      </div>
    </div>
  );
};

export default NoteCard;