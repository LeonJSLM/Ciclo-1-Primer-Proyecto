import React, { useState } from 'react';
import { Calendar, User, Users, AlertCircle, Plus, CheckCircle2, Circle, Clock, Sparkles, UserPlus, Trash2, FileText, File, Image as ImageIcon, FileSpreadsheet, X, ExternalLink, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Friend, Task } from '../types';

interface TaskAgendaProps {
  tasks: Task[];
  courses: Course[];
  friends: Friend[];
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'assignedFriends'> & { assignedFriends: Array<{ id: string, name: string, status: 'pending' | 'accepted' | 'rejected' }> }) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask?: (task: Task) => void;
  lang: 'es' | 'en';
}

export default function TaskAgenda({
  tasks,
  courses,
  friends,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  lang,
}: TaskAgendaProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'individual' | 'group' | 'urgent'>('individual');
  const [courseId, setCourseId] = useState('');
  const [weekOrModuleId, setWeekOrModuleId] = useState('');
  const [deadline, setDeadline] = useState('');
  
  // Collaborative Toggle
  const [collaborative, setCollaborative] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [customCompanionName, setCustomCompanionName] = useState('');

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-rose-400" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
    return <File className="w-5 h-5 text-blue-400" />;
  };

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriendIds(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId || !deadline) return;

    // Compile assigned friends list
    const assignedFriendsList = collaborative
      ? selectedFriendIds.map(fId => {
          const fri = friends.find(f => f.id === fId);
          return {
            id: fId,
            name: fri ? fri.name : "Estudiante",
            status: 'pending' as const
          };
        })
      : [];

    onAddTask({
      title,
      description,
      type,
      courseId,
      weekOrModuleId,
      deadline,
      collaborative,
      assignedFriends: assignedFriendsList
    });

    // Reset
    setTitle('');
    setDescription('');
    setCourseId('');
    setWeekOrModuleId('');
    setDeadline('');
    setCollaborative(false);
    setSelectedFriendIds([]);
    setIsFormOpen(false);
  };

  const selectedCourse = courses.find(c => c.id === courseId);

  // Split tasks into Independent Lists: Individual, Group, Urgent
  const individualTasks = tasks.filter(t => t.type === 'individual');
  const groupTasks = tasks.filter(t => t.type === 'group');
  const urgentTasks = tasks.filter(t => t.type === 'urgent');

  const getTaskBadgeStyle = (taskType: 'individual' | 'group' | 'urgent') => {
    switch (taskType) {
      case 'urgent': return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case 'group': return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case 'individual':
      default: return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    }
  };

  const getCourseTitle = (cId: string) => {
    const found = courses.find(c => c.id === cId);
    return found ? found.title : "Asignatura General";
  };

  return (
    <div id="task-agenda-section" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {lang === 'es' ? 'Agenda de Deberes' : 'Task Agenda'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'es' ? 'Estructura tus entregas individuales y grupales con soporte colaborativo.' : 'Structure your individual and group tasks with collaborative sync.'}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'es' ? 'Añadir Deber' : 'Add Task'}</span>
        </button>
      </div>

      {/* Task Creation Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 glass-card rounded-3xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? 'Registrar Nueva Entrega Académica' : 'Register New Academic Task'}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Título del Deber' : 'Task Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'es' ? 'ej. Resumen de Capítulo 3, Proyecto Grupal' : 'e.g. Chapter 3 Summary'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Asignatura Vinculada' : 'Linked Course'}
                </label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{lang === 'es' ? '-- Seleccionar Curso --' : '-- Select Course --'}</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Semana / Módulo de Entrega' : 'Week / Module of Delivery'}
                </label>
                <select
                  value={weekOrModuleId}
                  onChange={(e) => setWeekOrModuleId(e.target.value)}
                  disabled={!courseId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white disabled:opacity-40 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{lang === 'es' ? '-- Seleccionar Bloque --' : '-- Select Block --'}</option>
                  {selectedCourse?.items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Clasificación de Tarea' : 'Task Type'}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="individual">{lang === 'es' ? 'Individual' : 'Individual'}</option>
                  <option value="group">{lang === 'es' ? 'Grupales (Equipo)' : 'Group'}</option>
                  <option value="urgent">{lang === 'es' ? '⚠️ Entregas Urgentes' : 'Urgent'}</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Fecha Límite' : 'Deadline'}
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 text-left md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Breves Instrucciones o Notas' : 'Short Instructions or Notes'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Collaborative Toggle */}
              <div className="md:col-span-2 p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {lang === 'es' ? 'Trabajo Colaborativo en Sinergia' : 'Collaborative Work Synergy'}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'es' ? 'Activa para invitar a tus amigos agregados y sincronizar progresos en tiempo real.' : 'Invite connected classmates to join and collaborate in real-time.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={collaborative}
                    onChange={(e) => setCollaborative(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-800 bg-slate-950 focus:ring-0"
                  />
                </div>

                {collaborative && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {lang === 'es' ? 'Seleccionar Compañeros Académicos' : 'Select Academic Classmates'}
                    </span>
                    
                    <div className="flex flex-wrap gap-2">
                      {friends.filter(f => f.status === 'accepted').map(friend => {
                        const isSelected = selectedFriendIds.includes(friend.id);
                        return (
                          <button
                            type="button"
                            key={friend.id}
                            onClick={() => handleFriendToggle(friend.id)}
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <img
                              src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`}
                              className="w-4 h-4 rounded-full border border-slate-850"
                            />
                            <span>{friend.name}</span>
                          </button>
                        );
                      })}
                      {friends.filter(f => f.status === 'accepted').length === 0 && (
                        <p className="text-[10px] text-slate-500 italic">
                          {lang === 'es' ? 'Primero agrega amigos en el panel principal para invitarlos.' : 'Add friends on your dashboard to invite them here.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs transition-colors"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
                >
                  {lang === 'es' ? 'Asignar Entrega' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Lists Grid: Divided into Individual, Group, Urgent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List 1: Individual */}
        <div className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {lang === 'es' ? 'Entregas Individuales' : 'Individual Tasks'}
            </span>
            <span className="text-[10px] bg-blue-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
              {individualTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {individualTasks.map(t => renderTaskCard(t))}
            {individualTasks.length === 0 && renderEmptyState()}
          </div>
        </div>

        {/* List 2: Group */}
        <div className="space-y-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {lang === 'es' ? 'Proyectos de Sinergia' : 'Group Projects'}
            </span>
            <span className="text-[10px] bg-purple-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
              {groupTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {groupTasks.map(t => renderTaskCard(t))}
            {groupTasks.length === 0 && renderEmptyState()}
          </div>
        </div>

        {/* List 3: Urgent */}
        <div className="space-y-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              {lang === 'es' ? 'Entregas Urgentes' : 'Urgent Deadlines'}
            </span>
            <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
              {urgentTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {urgentTasks.map(t => renderTaskCard(t))}
            {urgentTasks.length === 0 && renderEmptyState()}
          </div>
        </div>

      </div>

      {/* DETAILED INTERACTIVE TASK MODAL */}
      <AnimatePresence>
        {selectedTaskDetail && (() => {
          const task = selectedTaskDetail;
          const course = courses.find(c => c.id === task.courseId);
          const studyItem = course?.items.find(item => item.id === task.weekOrModuleId);
          
          // Fallbacks from studyItem if synchronized
          const title = studyItem?.taskTitle || task.title;
          const description = studyItem?.taskDescription || task.description;
          const specs = studyItem?.taskSpecs;
          const file = studyItem?.taskFile;
          const aiDivision = studyItem?.taskAIDivision;
          const deadline = studyItem?.taskDeadline || task.deadline;
          const assignedFriends = studyItem?.taskAssignedFriends || task.assignedFriends;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0b1021] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative text-left scrollbar-thin scrollbar-thumb-white/10"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedTaskDetail(null)}
                  className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Subtitle / Category */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                    🎯 {course ? course.title : (lang === 'es' ? 'Asignatura' : 'Subject')}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Main Content (Description + Specs) */}
                  <div className="md:col-span-2 space-y-5">
                    {/* Description */}
                    {description && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          📝 {lang === 'es' ? 'Descripción del Deber' : 'Task Description'}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                          {description}
                        </p>
                      </div>
                    )}

                    {/* Specifications / Rubric */}
                    {specs && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1">
                          📋 {lang === 'es' ? 'Especificaciones y Rúbrica' : 'Specifications & Rubric'}
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-4 rounded-2xl border border-white/5 font-sans">
                          {specs}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Sidebar (Details: Deadline, File, Team Members) */}
                  <div className="space-y-4">
                    {/* Deadline card */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2 flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">
                          {lang === 'es' ? 'Fecha Límite' : 'Due Deadline'}
                        </span>
                        <span className="text-xs text-slate-200 font-mono font-bold">
                          {deadline || (lang === 'es' ? 'No especificada' : 'Not specified')}
                        </span>
                      </div>
                    </div>

                    {/* File Attachment if exists */}
                    {file && (
                      <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {getFileIcon(file.name)}
                          <span className="text-slate-300 truncate font-semibold text-[11px]" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          {lang === 'es' ? 'Ver' : 'Open'}
                        </button>
                      </div>
                    )}

                    {/* Team Members & Interactive Companion Management */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/10 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider block">
                          👥 {lang === 'es' ? 'Compañeros del Deber' : 'Task Companions'}
                        </span>
                        
                        {/* Currently Assigned List */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-xl shadow-sm">
                            👤 {lang === 'es' ? 'Tú (Líder)' : 'You (Leader)'}
                          </span>
                          {(assignedFriends || []).map((f: any) => (
                            <span key={f.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-white/5 text-slate-300 text-[10px] font-semibold rounded-xl">
                              <span>{f.name}</span>
                              <button
                                onClick={() => {
                                  const updated = (assignedFriends || []).filter((item: any) => item.id !== f.id);
                                  const updatedTask = { ...task, assignedFriends: updated };
                                  onUpdateTask?.(updatedTask);
                                  setSelectedTaskDetail(updatedTask);
                                }}
                                className="w-3.5 h-3.5 rounded-full hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                                title={lang === 'es' ? 'Eliminar compañero' : 'Remove companion'}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Add Companion Selector Field */}
                      <div className="pt-3 border-t border-white/5 space-y-3">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">
                          ➕ {lang === 'es' ? 'Añadir a la tarea' : 'Add to task'}
                        </span>

                        {/* List of unassigned friends to quickly click-add */}
                        {(() => {
                          const availableFriendsList = (friends && friends.length > 0) ? friends : [
                            { id: 'v-1', name: 'Sofía Rodríguez', email: 'sofia.academico@gmail.com' },
                            { id: 'v-2', name: 'Mateo González', email: 'mateo.estudiante@gmail.com' },
                            { id: 'v-3', name: 'Valeria Sinergia', email: 'valeria.estudios@gmail.com' }
                          ];
                          const unassigned = availableFriendsList.filter(
                            (friend: any) => !(assignedFriends || []).some((af: any) => af.id === friend.id)
                          );

                          if (unassigned.length > 0) {
                            return (
                              <div className="space-y-1.5">
                                <span className="text-[8.5px] font-medium text-slate-500 block">
                                  {lang === 'es' ? 'Amigos Disponibles:' : 'Available Friends:'}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {unassigned.map((friend: any) => (
                                    <button
                                      key={friend.id}
                                      onClick={() => {
                                        const updated = [...(assignedFriends || []), { id: friend.id, name: friend.name, status: 'accepted' as const }];
                                        const updatedTask = { ...task, assignedFriends: updated };
                                        onUpdateTask?.(updatedTask);
                                        setSelectedTaskDetail(updatedTask);
                                      }}
                                      className="px-2 py-0.5 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-indigo-300 rounded-lg text-[9.5px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>+ {friend.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Custom Name Companion Field Input */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!customCompanionName.trim()) return;
                            const updated = [
                              ...(assignedFriends || []),
                              { id: `custom-${Date.now()}`, name: customCompanionName.trim(), status: 'accepted' as const }
                            ];
                            const updatedTask = { ...task, assignedFriends: updated };
                            onUpdateTask?.(updatedTask);
                            setSelectedTaskDetail(updatedTask);
                            setCustomCompanionName('');
                          }}
                          className="flex gap-1.5"
                        >
                          <input
                            type="text"
                            value={customCompanionName}
                            onChange={(e) => setCustomCompanionName(e.target.value)}
                            placeholder={lang === 'es' ? 'Añadir compañero por nombre...' : 'Add companion by name...'}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10.5px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          <button
                            type="submit"
                            className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Division roadmap if present */}
                {aiDivision && (
                  <div className="pt-4 border-t border-white/5 space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                        {lang === 'es' ? 'Distribución de Trabajo por IA' : 'AI Task Distribution Roadmap'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {aiDivision.map((div: any, idx: number) => {
                        const isSelf = div.assigneeName === "Tú" || div.assigneeName.toLowerCase().includes("tú") || div.assigneeName.toLowerCase().includes("leader");
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all space-y-2 text-left relative overflow-hidden ${
                              isSelf
                                ? 'bg-indigo-600/10 border-indigo-500/30 shadow-indigo-500/5 shadow-md'
                                : 'bg-slate-950 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className={`text-[11px] font-bold ${isSelf ? 'text-indigo-300' : 'text-slate-300'}`}>
                                {div.assigneeName} {isSelf && (lang === 'es' ? '(Tu parte)' : '(Your part)')}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-500">
                                #{idx + 1}
                              </span>
                            </div>
                            <h5 className="font-bold text-white text-xs leading-tight">{div.title}</h5>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">{div.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Task Status Control inside detail */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {lang === 'es' ? 'Estado actual de la tarea:' : 'Current task status:'}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      task.completed 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {task.completed ? (lang === 'es' ? 'Completada' : 'Completed') : (lang === 'es' ? 'Pendiente' : 'Pending')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        onToggleTask(task.id);
                        // update local state
                        setSelectedTaskDetail(prev => prev ? { ...prev, completed: !prev.completed } : null);
                      }}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        task.completed 
                          ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-white/5' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {task.completed ? (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>{lang === 'es' ? 'Marcar como Pendiente' : 'Mark as Pending'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'es' ? 'Marcar como Completada' : 'Mark as Completed'}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onDeleteTask(task.id);
                        setSelectedTaskDetail(null);
                      }}
                      className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-2xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{lang === 'es' ? 'Eliminar de Agenda' : 'Delete Task'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );

  function renderTaskCard(task: Task) {
    // Find matching course/study item details to show preview dynamically
    const course = courses.find(c => c.id === task.courseId);
    const studyItem = course?.items.find(item => item.id === task.weekOrModuleId);
    
    const title = studyItem?.taskTitle || task.title;
    const description = studyItem?.taskDescription || task.description;
    const deadline = studyItem?.taskDeadline || task.deadline;

    return (
      <div
        key={task.id}
        onClick={() => setSelectedTaskDetail(task)}
        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden cursor-pointer group/task-card ${
          task.completed 
            ? 'bg-white/5 border-white/5 opacity-60 hover:opacity-85' 
            : 'glass-card border-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5'
        }`}
      >
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-mono text-indigo-400 font-bold">
              {getCourseTitle(task.courseId)}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className={`text-xs font-bold leading-normal transition-colors group-hover/task-card:text-indigo-300 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
            {title}
          </h4>
          
          {description && (
            <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
              {description}
            </p>
          )}

          {/* Delivery dates */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'es' ? 'Vence:' : 'Due:'}</span>
            <span className="font-mono font-semibold text-slate-300">{deadline}</span>
          </div>

          {/* Collaborative friend statuses inside Task card */}
          {task.collaborative && task.assignedFriends.length > 0 && (
            <div className="pt-2 border-t border-slate-800/50 mt-2 space-y-1">
              <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 block">
                {lang === 'es' ? 'Estado de Colaboradores:' : 'Collaborators Status:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {task.assignedFriends.map((f, idx) => {
                  let statusClass = "text-[8px] font-bold px-1.5 py-0.5 rounded-md ";
                  if (f.status === 'accepted') statusClass += "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  else if (f.status === 'rejected') statusClass += "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  else statusClass += "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse";

                  return (
                    <span key={idx} className={statusClass}>
                      {f.name}: {f.status === 'accepted' ? '✓' : f.status === 'rejected' ? '✕' : '...'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Task toggle action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleTask(task.id);
          }}
          className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            task.completed 
              ? 'bg-slate-950 border border-slate-900 text-slate-500' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'
          }`}
        >
          {task.completed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'es' ? 'Completada' : 'Completed'}</span>
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Marcar Completada' : 'Mark Completed'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  function renderEmptyState() {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center py-6">
        <p className="text-[10px] text-slate-600 italic">
          {lang === 'es' ? 'No hay deberes pendientes.' : 'No pending tasks.'}
        </p>
      </div>
    );
  }
}
