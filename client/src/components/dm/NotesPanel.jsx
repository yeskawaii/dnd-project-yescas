import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";
import { newId, noteLabels } from "../../utils/dmWorkspace";

function NoteForm({ note, onSave, onClose }) {
  const [draft, setDraft] = useState(
    note || {
      id: newId(),
      title: "",
      category: "session",
      content: "",
      pinned: false,
    },
  );
  return (
    <BottomSheet
      title={note ? "Editar nota" : "Nueva nota"}
      subtitle="Solo tú puedes ver este diario"
      onClose={onClose}
    >
      <form
        className="resource-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...draft, title: draft.title.trim() });
        }}
      >
        <label className="form-field">
          Título
          <input
            required
            maxLength={160}
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
            placeholder="Sesión 4 · La promesa del guardián"
          />
        </label>
        <label className="form-field">
          Categoría
          <select
            value={draft.category}
            onChange={(event) =>
              setDraft({ ...draft, category: event.target.value })
            }
          >
            {Object.entries(noteLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          Notas
          <textarea
            rows={12}
            maxLength={20000}
            value={draft.content}
            onChange={(event) =>
              setDraft({ ...draft, content: event.target.value })
            }
            placeholder="Resumen, pistas, decisiones de los jugadores y lo que viene después…"
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={draft.pinned}
            onChange={(event) =>
              setDraft({ ...draft, pinned: event.target.checked })
            }
          />
          Fijar al principio
        </label>
        <button className="button primary" disabled={!draft.title.trim()}>
          Guardar nota
        </button>
      </form>
    </BottomSheet>
  );
}

export default function NotesPanel({ notes, onChange, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = notes
    .filter(
      (note) =>
        (category === "all" || category === note.category) &&
        `${note.title} ${note.content}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">La memoria de tu mundo</p>
          <h2>Diario del DM</h2>
        </div>
        <button
          className="button primary compact"
          disabled={notes.length >= 300}
          onClick={() => setEditing({})}
        >
          <Icon name="plus" size={17} />
          Nueva nota
        </button>
      </div>
      <p className="helper-text">
        Sesiones, misiones, lugares y secretos. Estas notas son privadas del
        Dungeon Master.
      </p>
      <div className="dm-filter-row">
        <label className="form-field">
          Buscar notas
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Título, pista o personaje…"
          />
        </label>
        <label className="form-field">
          Categoría
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">Todas</option>
            {Object.entries(noteLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="dm-notes-grid">
        {filtered.map((note) => (
          <article className="surface dm-note-card" key={note.id}>
            <p className="eyebrow">
              {note.pinned ? "★ " : ""}
              {noteLabels[note.category]}
            </p>
            <h3>{note.title}</h3>
            <p className="dm-prose">
              {note.content || "Sin contenido todavía."}
            </p>
            <div className="dm-actions">
              <button
                className="button secondary compact"
                onClick={() => setEditing(note)}
              >
                Abrir / editar
              </button>
              <button
                className="icon-button"
                aria-label={`Eliminar nota ${note.title}`}
                onClick={() =>
                  onDelete(
                    "Eliminar nota",
                    `Se eliminará «${note.title}» del diario.`,
                    () =>
                      onChange(notes.filter((entry) => entry.id !== note.id)),
                  )
                }
              >
                <Icon name="trash" size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Icon name="note" size={30} />
          <h3>
            {notes.length
              ? "Sin coincidencias"
              : "Tu próxima sesión empieza aquí"}
          </h3>
          <p>
            {notes.length
              ? "Prueba otra búsqueda o categoría."
              : "Guarda el resumen, las pistas y las decisiones de tu grupo."}
          </p>
        </div>
      )}
      {editing && (
        <NoteForm
          note={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={(note) => {
            onChange(
              notes.some((entry) => entry.id === note.id)
                ? notes.map((entry) => (entry.id === note.id ? note : entry))
                : [...notes, note],
            );
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
