import EditableText from "../ui/EditableText";
import EditableNumber from "../ui/EditableNumber";

export default function SheetHeader({ character, onUpdate, onBack, logout }) {
  if (!character) return null;

  return (
    <header className="px-6 py-4 pt-10 sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-xl shadow-inner">
          {character.class === "Hechicero" ? "🪄" : "⚔️"}
        </div>
        <div>
          <EditableText
            value={character.name}
            onSave={(val) => onUpdate({ name: val })}
            label="Nombre"
            className="text-xl font-black text-white italic tracking-tighter leading-none"
          />
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-[9px] font-black text-slate-500 tracking-widest">
              {character.class} LVL{" "}
              <EditableNumber
                value={character.level}
                onSave={(val) => onUpdate({ level: val })}
                label="Nivel"
                className="ml-1"
                min={1}
                max={20}
              />
            </div>
            <div className="flex items-center text-[9px] font-black text-cyan-600">
              XP:{" "}
              <EditableNumber
                value={character.experience}
                onSave={(val) => onUpdate({ experience: val })}
                label="XP"
                className="ml-1 text-cyan-600"
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="w-8 h-8 bg-slate-900 rounded-xl text-slate-400 flex items-center justify-center text-xs active:scale-95 transition-transform"
          title="Volver"
        >
          🔄
        </button>
        <button
          onClick={logout}
          className="w-8 h-8 bg-red-950/30 text-red-500 rounded-xl flex items-center justify-center text-xs active:scale-95 transition-transform"
          title="Cerrar sesión"
        >
          🚪
        </button>
      </div>
    </header>
  );
}
