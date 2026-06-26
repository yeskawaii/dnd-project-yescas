import { useState, useRef, useEffect } from "react";

export default function EditableNumber({ value, onSave, label, className = "", min = undefined, max = undefined }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    let numVal = Number(currentValue);
    
    if (isNaN(numVal)) {
      setCurrentValue(value);
      return;
    }

    if (min !== undefined && numVal < min) numVal = min;
    if (max !== undefined && numVal > max) numVal = max;

    if (numVal !== value) {
      onSave(numVal);
    } else {
      setCurrentValue(value);
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
        type="number"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-white/10 text-white border-b-2 border-amber-500/50 px-1 outline-none focus:border-amber-400 w-16 text-center shadow-inner ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer group flex items-center gap-1 justify-center ${className}`}
      title={`Click para editar ${label}`}
    >
      <span>{value ?? 0}</span>
      <span className="opacity-0 group-hover:opacity-100 text-amber-500 text-[12px] transition-opacity">
        ✎
      </span>
    </div>
  );
}
