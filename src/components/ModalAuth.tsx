import React, { useState } from 'react';
import { LogIn, Mail, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string, isElite: boolean) => void;
  lang: 'es' | 'en';
}

export default function ModalAuth({ isOpen, onClose, onLoginSuccess, lang }: ModalAuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('leonjslm@gmail.com'); // Autofill with user email for frictionless premium experience
  const [name, setName] = useState('Leon');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // Simulate real high-fidelity Google OAuth2 sequence
    setErrorMsg('');
    const googleEmail = email || 'leonjslm@gmail.com';
    const googleName = googleEmail.split('@')[0].replace('.', ' ');
    const formattedName = googleName.charAt(0).toUpperCase() + googleName.slice(1);
    
    onLoginSuccess(formattedName, googleEmail, true); // Log in and unlock Elite status for premium demo!
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg(lang === 'es' ? 'El correo es obligatorio.' : 'Email is required.');
      return;
    }
    if (isRegister && !name) {
      setErrorMsg(lang === 'es' ? 'El nombre es obligatorio.' : 'Name is required.');
      return;
    }
    
    // Simulate logging in
    onLoginSuccess(isRegister ? name : email.split('@')[0], email, false);
  };

  const t = {
    es: {
      title: "Autenticación Obligatoria",
      subtitle: "Para interactuar con la agenda de tareas, cursos de trayectoria, calendario y el chat en tiempo real, es necesario autenticar tu cuenta de estudiante.",
      googleBtn: "Iniciar sesión con Google",
      or: "o ingresa con tus credenciales",
      email: "Correo Electrónico Académico",
      name: "Nombre Completo",
      pass: "Contraseña",
      login: "Iniciar Sesión",
      register: "Registrarse",
      haveAccount: "¿Ya tienes cuenta? Inicia sesión",
      needAccount: "¿No tienes cuenta académica? Regístrate gratis",
      lockAlert: "La acción solicitada requiere una sesión activa."
    },
    en: {
      title: "Authentication Required",
      subtitle: "To interact with the task schedule, courses, calendar, and real-time chat, you must authenticate your student account.",
      googleBtn: "Sign in with Google",
      or: "or sign in with credentials",
      email: "Academic Email",
      name: "Full Name",
      pass: "Password",
      login: "Sign In",
      register: "Sign Up",
      haveAccount: "Already have an account? Sign In",
      needAccount: "No account? Sign up for free",
      lockAlert: "The requested action requires an active session."
    }
  }[lang];

  return (
    <AnimatePresence>
      <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          id="auth-modal-card" 
          className="relative w-full max-w-md overflow-hidden glass-card rounded-3xl shadow-2xl p-6 md:p-8"
        >
          {/* Neon Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600" />

          {/* Close trigger for pre-viewers */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 p-1.5 rounded-full transition-colors text-xs"
          >
            ✕
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {t.title}
            </h3>
            
            <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-sm">
              {t.subtitle}
            </p>

            <div className="w-full flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl mt-4 text-xs text-left">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{t.lockAlert}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.89 3.02C6.21 7.57 8.87 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.88c2.18-2.01 3.71-4.97 3.71-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.78a7.02 7.02 0 0 1 0-4.15L1.39 7.56a11.95 11.95 0 0 0 0 11.29l3.89-3.07z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.72-2.88c-1.03.69-2.35 1.1-3.95 1.1-3.13 0-5.79-2.53-6.72-5.54l-3.89 3.01C3.37 20.35 7.35 23 12 23z"
                />
              </svg>
              <span>{t.googleBtn}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{t.or}</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Custom Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              {isRegister && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {t.name}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Leon JS"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="leonjslm@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {t.pass}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3 pr-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isRegister ? t.register : t.login}</span>
              </button>
            </form>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors mt-2"
            >
              {isRegister ? t.haveAccount : t.needAccount}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
