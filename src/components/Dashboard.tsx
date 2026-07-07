import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Bell, UserPlus, Search, UserCheck, AlertTriangle, Sparkles, CheckSquare, Zap, Activity, Brain, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, Notification, Task, User } from '../types';

const studyChallenges = [
  {
    id: "challenge-1",
    titleEs: "Método Pomodoro en Redes Neuronales",
    titleEn: "Pomodoro Session in Neural Networks",
    descEs: "Realiza una sesión de 25 minutos sin distracciones sobre el algoritmo de Backpropagation.",
    descEn: "Complete a 25-minute distraction-free session on Backpropagation.",
    xp: 150,
    icon: "🧠",
    subject: "IA Avanzada"
  },
  {
    id: "challenge-2",
    titleEs: "Explicación Feynman de Álgebra Lineal",
    titleEn: "Feynman Technique in Linear Algebra",
    descEs: "Explica a un compañero o grábate explicando la multiplicación de matrices en términos ultra-simples.",
    descEn: "Explain matrix multiplication in ultra-simple terms to a friend or record yourself.",
    xp: 200,
    icon: "💡",
    subject: "Matemáticas"
  },
  {
    id: "challenge-3",
    titleEs: "Autocorrección Ética en Filosofía",
    titleEn: "Ethical Self-Review in Philosophy",
    descEs: "Revisa los argumentos de tu ensayo de Ética Profesional y encuentra al menos una falacia potencial.",
    descEn: "Review the arguments of your Professional Ethics essay and find at least one potential fallacy.",
    xp: 120,
    icon: "⚖️",
    subject: "Filosofía"
  },
  {
    id: "challenge-4",
    titleEs: "Sesión de Co-estudio en Sinergia",
    titleEn: "Co-study Session in Synergy",
    descEs: "Inicia un chat de grupo y comparte un documento de estudio relevante para la entrega grupal.",
    descEn: "Start a group chat and share a relevant study document for the team project.",
    xp: 180,
    icon: "🤝",
    subject: "Sinergia de Equipo"
  },
  {
    id: "challenge-5",
    titleEs: "Repaso de Intervalo Activo (Active Recall)",
    titleEn: "Active Recall Interval Quiz",
    descEs: "Hazte 5 preguntas clave de tu temario académico sin mirar los apuntes y califica tu nivel de retención.",
    descEn: "Ask yourself 5 key questions of your academic syllabus without looking at notes and rate your recall.",
    xp: 160,
    icon: "⚡",
    subject: "General"
  }
];

interface DashboardProps {
  user: User;
  friends: Friend[];
  notifications: Notification[];
  tasks: Task[];
  onAddFriend: (email: string) => void;
  onAcceptFriend: (email: string) => void;
  onAcceptTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  lang: 'es' | 'en';
}

