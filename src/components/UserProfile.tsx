import { Award, Shield, CheckCircle2, ListTodo, LogOut, Flame, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface UserProfileProps {
  user: User;
  coursesCount: number;
  tasksCount: number;
  completedTasksCount: number;
  onLogout: () => void;
  lang: 'es' | 'en';
}

export default function UserProfile({
  user,
  coursesCount,
  tasksCount,
  completedTasksCount,
  onLogout,
  lang,
}: UserProfileProps) {
  // Rank name based on EXP
  const getAcademicRankName = (exp: number) => {
    if (exp >= 500) return lang === 'es' ? '🧠 Sabio de Sinergia' : '🧠 Synergy Sage';
    if (exp >= 300) return lang === 'es' ? '🚀 Estudioso Élite' : '🚀 Scholar Elite';
    if (exp >= 150) return lang === 'es' ? '📚 Aprendiz Destacado' : '📚 Promising Apprentice';
    return lang === 'es' ? '🌱 Explorador Académico' : '🌱 Academic Explorer';
  };

  return (
    <div id="user-profile-section" className="max-w-xl mx-auto space-y-6">
      
      {/* Profile Card Summary */}
      <div className="p-6 glass-card rounded-3xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Elite glowing ring */}
        <div className="relative">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            className={`w-20 h-20 rounded-full object-cover border-4 ${user.eliteMember ? 'border-amber-500' : 'border-indigo-600'}`}
          />
          {user.eliteMember && (
            <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-1 rounded-full border border-slate-900" title="Membresía Élite">
              <Star className="w-4 h-4 fill-slate-950" />
            </span>
          )}
        </div>

        <h3 className="text-lg font-black text-white mt-4">{user.name}</h3>
        <p className="text-xs text-slate-500 font-mono">{user.email}</p>

        {/* Academic Rank & Badge */}
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>{getAcademicRankName(user.exp)}</span>
        </div>

        <div className="mt-2 text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>Streak: 5 {lang === 'es' ? 'Días Activos' : 'Active Days'}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="p-4 glass-card rounded-3xl text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
            {lang === 'es' ? 'Asignaturas Registradas' : 'Active Subjects'}
          </span>
          <span className="text-2xl font-black text-indigo-400 mt-1 block">
            {coursesCount}
          </span>
        </div>

        <div className="p-4 glass-card rounded-3xl text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
            {lang === 'es' ? 'Tareas Completadas' : 'Tasks Completed'}
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {completedTasksCount} <span className="text-xs text-slate-500 font-normal">/ {tasksCount}</span>
          </span>
        </div>

      </div>

      {/* Interactive Logout button */}
      <div className="flex justify-center">
        <button
          onClick={onLogout}
          className="px-6 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'es' ? 'Cerrar Sesión de Estudiante' : 'Log Out Academic Account'}</span>
        </button>
      </div>

    </div>
  );
}
