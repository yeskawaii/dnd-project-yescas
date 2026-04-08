export default function TraitCard({ trait, onDelete }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700 p-3 rounded-xl mb-2 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
      <div className="flex justify-between items-start pl-2">
        <div>
          <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-sm mb-1 inline-block">
            {trait.source || "Rasgo"}
          </span>
          <h4 className="text-white font-black text-[11px] uppercase tracking-wide">{trait.name}</h4>
        </div>
        <button onClick={() => onDelete(trait._id)} className="text-red-500 text-xs p-1 active:scale-90 transition-transform">
          🗑️
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 pl-2 leading-relaxed">{trait.description}</p>
    </div>
  );
}