export default function Dashboard({
  user,
  friends,
  notifications,
  tasks,
  onAddFriend,
  onAcceptFriend,
  onAcceptTask,
  onRejectTask,
  lang,
}: DashboardProps) {
  // Live Clock
  const [timeStr, setTimeStr] = useState('');

  // Study timer (Timer analítico acumulado)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Search friend state
  const [searchEmail, setSearchEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // AI Academic Booster States
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState('');

  useEffect(() => {
    // Update live clock
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  useEffect(() => {
    // Accumulated study timer runner
    let tInterval: any = null;
    if (isTimerRunning) {
      tInterval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(tInterval);
    }
    return () => clearInterval(tInterval);
  }, [isTimerRunning]);

  const formatElapsedTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFriendSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    onAddFriend(searchEmail.trim());
    setSuccessMsg(lang === 'es' ? `¡Solicitud de amistad enviada a ${searchEmail}!` : `Friend request sent to ${searchEmail}!`);
    setSearchEmail('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Compile chronological notifications + alerts for closest upcoming tasks (due within a week)
  const getActiveAlertsAndNotifications = () => {
    const alerts: Array<{ id: string; text: string; type: 'alert' | 'notify'; date: string; action?: any }> = [];

    // 1. Task deadlines alerts (within 7 days)
    const nowMs = new Date().setHours(0,0,0,0);
    tasks.forEach(t => {
      if (t.completed) return;
      const deadlineMs = new Date(t.deadline).getTime();
      const diffDays = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `alert-task-${t.id}`,
          text: lang === 'es' 
            ? `⚠️ Entrega Próxima: "${t.title}" vence en ${diffDays === 0 ? 'hoy' : `${diffDays} día(s)`} (${t.deadline})` 
            : `⚠️ Upcoming task: "${t.title}" is due in ${diffDays === 0 ? 'today' : `${diffDays} day(s)`} (${t.deadline})`,
          type: 'alert',
          date: t.deadline
        });
      }
    });

    // 2. Add system notifications
    notifications.forEach(n => {
      alerts.push({
        id: n.id,
        text: n.text,
        type: 'notify',
        date: n.timestamp,
        action: n
      });
    });

    // Sort chronologically (closest or most recent first)
    return alerts;
  };

  const notificationFeed = getActiveAlertsAndNotifications();

  // Stats
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <div id="panel-central-section" className="space-y-6">
      {/* Welcome & Clock Block */}
      <div className="p-6 rounded-3xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              <Zap className="w-4 h-4 animate-bounce" />
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">
              {lang === 'es' ? 'SISTEMA DE GESTIÓN ACTIVA' : 'ACTIVE MANAGEMENT SYSTEM'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {lang === 'es' 
              ? `¡Hola, ${user.name || 'Estudiante'}! Listo para superar tus límites hoy` 
              : `Hello, ${user.name || 'Student'}! Ready to push your limits today`}
          </h2>
          <p className="text-xs text-slate-400 max-w-lg">
            {lang === 'es' 
              ? 'Organiza tus materias, repasa tus notas cognitivas y compite amistosamente en el ranking escolar en tiempo real.' 
              : 'Organize your classes, review cognitive notes, and compete with friends on the live leaderboards.'}
          </p>
        </div>

        {/* Dynamic Digital Clock */}
        <div className="flex items-center gap-4 bg-slate-950/60 px-5 py-3 border border-slate-800 rounded-2xl self-start md:self-auto shadow-inner">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin-slow" />
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {lang === 'es' ? 'Hora Local' : 'Local Time'}
            </div>
            <div className="text-lg font-black font-mono text-white tracking-widest">
              {timeStr || '--:--:--'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timer & Friends */}
        <div className="space-y-6">
          {/* Analytical Study Timer Card */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden flex flex-col justify-between h-[230px]">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                {lang === 'es' ? 'Contador Analítico' : 'Analytical Timer'}
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                {lang === 'es' ? 'Mide acumulativamente el tiempo que dedicas hoy a tus estudios.' : 'Track the cumulative hours spent on academic tasks today.'}
              </p>
            </div>

            <div className="text-center py-2">
              <span className="text-4xl font-black font-mono text-indigo-300 tracking-widest drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                {formatElapsedTime(elapsedSeconds)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
                  isTimerRunning 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{lang === 'es' ? 'Pausar' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{lang === 'es' ? 'Iniciar' : 'Start'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add Online Friends Widget */}
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between h-[230px]">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                {lang === 'es' ? 'Conectar Estudiantes' : 'Connect Students'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'es' ? 'Busca y agrega amigos académicos por correo para el chat de Sinergia y Ranking.' : 'Add academic friends by email to enable real-time collaboration & rankings.'}
              </p>
            </div>

            <form onSubmit={handleFriendSearch} className="mt-3 relative flex gap-2">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="sofia.academico@gmail.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!searchEmail.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-md active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-[10px] flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Micro Online list */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {friends.slice(0, 4).map((f) => (
                <div key={f.id} className="relative group flex-shrink-0" title={`${f.name} - ${f.status === 'accepted' ? 'Amigos' : 'Pendiente'}`}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    className={`w-7 h-7 rounded-full border-2 ${f.status === 'accepted' ? 'border-emerald-500' : 'border-amber-500'}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                    }}
                  />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-900 ${f.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                </div>
              ))}
              {friends.length === 0 && (
                <span className="text-[10px] text-slate-500 italic">
                  {lang === 'es' ? 'No tienes amigos agregados aún.' : 'No friends connected yet.'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: AI Academic Booster Widget */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-card flex flex-col justify-between h-[484px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                    <Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {lang === 'es' ? 'Impulsor Académico IA' : 'AI Academic Booster'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'es' ? 'Optimiza tu rendimiento cognitivo y completa desafíos.' : 'Optimize cognitive performance and complete study challenges.'}
                    </p>
                  </div>
                </div>
                {earnedXp > 0 && (
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    +{earnedXp} XP
                  </span>
                )}
              </div>

              {/* Dynamic Challenge Card */}
              <AnimatePresence mode="wait">
                {!isRotating && (
                  <motion.div
                    key={challengeIndex}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4 text-left relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1 bg-white/5 rounded-xl">{studyChallenges[challengeIndex].icon}</span>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 block">
                            {studyChallenges[challengeIndex].subject}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {lang === 'es' ? studyChallenges[challengeIndex].titleEs : studyChallenges[challengeIndex].titleEn}
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg font-bold">
                        +{studyChallenges[challengeIndex].xp} XP
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'es' ? studyChallenges[challengeIndex].descEs : studyChallenges[challengeIndex].descEn}
                    </p>

                    {/* Success notification banner */}
                    {challengeSuccess === studyChallenges[challengeIndex].id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>
                          {lang === 'es' 
                            ? '¡Excelente! Desafío completado y registrado para tu rendimiento diario.' 
                            : 'Excellent! Challenge completed and saved to your active performance logs.'}
                        </span>
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      {completedChallenges.includes(studyChallenges[challengeIndex].id) ? (
                        <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <UserCheck className="w-4 h-4" />
                          {lang === 'es' ? 'Desafío Completado' : 'Challenge Completed'}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCompletedChallenges(prev => [...prev, studyChallenges[challengeIndex].id]);
                            setEarnedXp(prev => prev + studyChallenges[challengeIndex].xp);
                            setChallengeSuccess(studyChallenges[challengeIndex].id);
                          }}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                        >
                          {lang === 'es' ? 'Completar Desafío' : 'Complete Challenge'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsRotating(true);
                          setChallengeSuccess('');
                          setTimeout(() => {
                            setChallengeIndex(prev => (prev + 1) % studyChallenges.length);
                            setIsRotating(false);
                          }, 200);
                        }}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all flex items-center justify-center border border-white/10"
                        title={lang === 'es' ? 'Siguiente recomendación' : 'Next recommendation'}
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cognitive Flow Stats Dashboard Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
                  {lang === 'es' ? 'Tasa Retención' : 'Retention Rate'}
                </div>
                <div className="text-sm font-black text-indigo-400 mt-0.5">88%</div>
              </div>
              <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
                  {lang === 'es' ? 'Enfoque Promedio' : 'Average Focus'}
                </div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">94%</div>
              </div>
              <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
                  {lang === 'es' ? 'Completados' : 'Completed'}
                </div>
                <div className="text-sm font-black text-amber-400 mt-0.5">{completedChallenges.length} / {studyChallenges.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
