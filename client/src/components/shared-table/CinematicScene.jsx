import { useState } from "react";
import Icon from "../ui/Icon";
import { sceneMoods } from "../../utils/tablePresentation";

export default function CinematicScene({ scene, onExpand }) {
  const [failedImage, setFailedImage] = useState("");
  const mood = Object.hasOwn(sceneMoods, scene.mood) ? scene.mood : "forest";
  return (
    <article className={`cinematic-scene scene-mood-${mood}`}>
      <div className="scene-art" aria-hidden="true">
        <div className="scene-orb" /><div className="scene-arch" />
        <span className="scene-sigil">{sceneMoods[mood].icon}</span>
        {scene.imageUrl && failedImage !== scene.imageUrl && (
          <img src={scene.imageUrl} alt="" referrerPolicy="no-referrer"
            onError={() => setFailedImage(scene.imageUrl)} />
        )}
      </div>
      <div className="scene-copy">
        <p className="eyebrow"><Icon name="scene" size={16} />Una nueva página en tu historia</p>
        <h2>{scene.title}</h2>
        {scene.description && <p className="scene-description">{scene.description}</p>}
        {onExpand && (
          <button className="button secondary compact" onClick={onExpand}>
            <Icon name="eye" size={17} />Contemplar escena
          </button>
        )}
      </div>
    </article>
  );
}
