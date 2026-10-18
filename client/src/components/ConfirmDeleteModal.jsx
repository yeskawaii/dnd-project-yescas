import BottomSheet from "./ui/BottomSheet";
import Icon from "./ui/Icon";

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!isOpen) return null;
  return (
    <BottomSheet title={title} subtitle="Confirma el cambio" onClose={onClose}>
      <p className="detail-description">{message}</p>
      <div className="button-row">
        <button className="button secondary" onClick={onClose}>
          Conservar
        </button>
        <button className="button danger filled" onClick={onConfirm}>
          <Icon name="trash" />
          Eliminar
        </button>
      </div>
    </BottomSheet>
  );
}
