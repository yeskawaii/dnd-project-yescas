const StatCard = ({ label, value, onClick }) => {
  const mod = Math.floor((value - 10) / 2);

  return (
    <div 
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 p-4 rounded-3xl w-32 h-32 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer group hover:border-orange-500/50"
    >
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-orange-400 transition-colors">{label}</span>
      <span className="text-4xl font-black text-white leading-none">{value}</span>
      <span className={`text-[10px] font-black mt-2 ${mod >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {mod >= 0 ? `+${mod}` : mod} MOD
      </span>
    </div>
  );
};

export default StatCard;