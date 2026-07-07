import { useState, useEffect, useRef } from 'react';
import { 
  Menu, Sparkles, Trophy, Calendar, Users, BookOpen, Clock, Settings, UserCheck, 
  ChevronRight, ArrowRight, Zap, ShieldAlert, GraduationCap, Flame, Bot, Lock, LogIn,
  Bell, AlertTriangle, Trash2, Check, ListTodo, Pin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import ThemeBackground from './components/ThemeBackground';
import ModalAuth from './components/ModalAuth';
import EliteBanner from './components/EliteBanner';
import CognitiveAssistant from './components/CognitiveAssistant';
import Dashboard from './components/Dashboard';
import AcademicTrajectory from './components/AcademicTrajectory';
import TaskAgenda from './components/TaskAgenda';
import TeamSynergy from './components/TeamSynergy';
import HonorPodium from './components/HonorPodium';
import TimelineCalendar from './components/TimelineCalendar';
import UserProfile from './components/UserProfile';
import SystemSettings from './components/SystemSettings';

// Types
import { User, Friend, Course, Task, StudyGroup, Notification, SystemSettingsState, ChatMessage, DelegatedTask, FileDocument, StudyItem } from './types';

// Seed initial data for a delightful first-time view!
const initialCourses: Course[] = [
  {
    id: 'c1',
    title: 'Álgebra Lineal Avanzada',
    description: 'Espacios vectoriales, transformaciones lineales y valores propios con aplicaciones en gráficos por computadora.',
    structureType: 'weeks',
    items: [
      { id: 'item-1', name: 'Semana 1: Sistemas de Ecuaciones', files: [] },
      { id: 'item-2', name: 'Semana 2: Determinantes y Matrices', files: [] },
      { id: 'item-3', name: 'Semana 3: Espacios Vectoriales', files: [] },
      { id: 'item-4', name: 'Semana 4: Valores Propios', files: [] },
    ]
  },
  {
    id: 'c2',
    title: 'Biología Celular',
    description: 'Estudio detallado del metabolismo de la célula, síntesis de proteínas y replicación del ADN.',
    structureType: 'modules',
    items: [
      { id: 'item-1', name: 'Módulo A: Membrana Plasmática', files: [] },
      { id: 'item-2', name: 'Módulo B: Orgánulos Celulares', files: [] },
      { id: 'item-3', name: 'Módulo C: Ciclo Celular y Mitosis', files: [] },
    ]
  }
];

const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Guía de Espacios Vectoriales',
    description: 'Resolver los ejercicios impares de la sección 4.2 del libro guía.',
    type: 'individual',
    courseId: 'c1',
    weekOrModuleId: 'item-3',
    deadline: '2026-07-10', // Chronological reminder within 4 days
    collaborative: false,
    assignedFriends: [],
    completed: false
  },
  {
    id: 't2',
    title: 'Maqueta del Ciclo de Mitosis',
    description: 'Elaborar un diagrama grupal detallando cada etapa de la división celular.',
    type: 'group',
    courseId: 'c2',
    weekOrModuleId: 'item-3',
    deadline: '2026-07-12', // Within 6 days
    collaborative: true,
    assignedFriends: [],
    completed: false
  },
  {
    id: 't3',
    title: '⚠️ Examen Corto: Determinantes',
    description: 'Examen de comprobación de conocimientos en línea sobre matrices.',
    type: 'urgent',
    courseId: 'c1',
    weekOrModuleId: 'item-2',
    deadline: '2026-07-07', // Very urgent (tomorrow!)
    collaborative: false,
    assignedFriends: [],
    completed: false
  }
];

