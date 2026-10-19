import { useEffect, useRef, useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import CharacterAvatar from "../ui/CharacterAvatar";
import Icon from "../ui/Icon";
import IconPicker from "../ui/IconPicker";
import {
  appearanceStyle,
  characterThemes,
  defaultAppearance,
  getAppearance,
  getPlayLayout,
  playWidgets,
  portraitCrop,
} from "../../utils/characterCustomization";
import { moveAction } from "../../utils/quickActions";

const backdrops = [
  ["mist", "Bruma"],
  ["stars", "Estrellas"],
  ["parchment", "Pergamino"],
  ["plain", "Liso"],
];
const frames = [
  ["shield", "Escudo"],
  ["round", "Círculo"],
  ["rune", "Runa"],
];

export default function CustomizationSheet({ character, onUpdate, onClose }) {
  const [appearance, setAppearance] = useState(() => getAppearance(character));
  const [layout, setLayout] = useState(() => getPlayLayout(character));
  const [tab, setTab] = useState("identity");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [crop, setCrop] = useState(null);
  const [position, setPosition] = useState({ zoom: 1, x: 50, y: 50 });
  const canvas = useRef(null);
  const fileInput = useRef(null);
  const loadVersion = useRef(0);
  useEffect(
    () => () => {
      loadVersion.current += 1;
    },
    [],
  );
  useEffect(() => {
    if (!crop || !canvas.current) return;
    const { x, y, side } = portraitCrop(
      crop.naturalWidth,
      crop.naturalHeight,
      position.zoom,
      position.x,
      position.y,
    );
    const context = canvas.current.getContext("2d");
    context.clearRect(0, 0, 384, 384);
    context.drawImage(crop, x, y, side, side, 0, 0, 384, 384);
  }, [crop, position, tab]);

  const update = (key, value) =>
    setAppearance((previous) => ({ ...previous, [key]: value }));
  const choosePortrait = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError("Elige una imagen JPG, PNG o WebP de hasta 8 MB.");
      return;
    }
    const version = ++loadVersion.current;
    setReading(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (version !== loadVersion.current) return;
      setPosition({ zoom: 1, x: 50, y: 50 });
      setCrop(image);
    } catch {
      if (version === loadVersion.current)
        setError("No pudimos abrir esa imagen. Prueba con otra.");
    } finally {
      URL.revokeObjectURL(url);
      if (version === loadVersion.current) setReading(false);
    }
  };
  const applyCrop = () => {
    const portrait = canvas.current?.toDataURL("image/jpeg", 0.82);
    if (!portrait || portrait.length > 240000) {
      setError("La imagen sigue siendo demasiado grande. Prueba con otra.");
      return;
    }
    update("portrait", portrait);
    setCrop(null);
    setError("");
  };
  const save = async () => {
    if (pending || reading || crop) return;
    setPending(true);
    setError("");
    try {
      const result = await onUpdate({ appearance, playLayout: layout });
      if (result) onClose();
      else
        setError(
          "No se guardó tu personalización. Puedes volver a intentarlo; tus cambios siguen aquí.",
        );
    } catch {
      setError("No se guardó tu personalización. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  };
  return (
    <BottomSheet
      title="Hazlo tuyo"
      subtitle="Un personaje, tu estilo"
      className="customization-sheet"
      onClose={() => {
        if (!pending && !reading) onClose();
      }}
    >
      <div
        className="customization-content"
        style={appearanceStyle(appearance)}
      >
        <div
          className="segmented customization-tabs"
          aria-label="Personalización"
        >
          <button
            className={tab === "identity" ? "active" : ""}
            aria-pressed={tab === "identity"}
            disabled={pending || reading}
            onClick={() => setTab("identity")}
          >
            <Icon name="palette" size={17} />
            Mi personaje
          </button>
          <button
            className={tab === "layout" ? "active" : ""}
            aria-pressed={tab === "layout"}
            disabled={pending || reading || !!crop}
            onClick={() => setTab("layout")}
          >
            <Icon name="grip" size={17} />
            Mi partida
          </button>
        </div>
        <fieldset
          className="customization-fields"
          disabled={pending || reading}
        >
          {tab === "identity" ? (
            <>
              <div
                className={`identity-preview backdrop-${appearance.backdrop}`}
              >
                <span className="preview-caption">VISTA PREVIA</span>
                <CharacterAvatar
                  character={{ ...character, appearance }}
                  size="large"
                />
                <h3>{character.name}</h3>
                <p>
                  {character.class} · Nivel {character.level}
                </p>
              </div>
              <section className="customization-section">
                <div className="section-heading">
                  <h3>Tu retrato</h3>
                  {appearance.portrait && !crop && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => update("portrait", "")}
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="Subir retrato"
                  className="visually-hidden"
                  onChange={choosePortrait}
                />
                <button
                  type="button"
                  className="button secondary full-width"
                  onClick={() => fileInput.current.click()}
                >
                  <Icon name="camera" />
                  {reading ? "Abriendo imagen…" : "Elegir una imagen"}
                </button>
                <p className="helper-text">
                  De tu galería a tu ficha. Ajusta el encuadre antes de guardar.
                </p>
                {crop && (
                  <div className="portrait-cropper">
                    <canvas
                      ref={canvas}
                      width={384}
                      height={384}
                      aria-label="Vista previa del recorte del retrato"
                    />
                    {[
                      ["zoom", "Acercar", 1, 3, 0.05],
                      ["x", "Encuadre horizontal", 0, 100, 1],
                      ["y", "Encuadre vertical", 0, 100, 1],
                    ].map(([key, label, min, max, step]) => (
                      <label key={key}>
                        {label}
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={position[key]}
                          onChange={(event) =>
                            setPosition((previous) => ({
                              ...previous,
                              [key]: Number(event.target.value),
                            }))
                          }
                        />
                      </label>
                    ))}
                    <div className="button-row">
                      <button
                        className="button secondary"
                        onClick={() => setCrop(null)}
                      >
                        Cancelar recorte
                      </button>
                      <button className="button primary" onClick={applyCrop}>
                        <Icon name="check" />
                        Usar recorte
                      </button>
                    </div>
                  </div>
                )}
              </section>
              <section className="customization-section">
                <h3>Tu paleta</h3>
                <div className="theme-grid">
                  {characterThemes.map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      style={appearanceStyle({ theme: theme.id })}
                      className={`theme-option ${appearance.theme === theme.id ? "selected" : ""}`}
                      aria-pressed={appearance.theme === theme.id}
                      onClick={() => update("theme", theme.id)}
                    >
                      <span className="theme-swatch">
                        <Icon name={appearance.emblem} size={22} />
                      </span>
                      <strong>{theme.name}</strong>
                      <small>{theme.hint}</small>
                      {appearance.theme === theme.id && (
                        <Icon name="check" size={15} />
                      )}
                    </button>
                  ))}
                </div>
              </section>
              <section className="customization-section">
                <h3>Ambiente y marco</h3>
                <div className="choice-chips" aria-label="Fondo">
                  {backdrops.map(([id, label]) => (
                    <button
                      type="button"
                      key={id}
                      className={appearance.backdrop === id ? "selected" : ""}
                      aria-pressed={appearance.backdrop === id}
                      onClick={() => update("backdrop", id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="choice-chips" aria-label="Marco del retrato">
                  {frames.map(([id, label]) => (
                    <button
                      type="button"
                      key={id}
                      className={appearance.frame === id ? "selected" : ""}
                      aria-pressed={appearance.frame === id}
                      onClick={() => update("frame", id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
              <IconPicker
                label="Tu emblema"
                value={appearance.emblem}
                onChange={(value) => update("emblem", value)}
              />
            </>
          ) : (
            <>
              <div className="layout-intro">
                <span className="action-emblem">
                  <Icon name="grip" size={26} />
                </span>
                <h3>Lo importante, primero.</h3>
                <p>
                  Ordena las tarjetas con las flechas y elige cuáles quieres ver
                  en Partida. Vida y acciones estarán siempre a mano.
                </p>
              </div>
              <div className="layout-widget-list">
                {layout.order.map((id, index) => {
                  const widget = playWidgets.find((item) => item.id === id);
                  return (
                    <div key={id} className="layout-widget">
                      <Icon name={widget.icon} />
                      <span>
                        <strong>{widget.name}</strong>
                        <small>
                          {widget.required
                            ? "Siempre visible"
                            : layout.hidden.includes(id)
                              ? "Oculto"
                              : "Visible"}
                        </small>
                      </span>
                      {!widget.required && (
                        <button
                          className="icon-button"
                          aria-label={`${layout.hidden.includes(id) ? "Mostrar" : "Ocultar"} ${widget.name}`}
                          aria-pressed={!layout.hidden.includes(id)}
                          onClick={() =>
                            setLayout((previous) => ({
                              ...previous,
                              hidden: previous.hidden.includes(id)
                                ? previous.hidden.filter((item) => item !== id)
                                : [...previous.hidden, id],
                            }))
                          }
                        >
                          <Icon
                            name={layout.hidden.includes(id) ? "plus" : "eye"}
                            size={18}
                          />
                        </button>
                      )}
                      <button
                        className="icon-button"
                        aria-label={`Subir ${widget.name}`}
                        disabled={index === 0}
                        onClick={() =>
                          setLayout((previous) => ({
                            ...previous,
                            order: moveAction(previous.order, index, index - 1),
                          }))
                        }
                      >
                        <Icon name="up" size={18} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Bajar ${widget.name}`}
                        disabled={index === layout.order.length - 1}
                        onClick={() =>
                          setLayout((previous) => ({
                            ...previous,
                            order: moveAction(previous.order, index, index + 1),
                          }))
                        }
                      >
                        <Icon name="down" size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <section className="customization-section">
                <h3>Tamaño de las tarjetas</h3>
                <div className="choice-chips">
                  {[
                    ["comfortable", "Cómodo"],
                    ["compact", "Compacto"],
                  ].map(([id, label]) => (
                    <button
                      type="button"
                      key={id}
                      className={layout.density === id ? "selected" : ""}
                      aria-pressed={layout.density === id}
                      onClick={() =>
                        setLayout((previous) => ({ ...previous, density: id }))
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="helper-text">
                  Los botones conservan espacio suficiente para tocarlos.
                </p>
              </section>
            </>
          )}
          <button
            type="button"
            className="text-button reset-customization"
            onClick={() => {
              setAppearance({ ...defaultAppearance });
              setLayout(getPlayLayout({}));
              setCrop(null);
            }}
          >
            <Icon name="undo" size={16} />
            Restablecer estilo y tarjetas
          </button>
        </fieldset>
        {error && (
          <p className="customization-error" role="alert">
            {error}
          </p>
        )}
        <div className="customization-save">
          <button
            className="button primary full-width"
            disabled={pending || reading || !!crop}
            onClick={save}
          >
            <Icon name="check" size={18} />
            {pending ? "Guardando…" : "Guardar mi estilo"}
          </button>
          <p>
            {crop
              ? "Confirma el recorte para continuar."
              : "Se guarda solo para este personaje."}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
