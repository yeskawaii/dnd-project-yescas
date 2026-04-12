import { motion } from "framer-motion";

export default function Lobby({ onSelectMode, logout }) {
  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center relative uppercase font-sans">
      <button onClick={logout} className="absolute top-6 right-6 text-red-500 font-black text-xs bg-red-900/20 p-3 rounded-xl border border-red-900/50 active:scale-95 transition-all">
        🚪 SALIR
      </button>

      <h1 className="text-orange-500 font-black text-4xl mb-2 italic tracking-tighter italic">GRIMORIO</h1>
      <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] mb-12">ELIGE TU DESTINO</p>

      <div className="grid gap-6 w-full max-w-sm">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectMode("player")}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left shadow-2xl relative overflow-hidden group active:border-cyan-500/50 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">⚔️</div>
          <h2 className="text-white font-black text-2xl mb-1">JUGADOR</h2>
          <p className="text-slate-500 text-[10px] font-bold tracking-widest">Gestionar mis héroes</p>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectMode("dm")}
          className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left shadow-2xl relative overflow-hidden group active:border-orange-500/50 transition-colors"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📜</div>
          <h2 className="text-orange-500 font-black text-2xl mb-1">DUNGEON MASTER</h2>
          <p className="text-slate-500 text-[10px] font-bold tracking-widest">Controlar contiendas</p>
        </motion.button>
      </div>
    </div>
  );
}