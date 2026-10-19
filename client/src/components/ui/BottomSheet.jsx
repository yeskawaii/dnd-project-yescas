import { useContext, useEffect, useEffectEvent, useId, useRef } from "react";
import { CharacterThemeContext } from "../../context/character-theme";
import { createPortal } from "react-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import Icon from "./Icon";

export default function BottomSheet({
  title,
  subtitle,
  onClose,
  children,
  className = "",
}) {
  const titleId = useId();
  const theme = useContext(CharacterThemeContext);
  const dialog = useRef(null);
  const reducedMotion = useReducedMotion();
  const close = useEffectEvent(() => onClose());

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const root = document.getElementById("root");
    const wasInert = root?.inert;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key !== "Tab") return;
      const elements = [
        ...dialog.current.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length);
      const first = elements[0];
      const last = elements.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (root) root.inert = wasInert;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <Motion.section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`bottom-sheet ${className}`}
        style={theme}
        initial={{ y: reducedMotion ? 0 : 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <header className="sheet-heading">
          <div>
            <p className="eyebrow">{subtitle || "Tu mesa de aventura"}</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet-content">{children}</div>
      </Motion.section>
    </div>,
    document.body,
  );
}
