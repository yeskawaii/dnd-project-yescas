import { useState, useRef, useEffect } from "react";

export default function EditableText({ value, onSave, label, className = "" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-white/10 text-white border-b-2 border-amber-500/50 px-2 py-1 outline-none focus:border-amber-400 w-full shadow-inner ${className}`}
        placeholder={label}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer group flex items-center gap-2 ${className}`}
      title={`Click para editar ${label}`}
    >
      <span>{value || <span className="text-slate-500 italic">Vacío</span>}</span>
      <span className="opacity-0 group-hover:opacity-100 text-amber-500 text-[12px] transition-opacity">
        ✎
      </span>
    </div>
  );
}
