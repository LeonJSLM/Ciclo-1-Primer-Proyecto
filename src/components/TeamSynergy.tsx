import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Send, FileText, Calendar, PlusCircle, CheckCircle, RefreshCw, MessageSquare, AlertCircle, ShieldAlert, Paperclip, Image as ImageIcon, File, UserPlus, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, DelegatedTask, Friend, StudyGroup, User } from '../types';

interface TeamSynergyProps {
  user: User;
  friends: Friend[];
  groups: StudyGroup[];
  onCreateGroup: (group: Omit<StudyGroup, 'id' | 'messages' | 'delegatedTasks'>) => void;
  onSendChatMessage: (groupId: string, text: string, file?: ChatMessage['file']) => void;
  onDelegateTask: (groupId: string, task: Omit<DelegatedTask, 'id' | 'status'>) => void;
  onUpdateDelegateStatus: (groupId: string, taskId: string, status: 'pending' | 'done') => void;
  onUpdateGroupMembers: (groupId: string, members: string[]) => void;
  lang: 'es' | 'en';
}

export default function TeamSynergy({
  user,
  friends,
  groups,
  onCreateGroup,
  onSendChatMessage,
  onDelegateTask,
  onUpdateDelegateStatus,
  onUpdateGroupMembers,
  lang,
}: TeamSynergyProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rules, setRules] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Active group selection
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Send message state
  const [chatText, setChatText] = useState('');

  // Delegated task state
  const [isDelegateFormOpen, setIsDelegateFormOpen] = useState(false);
  const [delTitle, setDelTitle] = useState('');
  const [delAssigneeEmail, setDelAssigneeEmail] = useState('');
  const [delDeadline, setDelDeadline] = useState('');
  const [delDescription, setDelDescription] = useState('');
  const [delFile, setDelFile] = useState<{ name: string; url: string } | null>(null);

  // Active group member additions & attachments
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [chatAttachment, setChatAttachment] = useState<ChatMessage['file'] | null>(null);
  const [isAttachmentPopoverOpen, setIsAttachmentPopoverOpen] = useState(false);
  const [isDelAttachmentPopoverOpen, setIsDelAttachmentPopoverOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeGroup = groups.find(g => g.id === activeGroupId);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeGroup?.messages, activeGroupId]);

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Self email is always added to group members
    const membersList = [user.email.toLowerCase(), ...selectedEmails.map(em => em.toLowerCase())];

    onCreateGroup({
      name,
      purpose,
      rules,
      members: membersList
    });

    // Reset
    setName('');
    setPurpose('');
    setRules('');
    setSelectedEmails([]);
    setIsFormOpen(false);
  };

  const handleEmailToggle = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) ? prev.filter(em => em !== email) : [...prev, email]
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatText.trim() && !chatAttachment) || !activeGroupId) return;

    onSendChatMessage(activeGroupId, chatText.trim(), chatAttachment || undefined);
    setChatText('');
    setChatAttachment(null);
  };

  const handleDelegateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delTitle.trim() || !delAssigneeEmail || !activeGroupId) return;

    // Retrieve name
    const assigneeFriend = friends.find(f => f.email.toLowerCase() === delAssigneeEmail.toLowerCase());
    const assigneeName = assigneeFriend ? assigneeFriend.name : delAssigneeEmail.split('@')[0];

    onDelegateTask(activeGroupId, {
      title: delTitle.trim(),
      assigneeId: delAssigneeEmail,
      assigneeName,
      deadline: delDeadline,
      description: delDescription.trim() || undefined,
      file: delFile || undefined
    });

    setDelTitle('');
    setDelAssigneeEmail('');
    setDelDeadline('');
    setDelDescription('');
    setDelFile(null);
    setIsDelegateFormOpen(false);
  };

  return (
    <div id="team-synergy-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[540px]">
      
      {/* Sidebar: Group list and configuration button */}
      <div className="p-4 glass-card rounded-3xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              {lang === 'es' ? 'Salas de Sinergia' : 'Synergy Groups'}
            </span>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              title={lang === 'es' ? 'Crear Comunidad' : 'Create Community'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Group item scroll list */}
          <div className="space-y-2 overflow-y-auto max-h-[400px]">
            {groups.map((g) => {
              const isSelected = activeGroupId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGroupId(g.id);
                    setIsFormOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-indigo-600/15 border-indigo-500 text-white' 
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-slate-200">{g.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{g.purpose}</div>
                  </div>
                </button>
              );
            })}

            {groups.length === 0 && (
              <p className="text-[10px] text-slate-600 italic text-center py-8">
                {lang === 'es' ? 'Aún no perteneces a grupos.' : 'No groups yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Small motivational advice */}
        <p className="text-[9px] text-slate-500 leading-normal border-t border-slate-800/40 pt-3 italic">
          {lang === 'es' ? '✓ Los mensajes y la delegación de deberes grupales se actualizan en tiempo real.' : '✓ Real-time group messages and task delegation.'}
        </p>
      </div>

      {/* Main Chat Panel Area */}
      <div className="md:col-span-2 flex flex-col justify-between p-4 glass-card rounded-3xl">
        
        {isFormOpen ? (
          /* Workflow Form to create groups */
          <div className="flex-1 overflow-y-auto space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
              {lang === 'es' ? 'Crear Comunidad de Estudio' : 'Create Study Community'}
            </h3>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">{lang === 'es' ? 'Nombre del Grupo' : 'Group Name'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'es' ? 'ej. Club de Biología, Estudio de Cálculo' : 'e.g. Biology Study Club'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">{lang === 'es' ? 'Propósito o Meta' : 'Purpose'}</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder={lang === 'es' ? 'ej. Preparación para el examen parcial' : 'e.g. Preparing for midterm'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">{lang === 'es' ? 'Normas del Grupo' : 'Rules'}</label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder={lang === 'es' ? 'ej. Respetar entregas, responder dudas.' : 'e.g. Respect deadlines.'}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Add friends to group */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  {lang === 'es' ? 'Invitar Compañeros de Amistad' : 'Invite Friends'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {friends.filter(f => f.status === 'accepted').map(friend => {
                    const isChecked = selectedEmails.includes(friend.email);
                    return (
                      <button
                        type="button"
                        key={friend.id}
                        onClick={() => handleEmailToggle(friend.email)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          isChecked 
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {friend.name}
                      </button>
                    );
                  })}
                  {friends.filter(f => f.status === 'accepted').length === 0 && (
                    <p className="text-[10px] text-slate-600 italic">
                      {lang === 'es' ? 'No tienes amigos aceptados para invitar.' : 'No friends to invite yet.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  {lang === 'es' ? 'Establecer Comunidad' : 'Establish Community'}
                </button>
              </div>
            </form>
          </div>
        ) : activeGroup ? (
          /* Active Chat and Delegation Panel */
          <div className="flex-grow flex flex-col min-h-0">
            {/* Active Group Meta Header */}
            <div className="border-b border-slate-800 pb-3 mb-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>{activeGroup.name}</span>
                    <span className="text-[9px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                      {activeGroup.members.length} {lang === 'es' ? 'miembros' : 'members'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">{activeGroup.purpose}</p>
                  {activeGroup.rules && (
                    <p className="text-[9px] text-indigo-400 italic truncate mt-0.5">
                      📌 {lang === 'es' ? 'Normas' : 'Rules'}: {activeGroup.rules}
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsAddPeopleOpen(!isAddPeopleOpen);
                      setIsDelegateFormOpen(false);
                    }}
                    className={`px-2 py-1 border rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isAddPeopleOpen 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Agregar Personas' : 'Add People'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDelegateFormOpen(!isDelegateFormOpen);
                      setIsAddPeopleOpen(false);
                    }}
                    className={`px-2.5 py-1 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 ${
                      isDelegateFormOpen
                        ? 'bg-purple-700 shadow-md border border-purple-500'
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Delegar Tarea' : 'Delegate'}</span>
                  </button>
                </div>
              </div>

              {/* Add People Panel (Inline/Dropdown drawer) */}
              <AnimatePresence>
                {isAddPeopleOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden bg-[#0d132b] p-3.5 rounded-xl border border-indigo-500/10 space-y-3 text-xs text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 text-[10px] uppercase tracking-wider flex items-center gap-1">
                        👥 {lang === 'es' ? 'Gestionar Miembros de Sala' : 'Manage Room Members'}
                      </span>
                      <button onClick={() => setIsAddPeopleOpen(false)} className="text-slate-500 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Member chips with delete option */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                        {lang === 'es' ? 'Miembros en el grupo:' : 'Members in group:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/40 rounded-lg border border-white/5">
                        {activeGroup.members.map((memberEmail) => {
                          const isSelf = memberEmail.toLowerCase() === user.email.toLowerCase();
                          const matchingFriend = friends.find(f => f.email.toLowerCase() === memberEmail.toLowerCase());
                          const displayName = isSelf ? (lang === 'es' ? 'Tú (Líder)' : 'You (Leader)') : (matchingFriend ? matchingFriend.name : memberEmail);
                          
                          return (
                            <span key={memberEmail} className="inline-flex items-center gap-1 bg-slate-900 border border-white/5 text-slate-300 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-lg">
                              <span>{displayName}</span>
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    const updated = activeGroup.members.filter(m => m.toLowerCase() !== memberEmail.toLowerCase());
                                    onUpdateGroupMembers(activeGroup.id, updated);
                                  }}
                                  className="hover:text-rose-400 ml-1 rounded-full p-0.5 hover:bg-rose-500/10"
                                  title={lang === 'es' ? 'Eliminar del grupo' : 'Remove from group'}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Invitation list of friends who are NOT members */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-indigo-300 font-bold block">
                        {lang === 'es' ? '➕ Añadir Amigos Disponibles:' : '➕ Add Available Friends:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const nonMembers = friends.filter(
                            friend => friend.status === 'accepted' && !activeGroup.members.some(em => em.toLowerCase() === friend.email.toLowerCase())
                          );
                          if (nonMembers.length === 0) {
                            return (
                              <span className="text-[10px] text-slate-500 italic block py-1">
                                {lang === 'es' ? 'Todos tus amigos aceptados ya forman parte de este grupo.' : 'All your accepted friends are already part of this group.'}
                              </span>
                            );
                          }
                          return nonMembers.map(friend => (
                            <button
                              key={friend.id}
                              onClick={() => {
                                const updated = [...activeGroup.members, friend.email.toLowerCase()];
                                onUpdateGroupMembers(activeGroup.id, updated);
                              }}
                              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>+ {friend.name}</span>
                              <span className="text-[8px] opacity-60">({friend.email})</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Manual Email Addition */}
                    <div className="pt-1.5 border-t border-white/5 flex gap-2">
                      <input
                        type="email"
                        placeholder={lang === 'es' ? 'Agregar por correo electrónico...' : 'Add by email address...'}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter') {
                            ev.preventDefault();
                            const val = (ev.target as HTMLInputElement).value.trim().toLowerCase();
                            if (val && !activeGroup.members.some(em => em.toLowerCase() === val)) {
                              const updated = [...activeGroup.members, val];
                              onUpdateGroupMembers(activeGroup.id, updated);
                              (ev.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <span className="text-[8px] text-slate-500 self-center">
                        {lang === 'es' ? 'Presiona Enter' : 'Press Enter'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delegate Task overlay form */}
            <AnimatePresence>
              {isDelegateFormOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-[#0a0d1a] border border-purple-500/30 rounded-2xl mb-3 space-y-3 text-left shadow-xl"
                >
                  <h4 className="text-[10px] uppercase font-black text-purple-400 tracking-widest flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5" />
                    {lang === 'es' ? 'Delegar Directiva / Deber Grupal' : 'Delegate Directive / Group Task'}
                  </h4>

                  <form onSubmit={handleDelegateSubmit} className="space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">{lang === 'es' ? 'Título de Tarea' : 'Task Title'}</label>
                        <input
                          type="text"
                          required
                          value={delTitle}
                          onChange={(e) => setDelTitle(e.target.value)}
                          placeholder={lang === 'es' ? 'ej. Diapositivas, Redacción' : 'e.g. Design slides'}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">{lang === 'es' ? 'Responsable (Correo)' : 'Assignee (Email)'}</label>
                        <select
                          required
                          value={delAssigneeEmail}
                          onChange={(e) => setDelAssigneeEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="">{lang === 'es' ? '-- Elegir Miembro --' : '-- Choose Member --'}</option>
                          {activeGroup.members.map((em, idx) => {
                            const matchingFriend = friends.find(f => f.email.toLowerCase() === em.toLowerCase());
                            const label = matchingFriend ? `${matchingFriend.name} (${em})` : em;
                            return (
                              <option key={idx} value={em}>{label}</option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">{lang === 'es' ? 'Fecha Límite' : 'Due Date'}</label>
                        <input
                          type="date"
                          required
                          value={delDeadline}
                          onChange={(e) => setDelDeadline(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Rich Task Description Area */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">
                        {lang === 'es' ? 'Descripción del deber o directiva' : 'Task description or directives'}
                      </label>
                      <textarea
                        value={delDescription}
                        onChange={(e) => setDelDescription(e.target.value)}
                        placeholder={lang === 'es' ? 'Escribe los detalles e instrucciones de lo que el responsable debe realizar...' : 'Write instructions and detail specs...'}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Attachment Option for Delegated Tasks */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDelAttachmentPopoverOpen(!isDelAttachmentPopoverOpen)}
                          className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                            delFile 
                              ? 'bg-purple-900/40 border-purple-500 text-purple-300' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                          <span>
                            {delFile 
                              ? `${lang === 'es' ? 'Archivo Adjunto' : 'Attached'}: ${delFile.name}` 
                              : (lang === 'es' ? 'Adjuntar PDF, Imagen, etc.' : 'Attach PDF, Image, etc.')}
                          </span>
                          {delFile && (
                            <X
                              className="w-3 h-3 hover:text-rose-400 rounded-full cursor-pointer ml-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDelFile(null);
                              }}
                            />
                          )}
                        </button>

                        {/* File lists for delegation attachments */}
                        <AnimatePresence>
                          {isDelAttachmentPopoverOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute left-0 mt-1 z-50 w-60 bg-[#0d0f1a] border border-white/10 rounded-xl p-2.5 shadow-2xl space-y-1.5 text-left"
                            >
                              <span className="text-[8.5px] uppercase font-bold text-slate-500 block border-b border-white/5 pb-1">
                                {lang === 'es' ? 'Elegir Guía o Documento' : 'Choose Guide or Document'}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setDelFile({ name: 'criterios_rubrica_proyecto.pdf', url: 'https://arxiv.org/pdf/1706.03762.pdf' });
                                  setIsDelAttachmentPopoverOpen(false);
                                }}
                                className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded-lg text-[10.5px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-red-400" />
                                <span>📄 Criterios_Rúbrica.pdf</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDelFile({ name: 'material_ejercicios.pdf', url: 'https://arxiv.org/pdf/1706.03762.pdf' });
                                  setIsDelAttachmentPopoverOpen(false);
                                }}
                                className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded-lg text-[10.5px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-yellow-500" />
                                <span>📄 Ejercicios_Clase.pdf</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDelFile({ name: 'esquema_diagrama.png', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800' });
                                  setIsDelAttachmentPopoverOpen(false);
                                }}
                                className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded-lg text-[10.5px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-400" />
                                <span>📷 Esquema_Diagrama.png</span>
                              </button>

                              {/* Custom input simulator */}
                              <div className="pt-1.5 border-t border-white/5 space-y-1">
                                <input
                                  type="text"
                                  placeholder={lang === 'es' ? 'Nombre de archivo personalizado...' : 'Custom filename...'}
                                  className="w-full bg-slate-950 border border-white/5 rounded p-1 text-[9.5px] text-white"
                                  onKeyDown={(ev) => {
                                    if (ev.key === 'Enter') {
                                      ev.preventDefault();
                                      const val = (ev.target as HTMLInputElement).value.trim();
                                      if (val) {
                                        setDelFile({ name: val, url: '#' });
                                        setIsDelAttachmentPopoverOpen(false);
                                        (ev.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                                <span className="text-[8px] text-slate-500 block text-right">Enter para añadir</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex gap-1.5 self-end">
                        <button
                          type="button"
                          onClick={() => setIsDelegateFormOpen(false)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[10px]"
                        >
                          {lang === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[10px] shadow-md shadow-purple-900/20"
                        >
                          {lang === 'es' ? 'Asignar Directiva' : 'Assign Directive'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sub-section: Delegated task list status inside chat view */}
            {activeGroup.delegatedTasks && activeGroup.delegatedTasks.length > 0 && (
              <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl mb-3 space-y-2 max-h-[125px] overflow-y-auto">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block flex items-center gap-1.5">
                  📋 {lang === 'es' ? 'Directivas / Deberes del Equipo' : 'Directives / Assigned Group Tasks'}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeGroup.delegatedTasks.map((t) => (
                    <div key={t.id} className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex flex-col justify-between gap-1 text-[10.5px]">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 text-left">
                          <div className={`font-semibold truncate ${t.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {t.title}
                          </div>
                          <div className="text-slate-400 text-[9px] font-mono truncate mt-0.5">
                            👤 {lang === 'es' ? 'A' : 'To'}: {t.assigneeName} ({t.assigneeId})
                          </div>
                        </div>

                        <button
                          onClick={() => onUpdateDelegateStatus(activeGroup.id, t.id, t.status === 'pending' ? 'done' : 'pending')}
                          className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
                            t.status === 'done' 
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-850'
                          }`}
                          title={t.status === 'done' ? (lang === 'es' ? 'Completado' : 'Completed') : (lang === 'es' ? 'Marcar Completado' : 'Mark Completed')}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${t.status === 'done' ? 'fill-emerald-400/10' : ''}`} />
                        </button>
                      </div>

                      {/* Display description if exists */}
                      {t.description && (
                        <p className="text-[9px] text-slate-500 italic leading-relaxed text-left line-clamp-1 border-t border-white/5 pt-1 mt-0.5">
                          💬 {t.description}
                        </p>
                      )}

                      {/* Display attached file if exists */}
                      {t.file && (
                        <div className="flex items-center justify-between bg-slate-900 border border-white/5 px-2 py-0.5 rounded-lg mt-1 text-[8.5px]">
                          <span className="text-slate-400 truncate max-w-[80%]">📄 {t.file.name}</span>
                          <a
                            href={t.file.url && t.file.url !== '#' ? t.file.url : 'https://arxiv.org/pdf/1706.03762.pdf'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-400 hover:text-purple-300 font-bold"
                          >
                            {lang === 'es' ? 'Descargar' : 'Download'}
                          </a>
                        </div>
                      )}

                      <div className="text-[8.5px] text-slate-500 text-right mt-1 font-semibold">
                        📅 {lang === 'es' ? 'Límite' : 'Due'}: {t.deadline}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Box Conversation */}
            <div className="flex-grow overflow-y-auto space-y-3 pb-3 pr-1 text-left min-h-0">
              {activeGroup.messages.map((m) => {
                const isMe = m.senderId === user.id || m.senderName === user.name;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-2.5 rounded-xl text-xs ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
                    }`}>
                      <div className="text-[9px] font-bold opacity-60 mb-1">
                        {m.senderName}
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

                      {/* Render attached file if available in chat bubble */}
                      {m.file && (
                        <div className="mt-2 p-2 bg-slate-900/60 rounded-xl border border-white/5 space-y-1.5 text-left">
                          {m.file.type === 'image' ? (
                            <div className="space-y-1">
                              <img
                                src={m.file.url && m.file.url !== '#' ? m.file.url : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                                alt={m.file.name}
                                className="w-full h-24 object-cover rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-[9.5px] text-slate-300 truncate font-semibold flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-emerald-400" />
                                <span>{m.file.name}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1.5 text-[9.5px] text-slate-300">
                              <div className="flex items-center gap-1 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <span className="truncate font-semibold">{m.file.name}</span>
                              </div>
                              <a
                                href={m.file.url && m.file.url !== '#' ? m.file.url : 'https://arxiv.org/pdf/1706.03762.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-300 hover:text-indigo-200 flex items-center font-bold"
                              >
                                <span>Ver</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat message input form with WhatsApp-style attachments */}
            <div className="space-y-2 border-t border-slate-800 pt-3 bg-slate-900/40">
              {/* Selected file preview chip */}
              {chatAttachment && (
                <div className="flex items-center justify-between p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-left">
                  <div className="flex items-center gap-2">
                    {chatAttachment.type === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-slate-300 font-semibold truncate max-w-[200px]">{chatAttachment.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatAttachment(null)}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Plus trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAttachmentPopoverOpen(!isAttachmentPopoverOpen)}
                    className={`p-2.5 rounded-xl transition-all border ${
                      isAttachmentPopoverOpen || chatAttachment
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                    title={lang === 'es' ? 'Adjuntar archivo' : 'Attach file'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Attachment Popover with quick files */}
                  <AnimatePresence>
                    {isAttachmentPopoverOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 left-0 z-50 w-64 bg-[#0a0d1d] border border-white/10 rounded-2xl p-3 shadow-2xl space-y-2 text-left"
                      >
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-1.5">
                          📎 {lang === 'es' ? 'Subir fotos o documentos' : 'Upload photos or documents'}
                        </span>
                        
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setChatAttachment({ name: 'foto_pizarra_calculo.png', type: 'image', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' });
                              setIsAttachmentPopoverOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded-lg text-[11px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>📷 {lang === 'es' ? 'Foto de Pizarra / Esquema' : 'Board Photo / Diagram'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setChatAttachment({ name: 'resumen_temario.pdf', type: 'pdf', url: 'https://arxiv.org/pdf/1706.03762.pdf' });
                              setIsAttachmentPopoverOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded-lg text-[11px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-400" />
                            <span>📄 {lang === 'es' ? 'Resumen de Lectura.pdf' : 'Reading Summary.pdf'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setChatAttachment({ name: 'guia_ejercicios.pdf', type: 'pdf', url: 'https://arxiv.org/pdf/1706.03762.pdf' });
                              setIsAttachmentPopoverOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-white/5 rounded-lg text-[11px] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>📄 {lang === 'es' ? 'Guía de Ejercicios.pdf' : 'Exercise Guide.pdf'}</span>
                          </button>
                        </div>

                        {/* Interactive custom file simulator */}
                        <div className="pt-2 border-t border-white/5">
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                            {lang === 'es' ? 'O nombre personalizado:' : 'Or custom file:'}
                          </label>
                          <input
                            type="text"
                            placeholder={lang === 'es' ? 'ej. informe.pdf o foto.png' : 'e.g. guide.pdf'}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg p-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                            onKeyDown={(ev) => {
                              if (ev.key === 'Enter') {
                                ev.preventDefault();
                                const val = (ev.target as HTMLInputElement).value.trim();
                                if (val) {
                                  const ext = val.split('.').pop()?.toLowerCase();
                                  const type = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '') ? 'image' : (ext === 'pdf' ? 'pdf' : 'file');
                                  setChatAttachment({ name: val, type, url: '#' });
                                  setIsAttachmentPopoverOpen(false);
                                  (ev.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                          <span className="text-[8px] text-slate-500 block mt-1">
                            {lang === 'es' ? 'Presiona Enter para agregar' : 'Press Enter to add'}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder={lang === 'es' ? 'Escribe tu mensaje para el equipo...' : 'Type a message for team...'}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!chatText.trim() && !chatAttachment}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 text-white rounded-xl transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Group select empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Users className="w-10 h-10 text-slate-700 mb-2 animate-pulse" />
            <p className="text-xs text-slate-500">
              {lang === 'es' ? 'Selecciona un grupo o crea uno nuevo en la columna izquierda.' : 'Select or create a study group to open team synergy.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
