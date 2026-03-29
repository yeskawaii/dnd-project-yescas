import { toast } from 'sonner'

export default function StatCard({ label, value }) {
  const modifier = Math.floor((value - 10) / 2);
  const displayMod = modifier >= 0 ? `+${modifier}` : modifier;

  const rollCheck = () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + modifier;
    
    toast.custom((t) => (
      <div className="bg-slate-900 border-2 border-orange-500 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[280px]">
        <div className="bg-orange-600 h-12 w-12 rounded-lg flex items-center justify-center text-2xl shadow-lg">🎲</div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tiro de {label}</p>
          <p className="text-xl font-black text-white">TOTAL: <span className="text-orange-500">{total}</span></p>
          <p className="text-[10px] text-slate-500 font-bold">Dado ({d20}) + Bono ({displayMod})</p>
        </div>
        <button onClick={() => toast.dismiss(t)} className="text-slate-600 hover:text-white font-black px-2">✕</button>
      </div>
    ));
  };

  return (
    <button onClick={rollCheck} className="relative flex flex-col items-center justify-center rounded-2xl bg-slate-900 p-5 shadow-2xl border-2 border-slate-800 w-32 mb-10 active:scale-90 transition-all active:border-orange-500 outline-none group">
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1 group-active:text-orange-400">{label}</span>
      <span className="text-4xl font-black text-white leading-none drop-shadow-md">{displayMod}</span>
      <div className="absolute -bottom-3 bg-slate-800 border border-slate-700 px-3 py-0.5 rounded-md shadow-lg">
        <span className="text-[10px] font-bold text-slate-400">{value}</span>
      </div>
    </button>
  );
}