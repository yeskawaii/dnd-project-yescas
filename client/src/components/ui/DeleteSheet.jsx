import { useState } from "react";
import BottomSheet from "./BottomSheet";
import Icon from "./Icon";

export default function DeleteSheet({ name, onClose, onConfirm }) {
  const [pending, setPending] = useState(false);
  return (
    <BottomSheet
      title="¿Eliminar este recurso?"
      subtitle="Confirma el cambio"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <p className="detail-description">
        Se eliminará «{name}» de tu personaje y de sus accesos rápidos.
      </p>
      <div className="button-row">
        <button
          className="button secondary"
          onClick={onClose}
          disabled={pending}
        >
          Conservar
        </button>
        <button
          className="button danger filled"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              if (await onConfirm()) onClose();
            } finally {
              setPending(false);
            }
          }}
        >
          <Icon name="trash" />
          {pending ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </BottomSheet>
  );
}
