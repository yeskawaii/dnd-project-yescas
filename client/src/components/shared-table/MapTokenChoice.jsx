import TokenBadge from "./TokenBadge";
import { characterTokenVisual, safePortrait } from "../../../../shared/mapTokens.mjs";

export default function MapTokenChoice({ appearance, disabled, onChange }) {
  const visual = characterTokenVisual(appearance);
  const portrait = safePortrait(appearance?.portrait);
  const style = appearance?.mapTokenStyle === "portrait" ? "portrait" : "icon";
  return <fieldset className="map-token-choice" disabled={disabled}>
    <legend>Ficha en el mapa</legend>
    <div className="choice-chips">
      <button type="button" className={style === "icon" ? "selected" : ""} aria-pressed={style === "icon"} onClick={() => onChange("icon")}>
        <TokenBadge entry={{ kind: "player", icon: visual.icon }} />Icono
      </button>
      <button type="button" className={style === "portrait" ? "selected" : ""} aria-pressed={style === "portrait"}
        disabled={!portrait} onClick={() => onChange("portrait")}>
        <TokenBadge entry={{ kind: "player", icon: visual.icon, portrait }} />Retrato
      </button>
    </div>
    <p className="helper-text">{portrait ? "Elige cómo se verá este personaje en el mapa para todo el grupo." : "Sube una imagen en Personalizar mi personaje → Tu retrato para usarla en el mapa."}</p>
  </fieldset>;
}
