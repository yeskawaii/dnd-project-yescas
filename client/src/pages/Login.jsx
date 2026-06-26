import { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Toaster, toast } from 'sonner';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    const promise = api.post(endpoint, form);

    toast.promise(promise, {
      loading: isRegister ? 'Forjando tu destino...' : 'Abriendo la taberna...',
      success: (res) => {
        if (isRegister) {
          setIsRegister(false);
          setForm({ username: '', password: '' });
          return "¡Cuenta creada! Ahora identifícate, viajero.";
        } else {
          login(res.data.user, res.data.token);
          return `¡De vuelta a la acción, ${res.data.user.username}!`;
        }
      },
      error: (err) => err.response?.data?.error || "La red falló, tira de nuevo.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" richColors theme="dark" />

      {/* Orbes de luz de fondo para el Login */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="w-full max-w-sm relative z-10">
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          
          <div className="flex flex-col items-center mb-8">
            <span className={`text-5xl mb-4 transition-transform duration-700 ${isRegister ? 'rotate-[360deg] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'rotate-0 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}>
              {isRegister ? '📜' : '🗝️'}
            </span>
            <h2 className={`text-2xl font-bold tracking-wider uppercase transition-colors duration-500 ${isRegister ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isRegister ? 'Registro de Héroe' : 'La Taberna'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase mt-1">
              {isRegister ? 'Paso 1: Crea tu Leyenda' : 'Paso 0: Identifícate'}
            </p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Aventurero</label>
              <input 
                type="text" required value={form.username}
                className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-amber-400/50 focus:bg-white/5 transition-all shadow-inner"
                onChange={e => setForm({...form, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block ml-1 uppercase tracking-widest">Palabra Secreta</label>
              <input 
                type="password" required value={form.password}
                className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-amber-400/50 focus:bg-white/5 transition-all shadow-inner"
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>
          
          <button className={`w-full mt-8 p-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg border ${
            isRegister 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
          }`}>
            {isRegister ? 'Comenzar Crónica' : 'Entrar al Juego'}
          </button>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">
              {isRegister ? '¿Ya eres de los nuestros?' : '¿Aún no tienes ficha?'}
            </p>
            <button 
              type="button"
              onClick={() => {
                  setIsRegister(!isRegister);
                  setForm({ username: '', password: '' });
              }}
              className={`text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-full border transition-all ${
                isRegister 
                  ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' 
                  : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              {isRegister ? 'Ir al Login' : 'Crear Ficha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;