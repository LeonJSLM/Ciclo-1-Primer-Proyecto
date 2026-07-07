import React, { useState } from 'react';
import { Settings, Globe, Palette, Upload, CheckCircle2, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemSettingsState, ThemeType } from '../types';

interface SystemSettingsProps {
  settings: SystemSettingsState;
  onUpdateSettings: (settings: Partial<SystemSettingsState>) => void;
  lang: 'es' | 'en';
}

export default function SystemSettings({
  settings,
  onUpdateSettings,
  lang,
}: SystemSettingsProps) {
  const [successMsg, setSuccessMsg] = useState('');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'es' | 'en';
    onUpdateSettings({ language: newLang });
    triggerSuccessMessage(newLang === 'es' ? 'Idioma actualizado con éxito.' : 'Language updated successfully.');
  };

  const handleThemeChange = (theme: ThemeType) => {
    onUpdateSettings({ theme });
    triggerSuccessMessage(lang === 'es' ? 'Estética visual aplicada.' : 'Visual style applied.');
  };

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateSettings({
            theme: 'custom',
            customWallpaperUrl: event.target.result as string
          });
          triggerSuccessMessage(lang === 'es' ? 'Fondo de pantalla personalizado cargado.' : 'Custom wallpaper loaded.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSuccessMessage = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const themeOptions: Array<{ id: ThemeType; nameEs: string; nameEn: string; colorClass: string }> = [
    { id: 'frosted', nameEs: 'Vidrio Esmerilado (Frosted Glass)', nameEn: 'Frosted Glass', colorClass: 'bg-white/10 backdrop-blur border-white/20' },
    { id: 'default', nameEs: 'Azul Espacial (Default)', nameEn: 'Space Blue', colorClass: 'bg-slate-900 border-indigo-600' },
    { id: 'landscape', nameEs: 'Paisaje Relajante', nameEn: 'Relaxing Landscape', colorClass: 'bg-gradient-to-r from-sky-800 to-amber-700' },
    { id: 'amoled', nameEs: 'Modo Oscuro Profundo (AMOLED)', nameEn: 'Amoled Black', colorClass: 'bg-black border-slate-900' },
    { id: 'vintage', nameEs: 'Amarillo Retro / Vintage', nameEn: 'Retro Vintage', colorClass: 'bg-[#faf6e9] border-[#4a3f35]' },
  ];

  return (
    <div id="system-settings-section" className="max-w-xl mx-auto space-y-6 text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-slate-400" />
          {lang === 'es' ? 'Ajustes de Sistema' : 'System Settings'}
        </h2>
        <p className="text-xs text-slate-400">
          {lang === 'es' ? 'Configura el idioma oficial de la plataforma y personaliza la estética visual.' : 'Configure official platform language and customize the visuals.'}
        </p>
      </div>

      <div className="p-6 glass-card rounded-3xl space-y-6">
        
        {/* Success Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Language */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            {lang === 'es' ? 'Idioma de Interfaz' : 'Interface Language'}
          </label>
          <p className="text-[10px] text-slate-500">
            {lang === 'es' ? 'Selecciona tu lenguaje académico preferido para toda la plataforma.' : 'Select your academic language for the entire platform.'}
          </p>
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="es">Español (ES)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>

        {/* Section 2: Presets Themes */}
        <div className="space-y-3 pt-4 border-t border-slate-800/60">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            {lang === 'es' ? 'Motor de Personalización de Temas' : 'Theming Visual presets'}
          </label>
          <p className="text-[10px] text-slate-500">
            {lang === 'es' ? 'Escoge una estética prediseñada para la interfaz de tus cursos y agenda.' : 'Pick a predefined visual preset style for your dashboard and syllabus.'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map((opt) => {
              const isSelected = settings.theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleThemeChange(opt.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected 
                      ? 'bg-indigo-600/15 border-indigo-500 text-white font-bold' 
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border border-slate-800 ${opt.colorClass}`} />
                  <span className="text-[11px] truncate">
                    {lang === 'es' ? opt.nameEs : opt.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Custom Wallpaper Upload */}
        <div className="space-y-2 pt-4 border-t border-slate-800/60">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            {lang === 'es' ? 'Subir Fondo de Pantalla Propio' : 'Custom Image Wallpaper'}
          </label>
          <p className="text-[10px] text-slate-500">
            {lang === 'es' ? 'Carga una imagen personalizada desde tu galería para usar de fondo en todo el sistema.' : 'Upload your own custom image from your gallery to set as background.'}
          </p>

          <div className="relative border border-dashed border-slate-850 hover:border-indigo-500/40 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/20 group">
            <input
              type="file"
              accept="image/*"
              onChange={handleCustomWallpaperUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Palette className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 mx-auto mb-1 transition-colors" />
            <span className="text-[11px] text-slate-500 group-hover:text-slate-400 block font-medium">
              {lang === 'es' ? 'Seleccionar Imagen de Galería' : 'Upload custom photo'}
            </span>
            <span className="text-[8px] text-slate-600 block mt-0.5">PNG, JPEG (Max 5MB)</span>
          </div>
        </div>

        {/* Section 4: Auto Adjustment theme by local time */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              {lang === 'es' ? 'Ajuste Automático por Hora' : 'Auto Adjust based on local hour'}
            </span>
            <p className="text-[10px] text-slate-500 max-w-sm">
              {lang === 'es' 
                ? 'Sincroniza tu estética con tu hora local para alternar a modo AMOLED por las noches automáticamente.' 
                : 'Sync visual theme with local hour to enable dark mode at night automatically.'}
            </p>
          </div>

          <input
            type="checkbox"
            checked={settings.autoThemeBasedOnTime}
            onChange={(e) => onUpdateSettings({ autoThemeBasedOnTime: e.target.checked })}
            className="w-4.5 h-4.5 text-indigo-600 border-slate-800 bg-slate-950 rounded focus:ring-0"
          />
        </div>

      </div>
    </div>
  );
}
