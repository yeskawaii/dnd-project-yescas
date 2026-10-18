import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./context/auth-context";
import { Toaster, toast } from "sonner";
import api from "./api/axios";

// PÁGINAS PRINCIPALES
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import DMDashboard from "./pages/DMDashboard";
import CharacterSelect from "./pages/CharacterSelect";
import CharacterSheet from "./pages/CharacterSheet";

// COMPONENTES GLOBALES
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [mode, setMode] = useState("lobby"); // lobby | dm | player

  // ESTADO GLOBAL MODAL DE BORRADO
  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    title: "",
    msg: "",
    action: null,
  });

  const askDelete = (title, msg, action) => {
    setDeleteAlert({ isOpen: true, title, msg, action });
  };

  const handleLogout = () => {
    setSelectedChar(null);
    setCharacters([]);
    setMode("lobby");
    setDeleteAlert({ isOpen: false, title: "", msg: "", action: null });
    logout();
  };

  useEffect(() => {
    let active = true;
    if (user) {
      api
        .get("/character")
        .then((res) => {
          if (active) setCharacters(res.data.filter(Boolean));
        })
        .catch(() => {
          if (active) toast.error("No se pudieron cargar tus personajes");
        });
    }
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-black animate-pulse">
        CARGANDO...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-x-hidden">
      <Toaster position="top-center" richColors theme="dark" />

      {mode === "lobby" && (
        <Lobby onSelectMode={setMode} logout={handleLogout} />
      )}
      {mode === "dm" && <DMDashboard onBack={() => setMode("lobby")} />}

      {mode === "player" && !selectedChar && (
        <CharacterSelect
          characters={characters}
          setCharacters={setCharacters}
          setSelectedChar={setSelectedChar}
          setMode={setMode}
          askDelete={askDelete}
        />
      )}

      {mode === "player" && selectedChar && (
        <CharacterSheet
          key={selectedChar._id}
          character={selectedChar}
          setCharacters={setCharacters}
          setSelectedChar={setSelectedChar}
          logout={handleLogout}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteAlert.isOpen}
        title={deleteAlert.title}
        message={deleteAlert.msg}
        onClose={() => setDeleteAlert({ ...deleteAlert, isOpen: false })}
        onConfirm={() => {
          deleteAlert.action();
          setDeleteAlert({ ...deleteAlert, isOpen: false });
        }}
      />
    </div>
  );
}

export default App;
