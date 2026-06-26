import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
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
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, title: "", msg: "", action: null });

  const askDelete = (title, msg, action) => {
    setDeleteAlert({ isOpen: true, title, msg, action });
  };

  useEffect(() => {
    if (user) {
      api.get("/character")
        .then((res) => setCharacters(res.data.filter(Boolean)))
        .catch(() => toast.error("Error de conexión al cargar héroes"));
    }
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

      {mode === "lobby" && <Lobby onSelectMode={setMode} logout={logout} />}
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
          character={selectedChar}
          setCharacters={setCharacters}
          setSelectedChar={setSelectedChar}
          setMode={setMode}
          logout={logout}
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