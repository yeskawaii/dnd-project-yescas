import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/auth-context";
import { Toaster, toast } from "sonner";
import Icon from "../components/ui/Icon";

export default function Login() {
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useContext(AuthContext);
  const submit = async (event) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const { data } = await api.post(
        register ? "/auth/register" : "/auth/login",
        form,
      );
      if (register) {
        setRegister(false);
        setForm({ username: "", password: "" });
        toast.success("Cuenta creada. Ya puedes entrar a tu aventura.");
      } else login(data.user, data.token);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "No se pudo conectar. Inténtalo de nuevo.",
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="entry-page">
      <Toaster position="top-center" richColors theme="dark" />
      <header className="entry-topbar">
        <div className="wordmark">
          <Icon name="dice" size={25} />
          Grimorio
        </div>
        <span className="edition-pill">D&D 3.5</span>
      </header>
      <div className="login-panel">
        <div className="entry-heading">
          <p className="eyebrow">Tu lugar en la mesa</p>
          <h1>
            {register ? (
              <>
                Una nueva <em>leyenda.</em>
              </>
            ) : (
              <>
                La aventura <em>continúa.</em>
              </>
            )}
          </h1>
          <p>
            {register
              ? "Crea tu cuenta y empieza a escribir tu historia."
              : "Entra para encontrar tus personajes y volver a la partida."}
          </p>
        </div>
        <form onSubmit={submit}>
          <label className="form-field">
            Nombre de aventurero
            <input
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  username: event.target.value,
                }))
              }
              placeholder="Tu nombre de usuario"
            />
          </label>
          <label className="form-field">
            Contraseña
            <input
              type="password"
              required
              autoComplete={register ? "new-password" : "current-password"}
              value={form.password}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
              placeholder="Tu palabra secreta"
            />
          </label>
          <button className="button primary full-width" disabled={pending}>
            {pending
              ? "Abriendo la aventura…"
              : register
                ? "Crear mi cuenta"
                : "Entrar a la aventura"}
            <Icon name="chevron" size={17} />
          </button>
        </form>
        <div className="login-switch">
          <p>
            {register
              ? "¿Ya tienes una historia aquí?"
              : "¿Es tu primera visita?"}
          </p>
          <button
            className="text-button"
            disabled={pending}
            onClick={() => {
              setRegister((value) => !value);
              setForm({ username: "", password: "" });
            }}
          >
            {register ? "Entrar con mi cuenta" : "Crear una cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
