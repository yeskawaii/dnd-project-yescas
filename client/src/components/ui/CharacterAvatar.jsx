import { useState } from "react";
import {
  appearanceStyle,
  getAppearance,
} from "../../utils/characterCustomization";
import Icon from "./Icon";

export default function CharacterAvatar({ character, size = "small" }) {
  const appearance = getAppearance(character);
  const [failed, setFailed] = useState(null);
  return (
    <span
      className={`character-avatar personal-avatar avatar-${size} frame-${appearance.frame}`}
      style={appearanceStyle(appearance)}
    >
      {appearance.portrait && failed !== appearance.portrait ? (
        <img
          src={appearance.portrait}
          alt={`Retrato de ${character.name}`}
          onError={() => setFailed(appearance.portrait)}
        />
      ) : (
        <Icon name={appearance.emblem} size={size === "large" ? 43 : 23} />
      )}
      {size === "large" && (
        <span className="avatar-seal">
          <Icon name={appearance.emblem} size={15} />
        </span>
      )}
    </span>
  );
}
