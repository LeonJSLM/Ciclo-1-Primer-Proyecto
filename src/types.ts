export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  exp: number;
  eliteMember: boolean;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted';
  isOnline: boolean;
}

export interface FileDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string; // Blob url or local storage ref
  content?: string; // Text content if parsed / simulated
}

export interface StudyItem {
  id: string; // e.g. "Week 1" or "Module A"
  name: string;
  files: FileDocument[];
  taskDescription?: string;
  taskFile?: FileDocument;
  isRead?: boolean;
  bestScore?: number;
  taskTitle?: string;
  taskDeadline?: string;
  taskSpecs?: string;
  taskAssignedFriends?: any[];
  taskAIDivision?: Array<{ assigneeName: string; title: string; description: string }>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  structureType: 'weeks' | 'modules';
  items: StudyItem[];
}

export interface AssignedFriend {
  id: string;
  name: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'urgent';
  courseId: string;
  weekOrModuleId: string; // connects to StudyItem
  deadline: string; // YYYY-MM-DD
  collaborative: boolean;
  assignedFriends: AssignedFriend[];
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  file?: {
    name: string;
    type: 'image' | 'pdf' | 'file';
    url: string;
  };
  timestamp: string;
}

export interface DelegatedTask {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  status: 'pending' | 'done';
  deadline: string;
  description?: string;
  file?: {
    name: string;
    url: string;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  purpose: string;
  rules: string;
  members: string[]; // User IDs or names
  messages: ChatMessage[];
  delegatedTasks: DelegatedTask[];
}

export interface Notification {
  id: string;
  text: string;
  type: 'info' | 'friend_request' | 'task_invite';
  timestamp: string;
  read: boolean;
  payload?: any; // can store friendId or taskId, etc.
}

export type ThemeType = 'default' | 'landscape' | 'amoled' | 'vintage' | 'custom' | 'frosted';

export interface SystemSettingsState {
  language: 'es' | 'en';
  theme: ThemeType;
  customWallpaperUrl?: string;
  autoThemeBasedOnTime: boolean;
}
