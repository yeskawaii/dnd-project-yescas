import { motion } from "framer-motion";

export default function Lobby({ onSelectMode, logout }) {
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center relative font-sans overflow-hidden">
      {/* Orbes de luz de fondo para el Lobby */}
      <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <button onClick={logout} className="absolute top-6 right-6 text-slate-400 font-bold text-xs bg-white/5 p-3 px-5 rounded-full border border-white/10 hover:text-white hover:bg-white/10 active:scale-95 transition-all z-10 tracking-widest uppercase shadow-md">
        🚪 SALIR
      </button>

      <div className="z-10 flex flex-col items-center mb-16">
        <h1 className="text-amber-500 font-bold text-5xl mb-3 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">GRIMORIO</h1>
        <p className="text-slate-400 text-[11px] font-semibold tracking-[0.3em] uppercase">Elige tu Destino</p>
      </div>

      <div className="grid gap-6 w-full max-w-sm z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode("player")}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-left shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group hover:border-violet-500/50 hover:bg-white/10 transition-all"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:opacity-20 group-hover:scale-110 transition-all group-hover:text-violet-400">⚔️</div>
          <h2 className="text-white font-bold text-3xl mb-2 group-hover:text-violet-400 transition-colors uppercase tracking-wider">Jugador</h2>
          <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase">Gestionar mis héroes</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode("dm")}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-left shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group hover:border-amber-500/50 hover:bg-white/10 transition-all"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:opacity-20 group-hover:scale-110 transition-all group-hover:text-amber-400">📜</div>
          <h2 className="text-amber-400 font-bold text-3xl mb-2 uppercase tracking-wider">Dungeon Master</h2>
          <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase">Controlar contiendas</p>
        </motion.button>
      </div>
    </div>
  );
}