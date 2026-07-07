import { Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface EliteBannerProps {
  isElite: boolean;
  onUpgrade: () => void;
  lang: 'es' | 'en';
}

export default function EliteBanner({ isElite, onUpgrade, lang }: EliteBannerProps) {
  const t = {
    es: {
      title: "Membresía Élite",
      desc: "Desbloquea el Motor de Evaluación IA cognitivo y genera cuestionarios interactivos de 10 preguntas desde tus PDFs.",
      price: "$4.99/mes",
      cta: "Activar Plan Élite",
      active: "Suscripción Élite Activa",
      premiumFeatures: "Cuestionarios Interactivos IA e Incremento de EXP habilitados."
    },
    en: {
      title: "Elite Membership",
      desc: "Unlock the Cognitive AI Evaluation Engine to generate interactive 10-question quizzes directly from your PDFs.",
      price: "$4.99/mo",
      cta: "Upgrade to Elite",
      active: "Elite Membership Active",
      premiumFeatures: "Interactive AI Quizzes & EXP Multiplier active."
    }
  }[lang];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      id="elite-subscription-banner" 
      className={`p-4 rounded-3xl border relative overflow-hidden ${
        isElite 
          ? 'bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 border-amber-500/30 text-amber-200' 
          : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/20 text-indigo-200'
      }`}
    >
      {/* Absolute glow effects */}
      <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl" />
      
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isElite ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
          {isElite ? <ShieldCheck className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide uppercase">
              {t.title}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isElite ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white'}`}>
              {isElite ? "VIP" : "PLUS"}
            </span>
          </div>
          
          <p className="text-xs text-slate-400 leading-normal">
            {isElite ? t.premiumFeatures : t.desc}
          </p>

          <div className="pt-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {isElite ? t.active : t.price}
            </span>
            
            {!isElite && (
              <button 
                onClick={onUpgrade}
                className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                {t.cta}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
