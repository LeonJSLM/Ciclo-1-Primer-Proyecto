import React, { useEffect, useState } from 'react';
import { ThemeType, SystemSettingsState } from '../types';

interface ThemeBackgroundProps {
  settings: SystemSettingsState;
  children: React.ReactNode;
}

export default function ThemeBackground({ settings, children }: ThemeBackgroundProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(settings.theme);

  useEffect(() => {
    if (settings.autoThemeBasedOnTime) {
      const hours = new Date().getHours();
      // If evening or night (7 PM to 6 AM), default to amoled dark mode, else default
      if (hours >= 19 || hours < 6) {
        setCurrentTheme('amoled');
      } else {
        setCurrentTheme(settings.theme === 'amoled' ? 'default' : settings.theme);
      }
    } else {
      setCurrentTheme(settings.theme);
    }
  }, [settings.theme, settings.autoThemeBasedOnTime]);

  // Determine theme styles
  let themeClasses = "transition-all duration-500 ease-in-out min-h-screen text-slate-100 ";
  let themeStyles: React.CSSProperties = {};

  switch (currentTheme) {
    case 'amoled':
      themeClasses += "bg-black text-slate-100";
      themeStyles = {
        background: 'linear-gradient(to bottom, #000000, #0c0f1a)'
      };
      break;
    case 'landscape':
      themeClasses += "text-white relative bg-cover bg-center";
      themeStyles = {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80')`,
        backgroundAttachment: 'fixed',
      };
      break;
    case 'vintage':
      themeClasses += "bg-[#faf6e9] text-[#4a3f35]";
      themeStyles = {
        background: 'linear-gradient(to bottom, #fcfaf2, #f3ebcf)',
      };
      break;
    case 'custom':
      if (settings.customWallpaperUrl) {
        themeClasses += "text-white relative bg-cover bg-center";
        themeStyles = {
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url('${settings.customWallpaperUrl}')`,
          backgroundAttachment: 'fixed',
        };
      } else {
        // Fallback to default modern blue/space
        themeClasses += "bg-slate-950 text-slate-100";
        themeStyles = {
          background: 'radial-gradient(circle at top right, rgba(29, 78, 216, 0.15), transparent), radial-gradient(circle at bottom left, rgba(88, 28, 135, 0.15), transparent), #030712'
        };
      }
      break;
    case 'frosted':
      themeClasses += "text-white relative bg-fixed";
      themeStyles = {
        background: 'radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.3) 0%, transparent 50%), #050B18',
      };
      break;
    case 'default':
    default:
      themeClasses += "text-white relative bg-fixed";
      themeStyles = {
        background: 'radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.3) 0%, transparent 50%), #050B18',
      };
      break;
  }

  return (
    <div 
      id="app-theme-background" 
      className={themeClasses} 
      style={themeStyles}
    >
      <div className={`min-h-screen ${currentTheme === 'vintage' ? 'bg-[#faf6e9]/20' : 'bg-slate-950/10'}`}>
        {children}
      </div>
    </div>
  );
}
