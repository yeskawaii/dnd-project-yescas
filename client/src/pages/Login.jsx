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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Toaster position="top-center" richColors theme="dark" />

      {/* Contenedor con borde que cambia de color según el modo */}
      <div className={`w-full max-w-sm p-1 rounded-2xl transition-all duration-500 bg-gradient-to-b ${isRegister ? 'from-emerald-500 to-slate-900' : 'from-orange-500 to-slate-900'}`}>
        
        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl w-full shadow-2xl">
          
          {/* ICONO Y TÍTULO DINÁMICO */}
          <div className="flex flex-col items-center mb-8">
            <span className={`text-4xl mb-2 transition-transform duration-500 ${isRegister ? 'rotate-[360deg]' : 'rotate-0'}`}>
              {isRegister ? '📜' : '🔑'}
            </span>
            <h2 className={`text-2xl font-black uppercase tracking-tighter transition-colors duration-500 ${isRegister ? 'text-emerald-500' : 'text-orange-500'}`}>
              {isRegister ? 'Registro de Héroe' : 'Acceso a la Taberna'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em]">
              {isRegister ? 'PASO 1: CREA TU LEYENDA' : 'PASO 0: IDENTIFÍCATE'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block ml-1">NOMBRE DE USUARIO</label>
              <input 
                type="text" required value={form.username}
                className="w-full bg-slate-800 p-3 rounded-lg text-white outline-none focus:ring-2 transition-all ring-offset-2 ring-offset-slate-900 focus:ring-slate-700"
                onChange={e => setForm({...form, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block ml-1">CONTRASEÑA MÁGICA</label>
              <input 
                type="password" required value={form.password}
                className="w-full bg-slate-800 p-3 rounded-lg text-white outline-none focus:ring-2 transition-all ring-offset-2 ring-offset-slate-900 focus:ring-slate-700"
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>
          
          {/* BOTÓN CON COLOR DINÁMICO */}
          <button className={`w-full mt-8 p-3 rounded-lg font-black uppercase text-xs transition-all active:scale-95 shadow-lg ${
            isRegister 
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' 
              : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20'
          }`}>
            {isRegister ? 'Comenzar Crónica' : 'Entrar'}
          </button>

          {/* BOTÓN DE CAMBIO MÁS VISIBLE */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-2">
              {isRegister ? '¿Ya eres de los nuestros?' : '¿Eres nuevo por aquí?'}
            </p>
            <button 
              type="button"
              onClick={() => {
                  setIsRegister(!isRegister);
                  setForm({ username: '', password: '' });
              }}
              className={`text-xs font-black uppercase tracking-tighter py-2 px-4 rounded-full border transition-all ${
                isRegister 
                  ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10' 
                  : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10'
              }`}
            >
              {isRegister ? 'Ir al Login' : 'Crear una Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;