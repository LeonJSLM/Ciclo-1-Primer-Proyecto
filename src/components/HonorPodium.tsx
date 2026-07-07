import { Award, Trophy, Star, Shield, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  exp: number;
  isOnline: boolean;
  eliteMember: boolean;
}

interface HonorPodiumProps {
  ranking: LeaderboardUser[];
  currentUser: User;
  lang: 'es' | 'en';
}

export default function HonorPodium({ ranking, currentUser, lang }: HonorPodiumProps) {
  // Extract top 3 for visual podium
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const getTrophyColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-400"; // Gold
      case 1: return "text-slate-300";  // Silver
      case 2: return "text-amber-600";  // Bronze
      default: return "text-slate-500";
    }
  };

  return (
    <div id="honor-podium-section" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-5.5 h-5.5 text-yellow-500 animate-bounce" />
          {lang === 'es' ? 'Podio de Honor' : 'Honor Podium'}
        </h2>
        <p className="text-xs text-slate-400">
          {lang === 'es' ? 'Clasificación competitiva de rendimiento escolar en tiempo real basada en tus respuestas correctas.' : 'Live competitive rankings based on quiz success.'}
        </p>
      </div>

      {/* Graphical Podium Display */}
      {ranking.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-end max-w-md mx-auto pt-8 pb-4">
          
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <img 
                  src={top3[1].avatar} 
                  className="w-12 h-12 rounded-full border-2 border-slate-300"
                />
                <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-950 rounded-full w-5 h-5 text-[10px] font-black flex items-center justify-center">2</span>
              </div>
              <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-20 text-center">{top3[1].name}</span>
              <span className="text-[9px] text-slate-400 font-mono">{top3[1].exp} XP</span>
              <div className="w-full glass border-t-2 border-slate-300 h-16 rounded-t-xl mt-2 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-slate-300" />
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative -top-3">
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-4 left-1/2 -translate-x-1/2 animate-pulse" />
                <img 
                  src={top3[0].avatar} 
                  className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow-lg"
                />
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 rounded-full w-6 h-6 text-xs font-black flex items-center justify-center">1</span>
              </div>
              <span className="text-xs font-bold text-yellow-400 -mt-1 truncate w-24 text-center">{top3[0].name}</span>
              <span className="text-[10px] text-slate-300 font-mono font-bold">{top3[0].exp} XP</span>
              <div className="w-full glass border-t-4 border-yellow-400 h-24 rounded-t-xl mt-2 flex flex-col items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-yellow-400" />
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <img 
                  src={top3[2].avatar} 
                  className="w-11 h-11 rounded-full border-2 border-amber-600"
                />
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 text-[10px] font-black flex items-center justify-center">3</span>
              </div>
              <span className="text-[10px] font-bold text-amber-500 mt-2 truncate w-20 text-center">{top3[2].name}</span>
              <span className="text-[9px] text-slate-400 font-mono">{top3[2].exp} XP</span>
              <div className="w-full glass border-t-2 border-amber-600 h-12 rounded-t-xl mt-2 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* Standard Classification Board */}
      <div className="p-4 glass-card rounded-3xl max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2.5 mb-2.5">
          <span>{lang === 'es' ? 'Rango / Estudiante' : 'Rank / Student'}</span>
          <span>{lang === 'es' ? 'Suscripción' : 'Sub'}</span>
          <span>{lang === 'es' ? 'Experiencia (EXP)' : 'Experience'}</span>
        </div>

        <div className="space-y-2">
          {ranking.map((usr, index) => {
            const isMe = usr.email.toLowerCase() === currentUser.email.toLowerCase();
            return (
              <div
                key={usr.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isMe 
                    ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-200' 
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-black text-slate-500 w-5">
                    #{index + 1}
                  </span>
                  
                  <div className="relative">
                    <img
                      src={usr.avatar}
                      className="w-8 h-8 rounded-full border border-slate-800"
                    />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-900 ${usr.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  </div>

                  <div className="text-left">
                    <span className={`text-xs font-bold block ${isMe ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {usr.name} {isMe && `(${lang === 'es' ? 'Tú' : 'You'})`}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{usr.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Premium Tag */}
                  <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    usr.eliteMember 
                      ? 'bg-amber-500/15 border border-amber-500/20 text-amber-300' 
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}>
                    {usr.eliteMember ? "Élite" : "Básico"}
                  </span>

                  {/* XP */}
                  <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-mono font-black">{usr.exp} <span className="text-[9px] text-slate-500">XP</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
