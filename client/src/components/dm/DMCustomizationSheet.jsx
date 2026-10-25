import { useState } from "react";
import { appearanceStyle } from "../../utils/characterCustomization";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";
import ThemePicker from "../ui/ThemePicker";

export default function DMCustomizationSheet({ theme, onSave, onClose }) {
  const [draft, setDraft] = useState(theme);
  return (
    <BottomSheet title="Mi estilo de DM" subtitle="Tu mesa, tu paleta" onClose={onClose}>
      <div className="dm-style-preview" style={appearanceStyle({ theme: draft })}>
        <div className="identity-preview">
          <span className="preview-caption">VISTA PREVIA</span>
          <span className="theme-swatch"><Icon name="book" size={24} /></span>
          <h3>Dungeon Master</h3>
          <p>Tu grupo, tus criaturas y tu historia.</p>
        </div>
        <section className="customization-section">
          <h3>Tu paleta</h3>
          <ThemePicker value={draft} onChange={setDraft} emblem="book" />
        </section>
        <div className="customization-save">
          <button className="button primary full-width" onClick={() => onSave(draft)}>
            <Icon name="check" size={18} />Guardar mi estilo
          </button>
          <p>Se guarda para tu cuenta en este navegador.</p>
        </div>
      </div>
    </BottomSheet>
  );
}
