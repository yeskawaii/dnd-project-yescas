import { useState } from "react";
import Icon from "../ui/Icon";
import BottomSheet from "../ui/BottomSheet";
import DeleteSheet from "../ui/DeleteSheet";
import ResourceEditor from "./ResourceEditor";

export default function NotesTab({ character, onUpdate, saving }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const notes = [...(character.notes || [])].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
  );
  const visible = notes.filter((note) =>
    `${note.title} ${note.content}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  );
  const selectedNote = notes.find((note) => note._id === selected);
  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("es-MX", {
          day: "numeric",
          month: "short",
        })
      : "Tu aventura";
  return (
    <section className="collection-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Que no se pierda la historia</p>
          <h2>Diario de aventuras</h2>
        </div>
        <button
          className="button primary compact"
          disabled={saving}
          onClick={() => setEditor({ item: null })}
        >
          <Icon name="plus" size={17} />
          Escribir
        </button>
      </div>
      <label className="search-field">
        <Icon name="search" />
        <input
          aria-label="Buscar notas"
          placeholder="Busca una pista, un nombre, un recuerdo…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <p className="journal-count">
        {visible.length}{" "}
        {visible.length === 1
          ? "recuerdo de tu aventura"
          : "recuerdos de tu aventura"}
      </p>
      <div className="journal-grid">
        {visible.map((note) => (
          <button
            key={note._id}
            className="journal-card"
            onClick={() => setSelected(note._id)}
          >
            <time dateTime={note.date}>
              <Icon name="note" size={13} />
              {formatDate(note.date)}
            </time>
            <h3>{note.title || "Una nueva historia"}</h3>
            <p>{note.content}</p>
          </button>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Icon name="note" size={32} />
          <h3>
            {search
              ? "Todavía no hay pistas con ese nombre"
              : "Toda aventura merece contarse"}
          </h3>
          <p>
            {search
              ? "Prueba otra palabra para encontrar tu nota."
              : "Guarda nombres, misiones pendientes y esos detalles que tu DM dejó caer."}
          </p>
        </div>
      )}
      {selectedNote && (
        <BottomSheet
          title={selectedNote.title || "Diario"}
          subtitle={formatDate(selectedNote.date)}
          onClose={() => setSelected(null)}
        >
          <p className="detail-description">{selectedNote.content}</p>
          <div className="detail-footer">
            <button
              className="button secondary"
              onClick={() => {
                setEditor({ item: selectedNote });
                setSelected(null);
              }}
            >
              <Icon name="edit" />
              Editar
            </button>
            <button
              className="button danger"
              onClick={() => {
                setDeleting(selectedNote);
                setSelected(null);
              }}
            >
              <Icon name="trash" />
              Eliminar
            </button>
          </div>
        </BottomSheet>
      )}
      {editor && (
        <ResourceEditor
          kind="note"
          item={editor.item}
          onClose={() => setEditor(null)}
          onSave={(data) =>
            onUpdate({
              notes: editor.item
                ? character.notes.map((note) =>
                    note._id === data._id ? data : note,
                  )
                : [...(character.notes || []), data],
            })
          }
        />
      )}
      {deleting && (
        <DeleteSheet
          name={deleting.title || "Nota"}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            onUpdate({
              notes: character.notes.filter(
                (note) => note._id !== deleting._id,
              ),
            })
          }
        />
      )}
    </section>
  );
}
