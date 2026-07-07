import React, { useState } from 'react';
import { Calendar, Plus, Clock, FileText, CheckCircle, Smile, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';

interface TimelineCalendarProps {
  tasks: Task[];
  onAddQuickReminder: (text: string, dateStr: string) => void;
  quickReminders: Array<{ id: string; text: string; date: string }>;
  lang: 'es' | 'en';
}

export default function TimelineCalendar({
  tasks,
  onAddQuickReminder,
  quickReminders,
  lang,
}: TimelineCalendarProps) {
  // Current state month: July 2026 (based on current local time meta)
  const currentYear = 2026;
  const currentMonthIdx = 6; // July is index 6 (0-indexed)
  
  const monthNames = {
    es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  }[lang];

  // Calendar rendering math for July 2026
  // July 1st 2026 is a Wednesday (Index 3, assuming Sunday is 0)
  const daysInJuly = 31;
  const startingOffset = 3; 

  const [selectedDay, setSelectedDay] = useState<number | null>(6); // Default select current day: July 6, 2026
  const [newReminderText, setNewReminderText] = useState('');

  const getFullDateString = (day: number) => {
    return `${currentYear}-${(currentMonthIdx + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const getTasksForDay = (day: number) => {
    const dateStr = getFullDateString(day);
    return tasks.filter(t => t.deadline === dateStr);
  };

  const getRemindersForDay = (day: number) => {
    const dateStr = getFullDateString(day);
    return quickReminders.filter(r => r.date === dateStr);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim() || selectedDay === null) return;

    onAddQuickReminder(newReminderText.trim(), getFullDateString(selectedDay));
    setNewReminderText('');
  };

  // Compile calendar day cells
  const dayCells: Array<{ dayNum: number | null }> = [];
  for (let i = 0; i < startingOffset; i++) {
    dayCells.push({ dayNum: null });
  }
  for (let d = 1; d <= daysInJuly; d++) {
    dayCells.push({ dayNum: d });
  }

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
  const selectedDayReminders = selectedDay ? getRemindersForDay(selectedDay) : [];

  return (
    <div id="timeline-calendar-section" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5.5 h-5.5 text-indigo-400" />
          {lang === 'es' ? 'Línea de Tiempo Académica' : 'Academic Timeline'}
        </h2>
        <p className="text-xs text-slate-400">
          {lang === 'es' ? 'Almanaque de entregas escolares y panel inferior para programar recordatorios de estudio rápidos.' : 'School delivery almanac with bottom reminder integrations.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-2 p-5 glass-card rounded-3xl">
          
          {/* Calendar Title Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="text-sm font-extrabold text-white uppercase tracking-wider">
              {monthNames[currentMonthIdx]} {currentYear}
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold px-2 py-0.5 rounded-full">
              Julio 2026
            </span>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
            <span>Do</span>
            <span>Lu</span>
            <span>Ma</span>
            <span>Mi</span>
            <span>Ju</span>
            <span>Vi</span>
            <span>Sá</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {dayCells.map((cell, idx) => {
              const { dayNum } = cell;
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-14" />;
              }

              const isSelected = selectedDay === dayNum;
              const hasTasks = getTasksForDay(dayNum).length > 0;
              const hasReminders = getRemindersForDay(dayNum).length > 0;
              const isToday = dayNum === 6; // July 6, 2026 based on local time

              let cellClass = "h-14 rounded-xl border flex flex-col justify-between p-1.5 transition-all relative cursor-pointer ";
              if (isSelected) {
                cellClass += "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10";
              } else if (isToday) {
                cellClass += "bg-slate-950 border-indigo-500/50 text-slate-100 font-black";
              } else {
                cellClass += "bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-800 hover:bg-slate-950/80";
              }

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  className={cellClass}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-mono font-bold ${isToday ? 'text-indigo-400' : ''}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" title="Hoy" />
                    )}
                  </div>

                  {/* Bullet Indicators */}
                  <div className="flex items-center gap-1">
                    {hasTasks && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Deberes programados" />
                    )}
                    {hasReminders && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Recordatorios rápidos" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bottom notes / Day specific planner */}
        <div className="p-5 glass-card rounded-3xl flex flex-col justify-between h-[400px] lg:h-auto">
          {selectedDay !== null ? (
            <div className="flex-grow flex flex-col justify-between min-h-0 space-y-4">
              
              <div className="space-y-4">
                {/* Panel Title */}
                <div className="border-b border-slate-800 pb-3 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                    {lang === 'es' ? 'Planificador del Día' : 'Daily Planner'}
                  </span>
                  <h3 className="text-sm font-black text-white mt-0.5">
                    {selectedDay} {lang === 'es' ? 'de Julio, 2026' : 'July, 2026'}
                  </h3>
                </div>

                {/* Combined Tasks & Quick Reminders lists */}
                <div className="space-y-3 overflow-y-auto max-h-[170px] pr-1">
                  
                  {/* Task list for selected day */}
                  {selectedDayTasks.map(t => (
                    <div key={t.id} className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-start gap-2 text-left">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[8px] uppercase font-bold text-rose-400 font-mono">Deber Programado</span>
                        <p className="text-[11px] font-bold text-slate-200 leading-normal">{t.title}</p>
                        <p className="text-[9px] text-slate-500">Curso: {t.type}</p>
                      </div>
                    </div>
                  ))}

                  {/* Reminder list for selected day */}
                  {selectedDayReminders.map(r => (
                    <div key={r.id} className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-start gap-2 text-left">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[8px] uppercase font-bold text-amber-400 font-mono">Recordatorio Rápido</span>
                        <p className="text-[11px] text-slate-200 leading-normal">{r.text}</p>
                      </div>
                    </div>
                  ))}

                  {selectedDayTasks.length === 0 && selectedDayReminders.length === 0 && (
                    <div className="text-center py-8 text-slate-600 italic">
                      <Smile className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <p className="text-[10px]">{lang === 'es' ? 'Día libre de entregas y notas.' : 'Free day. No tasks or notes.'}</p>
                    </div>
                  )}

                </div>
              </div>

              {/* Add Quick Reminder Form */}
              <form onSubmit={handleCreateReminder} className="space-y-2 border-t border-slate-800 pt-3 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500">
                  {lang === 'es' ? 'Añadir Recordatorio Rápido' : 'Add Quick Reminder'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={newReminderText}
                    onChange={(e) => setNewReminderText(e.target.value)}
                    placeholder={lang === 'es' ? 'ej. Estudiar tema 2, Repasar vocabulario' : 'e.g. Study chapter 2'}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newReminderText.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 text-white rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Calendar className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
              <p className="text-xs text-slate-500">
                {lang === 'es' ? 'Haz clic en cualquier día del almanaque para ver tareas y recordatorios.' : 'Click on any calendar day to inspect tasks.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
