import { useState } from "react";
import BottomSheet from "./ui/BottomSheet";
import Icon from "./ui/Icon";
import EditableNumber from "./ui/EditableNumber";

export default function HealthTracker({
  currentHp = 0,
  maxHp = 10,
  onEditHp,
  onEditMax,
  saving = false,
}) {
  const [mode, setMode] = useState(null);
  const [amount, setAmount] = useState("");
  const [undo, setUndo] = useState(null);
  const [pending, setPending] = useState(false);
  const percentage = Math.max(
    0,
    Math.min(100, maxHp > 0 ? (currentHp / maxHp) * 100 : 0),
  );
  const preview =
    mode === "heal"
      ? Math.max(currentHp, Math.min(maxHp, currentHp + Number(amount)))
      : currentHp - Number(amount);
  const busy = saving || pending;
  const open = (nextMode) => {
    setAmount("");
    setMode(nextMode);
  };
  const type = (value) =>
    setAmount((previous) =>
      value === "delete"
        ? previous.slice(0, -1)
        : previous.length < 4
          ? previous === "0"
            ? value
            : previous + value
          : previous,
    );
  const apply = async () => {
    if (!amount || Number(amount) <= 0 || busy || preview === currentHp) return;
    setPending(true);
    try {
      const result = await onEditHp(preview);
      if (result === null) return;
      setUndo({ before: currentHp, after: preview });
      setMode(null);
    } finally {
      setPending(false);
    }
  };
  const restore = async () => {
    if (!undo || currentHp !== undo.after || busy) return;
    setPending(true);
    try {
      const result = await onEditHp(undo.before);
      if (result !== null) setUndo(null);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <section
        className={`health-card ${percentage <= 25 ? "health-low" : ""}`}
        aria-label="Puntos de vida"
      >
        <div className="health-top">
          <span className="eyebrow">
            <Icon name="heart" size={15} />
            Puntos de vida
          </span>
          {undo && currentHp === undo.after ? (
            <button className="text-button" onClick={restore} disabled={busy}>
              <Icon name="undo" size={15} />
              Deshacer
            </button>
          ) : (
            <span className="health-status">
              {currentHp <= 0
                ? "En peligro"
                : percentage <= 25
                  ? "Vida baja"
                  : "En marcha"}
            </span>
          )}
        </div>
        <button
          className="health-display"
          onClick={() => open("damage")}
          aria-label={`Vida ${currentHp} de ${maxHp}. Toca para modificar`}
        >
          <span>{currentHp}</span>
          <span className="health-max">
            / {maxHp}
            <small>PV</small>
          </span>
          <span className="health-edit">
            <Icon name="edit" size={17} />
          </span>
        </button>
        <button
          className="health-track"
          onClick={() => open("damage")}
          aria-label="Modificar puntos de vida"
        >
          <span style={{ width: `${percentage}%` }} />
        </button>
        <div className="health-actions">
          <button onClick={() => open("damage")} disabled={busy}>
            <Icon name="minus" size={17} />
            Recibir daño
          </button>
          <span />
          <button onClick={() => open("heal")} disabled={busy}>
            <Icon name="plus" size={17} />
            Curar
          </button>
        </div>
      </section>
      {mode && (
        <BottomSheet
          title="Cuida tu aventura"
          subtitle="Puntos de vida"
          onClose={() => {
            if (!pending) setMode(null);
          }}
        >
          <div className="segmented">
            <button
              className={mode === "damage" ? "active damage" : ""}
              onClick={() => setMode("damage")}
            >
              Recibir daño
            </button>
            <button
              className={mode === "heal" ? "active" : ""}
              onClick={() => setMode("heal")}
            >
              Curar
            </button>
          </div>
          <label className="health-number-label">
            Cantidad
            <input
              className="health-number"
              aria-label="Cantidad de puntos de vida"
              readOnly
              inputMode="none"
              value={amount || "0"}
              onKeyDown={(event) => {
                if (/^\d$/.test(event.key)) {
                  event.preventDefault();
                  type(event.key);
                } else if (event.key === "Backspace") {
                  event.preventDefault();
                  type("delete");
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  apply();
                }
              }}
            />
          </label>
          <div className="health-preview" aria-live="polite">
            <span>Tu vida</span>
            <strong>
              {currentHp} <span>→</span> {preview} <small>/ {maxHp}</small>
            </strong>
          </div>
          <div className="quick-amounts">
            {[1, 5, 10, 20].map((value) => (
              <button key={value} onClick={() => setAmount(String(value))}>
                {value} PV
              </button>
            ))}
          </div>
          <div className="number-pad">
            {[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "clear",
              "0",
              "delete",
            ].map((value) => (
              <button
                key={value}
                onClick={() =>
                  value === "clear" ? setAmount("") : type(value)
                }
                aria-label={
                  value === "delete"
                    ? "Borrar último dígito"
                    : value === "clear"
                      ? "Limpiar cantidad"
                      : value
                }
              >
                {value === "delete" ? "⌫" : value === "clear" ? "C" : value}
              </button>
            ))}
          </div>
          <button
            className={`button full-width ${mode === "damage" ? "danger filled" : "primary"}`}
            disabled={
              !amount || Number(amount) <= 0 || busy || preview === currentHp
            }
            onClick={apply}
          >
            {pending
              ? "Guardando…"
              : `${mode === "damage" ? "Aplicar" : "Recuperar"} ${Number(amount)} puntos`}
          </button>
          <div className="max-health-editor">
            <span>Vida máxima</span>
            <EditableNumber
              value={maxHp}
              onSave={onEditMax}
              min={1}
              label="Vida máxima"
            />
          </div>
        </BottomSheet>
      )}
    </>
  );
}
