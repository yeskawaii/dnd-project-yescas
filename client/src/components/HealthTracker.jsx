const HealthTracker = ({ currentHp, maxHp, onEditHp, onEditMax }) => {
  const percentage = (currentHp / maxHp) * 100;

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div onClick={onEditMax} className="cursor-pointer group">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-orange-500 transition-colors">Vida Máxima: {maxHp}</p>
          <h2 className="text-5xl font-black text-white leading-none tracking-tighter">
            {currentHp}<span className="text-xl text-slate-700">HP</span>
          </h2>
        </div>
        
        <button 
          onClick={onEditHp}
          className="bg-orange-600/10 border border-orange-500/50 px-4 py-3 rounded-2xl text-orange-500 font-black text-[10px] tracking-widest uppercase hover:bg-orange-600 hover:text-white transition-all active:scale-90"
        >
          Modificar
        </button>
      </div>
      
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div 
          className={`h-full transition-all duration-700 ease-out ${percentage < 25 ? 'bg-red-600' : 'bg-orange-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default HealthTracker;