const initialGroups: StudyGroup[] = [
  {
    id: 'g1',
    name: 'Sinergia de Álgebra',
    purpose: 'Resolver dudas grupales y realizar simulacros de cara al examen final de Álgebra Lineal.',
    rules: 'Compartir material educativo verificado, responder dudas de compañeros.',
    members: ['leonjslm@gmail.com', 'sofia.academico@gmail.com', 'mateo.estudiante@gmail.com'],
    messages: [
      { id: 'msg-1', senderId: 'v1', senderName: 'Sofía Rodríguez', text: '¡Hola a todos! Creé este grupo de sinergia para compartir resúmenes de matrices.', timestamp: '2026-07-06T12:00:00Z' },
      { id: 'msg-2', senderId: 'v2', senderName: 'Mateo González', text: 'Genial Sofía, subiré mis capturas de las clases de vectores en un momento.', timestamp: '2026-07-06T12:05:00Z' }
    ],
    delegatedTasks: [
      { id: 'dt-1', title: 'Crear resumen de autovectores', assigneeId: 'mateo.estudiante@gmail.com', assigneeName: 'Mateo González', status: 'pending', deadline: '2026-07-09' }
    ]
  }
];

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active platform sections (creatively renamed navigation tabs)
  // Options: 'dashboard' | 'trajectory' | 'agenda' | 'synergy' | 'podium' | 'timeline' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core synchronized application states
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>(initialGroups);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'init-notif-1',
      text: '¡Bienvenido a AcademiaIQ! Comienza creando un curso o invitando a tus compañeros de estudio.',
      type: 'info',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false
    },
    {
      id: 'init-notif-2',
      text: 'Elena V. te ha enviado una solicitud de colaboración para estudiar Álgebra Lineal.',
      type: 'friend_request',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false,
      payload: {
        fromUser: { name: 'Elena V.', email: 'elena.v@academica.com' }
      }
    },
    {
      id: 'init-notif-3',
      text: 'Tienes una entrega de IA programada para este viernes: "Proyecto Final: Redes Neuronales".',
      type: 'info',
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      read: false
    }
  ]);
  const [quickReminders, setQuickReminders] = useState<Array<{ id: string, text: string, date: string }>>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifActiveTab, setNotifActiveTab] = useState<'system' | 'tasks' | 'reminders'>('system');

  const [settings, setSettings] = useState<SystemSettingsState>({
    language: 'es',
    theme: 'default',
    autoThemeBasedOnTime: true
  });

  // Persistent Hamburger Sidebar Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Connection URL formulation
  const getSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  };

  useEffect(() => {
    // Automatically establish live WebSocket connection once the user authenticates
    if (user) {
      const socket = new WebSocket(getSocketUrl());
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established by client.");
        // Sync self session on connection
        socket.send(JSON.stringify({
          type: 'init',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            exp: user.exp,
            eliteMember: user.eliteMember
          }
        }));
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          switch (msg.type) {
            case 'sync_state': {
              const { ranking: updatedRanking, friends: updatedFriends, myUser } = msg;
              if (updatedRanking) setRanking(updatedRanking);
              if (updatedFriends) setFriends(updatedFriends);
              if (myUser) {
                setUser(prev => prev ? {
                  ...prev,
                  exp: myUser.exp,
                  eliteMember: myUser.eliteMember
                } : null);
              }
              break;
            }

            case 'notification_received': {
              const { notification } = msg;
              if (notification) {
                setNotifications(prev => [notification, ...prev]);
              }
              break;
            }

            case 'friend_accepted': {
              const { friend, notification } = msg;
              if (friend) {
                setFriends(prev => {
                  const filtered = prev.filter(f => f.email.toLowerCase() !== friend.email.toLowerCase());
                  return [...filtered, friend];
                });
              }
              if (notification) {
                setNotifications(prev => [notification, ...prev]);
              }
              break;
            }

            case 'task_invite_response': {
              const { taskId, friendId, status, notification } = msg;
              // Sincronizar estado de los colaboradores de la tarea
              setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    assignedFriends: t.assignedFriends.map(af => 
                      af.id === friendId ? { ...af, status } : af
                    )
                  };
                }
                return t;
              }));

              if (notification) {
                setNotifications(prev => [notification, ...prev]);
              }
              break;
            }

            case 'new_chat_message': {
              const { groupId, message } = msg;
              setGroups(prev => prev.map(g => {
                if (g.id === groupId) {
                  return {
                    ...g,
                    messages: [...(g.messages || []), message]
                  };
                }
                return g;
              }));
              break;
            }

            case 'group_updated': {
              const { group, notification } = msg;
              if (group) {
                setGroups(prev => prev.map(g => g.id === group.id ? group : g));
              }
              if (notification) {
                setNotifications(prev => [notification, ...prev]);
              }
              break;
            }
          }
        } catch (err) {
          console.error("Error processing WS message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket client error:", error);
      };

      return () => {
        socket.close();
      };
    }
  }, [user]);

  // Intercepting lock actions for unauthenticated users
  const requireAuthAction = (actionCallback: () => void) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      actionCallback();
    }
  };

  const handleLoginSuccess = (name: string, email: string, isElite: boolean) => {
    setUser({
      id: 'usr-' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // standard visual
      exp: 0,
      eliteMember: isElite
    });
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleUpgradeElite = () => {
    if (user) {
      setUser({ ...user, eliteMember: true });
      // Emit socket update if online
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'init',
          user: { ...user, eliteMember: true }
        }));
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // State mutation actions
  const handleAddCourse = (newCourse: Omit<Course, 'id'>) => {
    const courseWithId: Course = {
      ...newCourse,
      id: 'c-' + Date.now()
    };
    setCourses(prev => [...prev, courseWithId]);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setTasks(prev => prev.filter(t => t.courseId !== courseId));
  };

  const handleUploadFile = (courseId: string, itemId: string, file: FileDocument) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          items: c.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                files: [...item.files, file]
              };
            }
            return item;
          })
        };
      }
      return c;
    }));
  };

  const handleAddWeek = (courseId: string, item: StudyItem) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          items: [...c.items, item]
        };
      }
      return c;
    }));
  };

  const handleUpdateWeek = (courseId: string, updatedItem: StudyItem) => {
    setCourses(prevCourses => {
      const updated = prevCourses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            items: c.items.map(item => item.id === updatedItem.id ? updatedItem : item)
          };
        }
        return c;
      });

      // Find the course title
      const course = prevCourses.find(c => c.id === courseId);
      const courseTitle = course ? course.title : 'Curso';

      // Synchronize with tasks (Agenda de Deberes)
      if (updatedItem.taskTitle || updatedItem.taskDescription) {
        setTasks(prevTasks => {
          const existingTaskIndex = prevTasks.findIndex(t => t.courseId === courseId && t.weekOrModuleId === updatedItem.id);
          
          if (existingTaskIndex >= 0) {
            // Task already exists - update it!
            return prevTasks.map((t, idx) => {
              if (idx === existingTaskIndex) {
                return {
                  ...t,
                  title: updatedItem.taskTitle || '',
                  description: updatedItem.taskDescription || '',
                  deadline: updatedItem.taskDeadline || new Date().toISOString().split('T')[0],
                  type: (updatedItem.taskAssignedFriends && updatedItem.taskAssignedFriends.length > 0) ? 'group' : 'individual',
                  collaborative: (updatedItem.taskAssignedFriends && updatedItem.taskAssignedFriends.length > 0) ? true : false,
                  assignedFriends: (updatedItem.taskAssignedFriends || []).map((f: any) => ({
                    id: f.id || 'f-' + Math.random(),
                    name: f.name,
                    status: 'accepted' as const
                  }))
                };
              }
              return t;
            });
          } else {
            // Task does not exist - create a new one!
            const newTaskWithId: Task = {
              id: 't-trajectory-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
              title: updatedItem.taskTitle || '',
              description: updatedItem.taskDescription || '',
              type: (updatedItem.taskAssignedFriends && updatedItem.taskAssignedFriends.length > 0) ? 'group' : 'individual',
              courseId,
              weekOrModuleId: updatedItem.id,
              deadline: updatedItem.taskDeadline || new Date().toISOString().split('T')[0],
              collaborative: (updatedItem.taskAssignedFriends && updatedItem.taskAssignedFriends.length > 0) ? true : false,
              assignedFriends: (updatedItem.taskAssignedFriends || []).map((f: any) => ({
                id: f.id || 'f-' + Math.random(),
                name: f.name,
                status: 'accepted' as const
              })),
              completed: false
            };

            // Also generate a new notification
            const newNotif = {
              id: 'notif-task-' + Date.now(),
              text: settings.language === 'es' 
                ? `🎯 ¡Nueva tarea semanal añadida en ${courseTitle}: "${updatedItem.taskTitle}"!`
                : `🎯 New weekly task added in ${courseTitle}: "${updatedItem.taskTitle}"!`,
              type: 'info' as const,
              timestamp: new Date().toISOString(),
              read: false
            };
            setNotifications(prevNotif => [newNotif, ...prevNotif]);

            return [newTaskWithId, ...prevTasks];
          }
        });
      } else {
        // No task title/description - if there was an existing task from this week/course, let's remove it!
        setTasks(prevTasks => prevTasks.filter(t => !(t.courseId === courseId && t.weekOrModuleId === updatedItem.id)));
      }

      return updated;
    });
  };

  const handleDeleteWeek = (courseId: string, itemId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          items: c.items.filter(item => item.id !== itemId)
        };
      }
      return c;
    }));
    // Remove linked task if any
    setTasks(prev => prev.filter(t => !(t.courseId === courseId && t.weekOrModuleId === itemId)));
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed' | 'assignedFriends'> & { assignedFriends: any[] }) => {
    const taskWithId: Task = {
      ...newTask,
      id: 't-' + Date.now(),
      completed: false
    };
    setTasks(prev => [taskWithId, ...prev]);

    // Send WebSocket invite if collaborative
    if (newTask.collaborative && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const inviteeEmails = newTask.assignedFriends.map(f => {
        const matchingFriend = friends.find(fri => fri.id === f.id);
        return matchingFriend ? matchingFriend.email : "";
      }).filter(Boolean);

      wsRef.current.send(JSON.stringify({
        type: 'task_invite',
        task: { ...taskWithId, ownerEmail: user?.email, ownerId: user?.id },
        inviteeEmails
      }));
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    // Update synced course task if exists
    if (updatedTask.courseId && updatedTask.weekOrModuleId) {
      setCourses(prev => prev.map(c => {
        if (c.id === updatedTask.courseId) {
          return {
            ...c,
            items: c.items.map(item => {
              if (item.id === updatedTask.weekOrModuleId) {
                return {
                  ...item,
                  taskTitle: updatedTask.title,
                  taskDescription: updatedTask.description,
                  taskDeadline: updatedTask.deadline,
                  taskAssignedFriends: updatedTask.assignedFriends.map(af => ({
                    id: af.id,
                    name: af.name,
                    email: ''
                  }))
                };
              }
              return item;
            })
          };
        }
        return c;
      }));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask && targetTask.courseId && targetTask.weekOrModuleId) {
      setCourses(prev => prev.map(c => {
        if (c.id === targetTask.courseId) {
          return {
            ...c,
            items: c.items.map(item => {
              if (item.id === targetTask.weekOrModuleId) {
                return {
                  ...item,
                  taskTitle: undefined,
                  taskDescription: undefined,
                  taskSpecs: undefined,
                  taskDeadline: undefined,
                  taskFile: undefined,
                  taskAssignedFriends: undefined,
                  taskAIDivision: undefined
                };
              }
              return item;
            })
          };
        }
        return c;
      }));
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddFriend = (email: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'friend_request',
        fromUser: { id: user?.id, name: user?.name, email: user?.email },
        targetEmail: email
      }));
    }
  };

  const handleAcceptFriend = (friendEmail: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'friend_accept',
        myEmail: user?.email,
        friendEmail
      }));
    }
    // Remove accept friend notification
    setNotifications(prev => prev.filter(n => n.payload?.fromUser?.email !== friendEmail));
  };

  const handleAcceptTaskInvite = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'task_response',
        taskId,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        status: 'accepted',
        ownerId: targetTask?.ownerId || 'u'
      }));
    }
    setNotifications(prev => prev.filter(n => n.payload?.task?.id !== taskId));
  };

  const handleRejectTaskInvite = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'task_response',
        taskId,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        status: 'rejected',
        ownerId: targetTask?.ownerId || 'u'
      }));
    }
    setNotifications(prev => prev.filter(n => n.payload?.task?.id !== taskId));
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAddExp = (points: number) => {
    setUser(prev => prev ? { ...prev, exp: prev.exp + points } : null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_exp',
        email: user?.email,
        expAdded: points
      }));
    }
  };

  const handleCreateGroup = (newGroup: Omit<StudyGroup, 'id' | 'messages' | 'delegatedTasks'>) => {
    const groupWithId: StudyGroup = {
      ...newGroup,
      id: 'g-' + Date.now(),
      messages: [],
      delegatedTasks: []
    };
    setGroups(prev => [groupWithId, ...prev]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'create_group',
        group: groupWithId
      }));
    }
  };

  const handleSendChatMessage = (groupId: string, text: string, file?: ChatMessage['file']) => {
    const chatMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: user?.id || 'u',
      senderName: user?.name || 'Estudiante',
      text,
      file,
      timestamp: new Date().toISOString()
    };

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, messages: [...(g.messages || []), chatMsg] };
      }
      return g;
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'group_chat_msg',
        groupId,
        message: chatMsg
      }));
    }
  };

  const handleUpdateGroupMembers = (groupId: string, members: string[]) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, members };
      }
      return g;
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_group_members',
        groupId,
        members
      }));
    }
  };

  const handleDelegateTask = (groupId: string, delegatedTask: Omit<DelegatedTask, 'id' | 'status'>) => {
    const fullDelTask: DelegatedTask = {
      ...delegatedTask,
      id: 'dt-' + Date.now(),
      status: 'pending'
    };

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, delegatedTasks: [...(g.delegatedTasks || []), fullDelTask] };
      }
      return g;
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'group_delegate_task',
        groupId,
        task: fullDelTask
      }));
    }
  };

  const handleUpdateDelegateStatus = (groupId: string, taskId: string, status: 'pending' | 'done') => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          delegatedTasks: g.delegatedTasks.map(t => t.id === taskId ? { ...t, status } : t)
        };
      }
      return g;
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'group_delegate_status',
        groupId,
        taskId,
        status
      }));
    }
  };

  const handleAddQuickReminder = (text: string, dateStr: string) => {
    const reminder = {
      id: 'rem-' + Date.now(),
      text,
      date: dateStr
    };
    setQuickReminders(prev => [...prev, reminder]);

    // Feed to global notifications chronological feed!
    setNotifications(prev => [
      {
        id: 'nt-rem-' + Date.now(),
        text: `📌 Recordatorio: ${text}`,
        type: 'info',
        timestamp: dateStr,
        read: false
      },
      ...prev
    ]);
  };

  const handleDeleteQuickReminder = (id: string) => {
    setQuickReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateSettings = (updated: Partial<SystemSettingsState>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  const lang = settings.language;
  const unreadCount = notifications.filter(n => !n.read).length + tasks.filter(t => !t.completed).length + quickReminders.length;

  // Creative renamed sidebar links with descriptive icons
  const sidebarLinks = [
    { id: 'dashboard', labelEs: "Panel Central", labelEn: "Central Panel", icon: Clock },
    { id: 'trajectory', labelEs: "Trayectoria Académica", labelEn: "Academic Syllabus", icon: BookOpen },
    { id: 'agenda', labelEs: "Agenda de Deberes", labelEn: "Task Agenda", icon: Calendar },
    { id: 'synergy', labelEs: "Sinergia de Equipo", labelEn: "Team Synergy", icon: Users },
    { id: 'podium', labelEs: "Podio de Honor", labelEn: "Honor Podium", icon: Trophy },
    { id: 'timeline', labelEs: "Línea de Tiempo", labelEn: "Academic Almanac", icon: Calendar },
    { id: 'profile', labelEs: "Perfil de Usuario", labelEn: "User Profile", icon: UserCheck },
    { id: 'settings', labelEs: "Ajustes de Sistema", labelEn: "System Settings", icon: Settings },
  ];

  return (
    <ThemeBackground settings={settings}>
      {/* Absolute Landing Page visual banner for unauthenticated flow */}
      {!user && (
        <div id="landing-hero" className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[300px] py-12 px-6 border-b border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Plataforma Académica Integradora PWA</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Sincroniza tus Tareas Escolares, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Eleva tu Sinergia Académica con IA
              </span>
            </h1>

            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              La plataforma definitiva para estudiantes. Gestiona tus cursos, interactúa en chats en tiempo real con compañeros, y autoevalúa tus apuntes con nuestro Tutor de IA Cognitivo.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar con Cuenta Académica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Framework Layout Container */}
      <div className="flex min-h-screen">
        
        {/* Persistent Hamburger Sidebar Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              id="sidebar-container"
              className="flex-shrink-0 glass border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto"
            >
              <div className="p-4 space-y-6">
                {/* Brand / Logo Title */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm tracking-wide text-white uppercase">Sinergia Académica</span>
                  </div>
                </div>

                {/* Navigation Options with Custom Icons */}
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                     const isSelected = activeTab === link.id;
                     const Icon = link.icon;

                     return (
                       <button
                         key={link.id}
                         onClick={() => {
                           if (link.id === 'settings' || link.id === 'profile') {
                             requireAuthAction(() => setActiveTab(link.id));
                           } else {
                             // Let non-auth pre-view tabs but trigger block modal on active triggers!
                             setActiveTab(link.id);
                           }
                         }}
                         className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold sidebar-item-glass transition-all ${
                           isSelected 
                             ? 'active-nav-glass text-blue-300' 
                             : 'text-slate-450 hover:text-slate-200'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                           <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                           <span>{lang === 'es' ? link.labelEs : link.labelEn}</span>
                         </div>
                        
                        {!user && ['trajectory', 'agenda', 'synergy', 'podium', 'timeline'].includes(link.id) && (
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Bottom Banner: Elite Subscriber Plan details */}
              <div className="p-4 border-t border-slate-800/60 space-y-4 bg-slate-950/20">
                <EliteBanner 
                  isElite={user?.eliteMember || false} 
                  onUpgrade={handleUpgradeElite} 
                  lang={lang} 
                />
                
                {user && (
                  <div className="flex items-center gap-2.5 p-2 glass rounded-2xl">
                    <img
                      src={user.avatar}
                      className="w-7 h-7 rounded-full object-cover border border-slate-850"
                    />
                    <div className="text-left min-w-0">
                      <div className="text-[10px] font-bold text-slate-300 truncate">{user.name}</div>
                      <div className="text-[9px] text-slate-500 truncate font-mono">{user.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Content View */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar Navigation Controller */}
          <header className="p-4 bg-slate-900/20 border-b border-slate-800/60 backdrop-blur-sm flex items-center justify-between gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle Hamburger (tres líneas) */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors"
                id="sidebar-toggle-hamburger"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1 className="text-sm font-black text-slate-200 hidden sm:block uppercase tracking-wider">
                {lang === 'es' ? 'Entorno de Estudio Inteligente' : 'Smart Study Environment'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                </button>
              ) : (
                <>
                  {/* Notifications Bell Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                      className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all relative"
                    >
                      <Bell className="w-4.5 h-4.5 text-white" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-md animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotificationDropdownOpen && (
                        <>
                          {/* Invisible Backdrop to close on click outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsNotificationDropdownOpen(false)} 
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-hidden bg-[#0c1224] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 flex flex-col space-y-3 text-white"
                          >
                            {/* Dropdown Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                {lang === 'es' ? 'Centro de Avisos' : 'Notifications Hub'}
                              </span>
                              {notifActiveTab === 'system' && notifications.length > 0 && (
                                <button 
                                  onClick={handleMarkAllAsRead}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase"
                                >
                                  {lang === 'es' ? 'Marcar leídas' : 'Mark read'}
                                </button>
                              )}
                            </div>

                            {/* Tab Switcher inside Dropdown */}
                            <div className="flex border-b border-white/10 pb-1 gap-1">
                              <button
                                onClick={() => setNotifActiveTab('system')}
                                className={`flex-1 pb-1.5 text-center text-[10px] uppercase font-bold tracking-wider border-b-2 transition-all ${
                                  notifActiveTab === 'system'
                                    ? 'border-indigo-500 text-white font-black'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {lang === 'es' ? 'Alertas' : 'System'} ({notifications.filter(n => !n.read).length})
                              </button>
                              <button
                                onClick={() => setNotifActiveTab('tasks')}
                                className={`flex-1 pb-1.5 text-center text-[10px] uppercase font-bold tracking-wider border-b-2 transition-all ${
                                  notifActiveTab === 'tasks'
                                    ? 'border-indigo-500 text-white font-black'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {lang === 'es' ? 'Deberes' : 'Tasks'} ({tasks.filter(t => !t.completed).length})
                              </button>
                              <button
                                onClick={() => setNotifActiveTab('reminders')}
                                className={`flex-1 pb-1.5 text-center text-[10px] uppercase font-bold tracking-wider border-b-2 transition-all ${
                                  notifActiveTab === 'reminders'
                                    ? 'border-indigo-500 text-white font-black'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {lang === 'es' ? 'Agenda' : 'Agenda'} ({quickReminders.length})
                              </button>
                            </div>

                            {/* Scrollable list content */}
                            <div className="space-y-2 overflow-y-auto max-h-[290px] pr-1">
                              {/* TAB 1: SYSTEM NOTIFICATIONS */}
                              {notifActiveTab === 'system' && (
                                notifications.length === 0 ? (
                                  <div className="text-center py-8 text-slate-500 space-y-2">
                                    <Bell className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                                    <p className="text-[11px] font-medium">
                                      {lang === 'es' ? 'No tienes alertas del sistema' : 'No system alerts'}
                                    </p>
                                  </div>
                                ) : (
                                  notifications.map((notif) => (
                                    <div 
                                      key={notif.id}
                                      className={`p-2.5 rounded-xl border text-[11px] text-left transition-all ${
                                        notif.read 
                                          ? 'bg-white/5 border-white/5 text-slate-400' 
                                          : 'bg-white/10 border-white/20 text-white font-medium'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="mt-0.5 flex-shrink-0">
                                          {notif.type === 'friend_request' ? (
                                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                          ) : notif.type === 'task_invite' ? (
                                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                          ) : (
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                          )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <p className="leading-relaxed">{notif.text}</p>
                                          
                                          {/* Actionable buttons inside notification */}
                                          {notif.type === 'friend_request' && notif.payload?.fromUser?.email && !notif.read && (
                                            <div className="flex gap-1.5 mt-1.5">
                                              <button
                                                onClick={() => {
                                                  handleAcceptFriend(notif.payload.fromUser.email);
                                                  handleMarkRead(notif.id);
                                                }}
                                                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-bold"
                                              >
                                                {lang === 'es' ? 'Aceptar' : 'Accept'}
                                              </button>
                                            </div>
                                          )}
                                          
                                          {notif.type === 'task_invite' && notif.payload?.task?.id && !notif.read && (
                                            <div className="flex gap-1.5 mt-1.5">
                                              <button
                                                onClick={() => {
                                                  handleAcceptTaskInvite(notif.payload.task.id);
                                                  handleMarkRead(notif.id);
                                                }}
                                                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-bold"
                                              >
                                                {lang === 'es' ? 'Unirse' : 'Join'}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleRejectTaskInvite(notif.payload.task.id);
                                                  handleMarkRead(notif.id);
                                                }}
                                                className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[9px]"
                                              >
                                                {lang === 'es' ? 'Rechazar' : 'Decline'}
                                              </button>
                                            </div>
                                          )}

                                          <div className="text-[9px] text-slate-500 font-mono mt-1">
                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )
                              )}

                              {/* TAB 2: PENDING/URGENT TASKS */}
                              {notifActiveTab === 'tasks' && (
                                tasks.filter(t => !t.completed).length === 0 ? (
                                  <div className="text-center py-8 text-slate-500 space-y-2">
                                    <ListTodo className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                                    <p className="text-[11px] font-medium">
                                      {lang === 'es' ? 'No tienes deberes pendientes' : 'No pending tasks'}
                                    </p>
                                  </div>
                                ) : (
                                  tasks.filter(t => !t.completed).map((task) => (
                                    <div 
                                      key={task.id}
                                      className={`p-2.5 rounded-xl border text-[11px] text-left transition-all ${
                                        task.type === 'urgent' 
                                          ? 'bg-rose-500/5 border-rose-500/20 text-white' 
                                          : 'bg-white/5 border-white/5 text-white'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-1">
                                        <div className="flex items-start gap-2">
                                          <span className="mt-0.5 text-xs">
                                            {task.type === 'urgent' ? '⚠️' : '📝'}
                                          </span>
                                          <div>
                                            <p className="font-bold leading-tight">{task.title}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{task.description}</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleToggleTask(task.id)}
                                          className="w-5 h-5 rounded-full bg-indigo-500/20 hover:bg-indigo-600 text-indigo-400 hover:text-white flex items-center justify-center border border-indigo-500/20 transition-all flex-shrink-0"
                                          title={lang === 'es' ? 'Marcar Completado' : 'Mark Completed'}
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 pt-1.5 border-t border-white/5">
                                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                                          task.type === 'urgent' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-slate-500/10 text-slate-300'
                                        }`}>
                                          {task.type === 'urgent' ? (lang === 'es' ? 'Urgente' : 'Urgent') : (lang === 'es' ? 'Estudio' : 'Study')}
                                        </span>
                                        <span className="font-mono">{lang === 'es' ? `Límite: ${task.deadline}` : `Due: ${task.deadline}`}</span>
                                      </div>
                                    </div>
                                  ))
                                )
                              )}

                              {/* TAB 3: TIMELINE REMINDERS */}
                              {notifActiveTab === 'reminders' && (
                                quickReminders.length === 0 ? (
                                  <div className="text-center py-8 text-slate-500 space-y-2">
                                    <Pin className="w-8 h-8 mx-auto text-slate-600 opacity-60 rotate-45" />
                                    <p className="text-[11px] font-medium">
                                      {lang === 'es' ? 'Sin recordatorios programados' : 'No scheduled reminders'}
                                    </p>
                                  </div>
                                ) : (
                                  quickReminders.map((reminder) => (
                                    <div 
                                      key={reminder.id}
                                      className="p-2.5 rounded-xl border border-white/5 text-[11px] text-left bg-white/5 text-white flex items-start justify-between gap-2"
                                    >
                                      <div className="flex items-start gap-2">
                                        <Pin className="w-3.5 h-3.5 text-amber-400 mt-0.5 rotate-45 flex-shrink-0" />
                                        <div>
                                          <p className="font-medium leading-relaxed">{reminder.text}</p>
                                          <div className="text-[9px] text-slate-500 font-mono mt-1">
                                            {reminder.date}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDeleteQuickReminder(reminder.id)}
                                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
                                        title={lang === 'es' ? 'Eliminar' : 'Delete'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))
                                )
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2.5 glass px-3.5 py-1.5 rounded-2xl border border-white/10">
                    <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-300">
                      {user.exp} <span className="text-[9px] text-slate-500">XP</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Active Panel View Body */}
          <main className="p-4 md:p-6 lg:p-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                {/* Section routing */}
                {activeTab === 'dashboard' && (
                  <Dashboard
                    user={user || { id: 'preview', name: 'Estudiante', email: 'preview@academica.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', exp: 0, eliteMember: false }}
                    friends={friends}
                    notifications={notifications}
                    tasks={tasks}
                    onAddFriend={() => requireAuthAction(() => {})}
                    onAcceptFriend={handleAcceptFriend}
                    onAcceptTask={handleAcceptTaskInvite}
                    onRejectTask={handleRejectTaskInvite}
                    lang={lang}
                  />
                )}

                {activeTab === 'trajectory' && (
                  <AcademicTrajectory
                    courses={courses}
                    user={user}
                    friends={friends}
                    onAddExp={handleAddExp}
                    onAddCourse={(course) => requireAuthAction(() => handleAddCourse(course))}
                    onUploadFile={(courseId, itemId, file) => requireAuthAction(() => handleUploadFile(courseId, itemId, file))}
                    onDeleteCourse={(courseId) => requireAuthAction(() => handleDeleteCourse(courseId))}
                    onAddWeek={(courseId, item) => requireAuthAction(() => handleAddWeek(courseId, item))}
                    onUpdateWeek={(courseId, item) => requireAuthAction(() => handleUpdateWeek(courseId, item))}
                    onDeleteWeek={(courseId, itemId) => requireAuthAction(() => handleDeleteWeek(courseId, itemId))}
                    lang={lang}
                  />
                )}

                {activeTab === 'agenda' && (
                  <TaskAgenda
                    tasks={tasks}
                    courses={courses}
                    friends={friends}
                    onAddTask={(task) => requireAuthAction(() => handleAddTask(task))}
                    onToggleTask={(taskId) => requireAuthAction(() => handleToggleTask(taskId))}
                    onDeleteTask={(taskId) => requireAuthAction(() => handleDeleteTask(taskId))}
                    onUpdateTask={(task) => requireAuthAction(() => handleUpdateTask(task))}
                    lang={lang}
                  />
                )}

                {activeTab === 'synergy' && (
                  <TeamSynergy
                    user={user || { id: 'preview', name: 'Estudiante', email: 'preview@academica.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', exp: 0, eliteMember: false }}
                    friends={friends}
                    groups={groups}
                    onCreateGroup={(group) => requireAuthAction(() => handleCreateGroup(group))}
                    onSendChatMessage={(groupId, text, file) => requireAuthAction(() => handleSendChatMessage(groupId, text, file))}
                    onDelegateTask={(groupId, task) => requireAuthAction(() => handleDelegateTask(groupId, task))}
                    onUpdateDelegateStatus={(groupId, taskId, status) => requireAuthAction(() => handleUpdateDelegateStatus(groupId, taskId, status))}
                    onUpdateGroupMembers={(groupId, members) => requireAuthAction(() => handleUpdateGroupMembers(groupId, members))}
                    lang={lang}
                  />
                )}

                {activeTab === 'podium' && (
                  <HonorPodium
                    ranking={ranking.length > 0 ? ranking : [
                      { id: 'v1', name: 'Sofía Rodríguez', email: 'sofia.academico@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', exp: 450, isOnline: true, eliteMember: true },
                      { id: 'v2', name: 'Mateo González', email: 'mateo.estudiante@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', exp: 320, isOnline: true, eliteMember: false },
                      { id: 'v3', name: 'Valeria Sinergia', email: 'valeria.estudios@gmail.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', exp: 580, isOnline: true, eliteMember: true },
                    ]}
                    currentUser={user || { id: 'preview', name: 'Estudiante', email: 'preview@academica.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', exp: 0, eliteMember: false }}
                    lang={lang}
                  />
                )}

                {activeTab === 'timeline' && (
                  <TimelineCalendar
                    tasks={tasks}
                    onAddQuickReminder={(text, date) => requireAuthAction(() => handleAddQuickReminder(text, date))}
                    quickReminders={quickReminders}
                    lang={lang}
                  />
                )}

                {activeTab === 'profile' && user && (
                  <UserProfile
                    user={user}
                    coursesCount={courses.length}
                    tasksCount={tasks.length}
                    completedTasksCount={tasks.filter(t => t.completed).length}
                    onLogout={handleLogout}
                    lang={lang}
                  />
                )}

                {activeTab === 'settings' && (
                  <SystemSettings
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    lang={lang}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Cognitive AI Assistant Floating Drawer Controller */}
      <CognitiveAssistant
        courses={courses}
        tasks={tasks}
        isElite={user?.eliteMember || false}
        onUpgrade={handleUpgradeElite}
        onAddExp={handleAddExp}
        lang={lang}
      />

      {/* Modal Authentication blocker */}
      <ModalAuth
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />
    </ThemeBackground>
  );
}
