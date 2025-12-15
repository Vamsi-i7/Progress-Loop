
export type ThemeColor = 'blue' | 'violet' | 'emerald' | 'rose' | 'amber';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface User {
  id: string; // UUID
  username: string; // Unique
  name: string;
  email: string;
  avatar?: string; // avatar_url

  // Gamification & Social (New Schema)
  xp_points: number; // default 0
  current_streak: number; // default 0
  study_group_id?: string; // UUID (Wolfpack)
  mentor_id?: string; // UUID (Link to User)

  // Legacy/Frontend fields (Keep for compatibility until full migration)
  plan: 'free' | 'pro' | 'premium';
  joinedDate: string;
  lastActiveDate: string;
  xp: number; // Deprecated by xp_points? Keep synced for now.
  maxXp: number;
  level: number;
  hearts: number;
  streak: number; // Deprecated by current_streak?

  // Advanced AI Extensions
  survivalMode?: boolean;
  cognitiveLoadScore?: number; // 0-100
  focusScore?: number;

  // Subscription & Quota
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  subscriptionPeriodEnd?: number;
  aiQuotaLimit?: number;
  uploadsLimit?: number;

  // Usage tracking
  usage: {
    aiTokensUsed: number;
    uploadsUsed: number;
    lastReset: string;
  };

  // Social
  friends: string[]; // User IDs
  friendRequests: string[]; // Request IDs
}

// --- MASTER GRID TYPES (Strict) ---

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Reviewing' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type EnergyLevel = 'High Focus' | 'Low Energy';

export interface Task {
  id: string; // UUID
  user_id: string; // UUID
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  energy_level: EnergyLevel;
  due_date: string; // ISO Date string
  do_date?: string; // ISO Date string (Planned execution)
  estimated_minutes: number;
  actual_minutes: number;
  subject_tag: string; // e.g., 'Math', 'Coding'
  is_missed: boolean; // Triggered by cron if due_date passes
}

// --- HABIT TRACKING (Strict) ---

export interface Habit {
  id: string; // UUID
  user_id: string; // UUID
  title: string;
  weight: number; // 1-10 Scale
  frequency_goal: number; // e.g., 5 times per week
}

export interface HabitLog {
  id: string; // UUID
  habit_id: string; // UUID
  date: string; // Date string YYYY-MM-DD
  status: boolean; // true = completed
}

// Legacy interfaces kept for compatibility during migration
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export type GoalType = 'daily' | 'monthly' | 'yearly';
export type GoalCategory = 'short-term' | 'long-term';

// Deprecated Goal/Habit (Legacy) - Consider removing after full migration
export interface LegacyHabit {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  category: GoalCategory;
  progress: number; // 0-100
  habits: LegacyHabit[];
  color?: string;
}

export interface PlanTask {
  id: string;
  title: string;
  isCompleted: boolean;
  estimatedMinutes?: number;
  dueDate?: string;
  subjectWeightage?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isRevision?: boolean;
  actualTimeSpent?: number;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  tasks: PlanTask[];
}

export interface ActivityLog {
  id: string;
  date: string;
  goalId: string;
  habitId: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  plan: 'pro' | 'premium';
  status: 'success' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

export interface BusySlot {
  start: Date;
  end: Date;
  title?: string;
}

export interface ScheduledBlock {
  id: string;
  taskId: string;
  planId: string;
  start: Date;
  end: Date;
  assignedDay: string;
  nodeId?: string;
}

export interface RiskReport {
  taskId: string;
  pMiss: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

export interface RescheduleProposal {
  taskId: string;
  originalSlot?: ScheduledBlock;
  proposedSlot: ScheduledBlock;
  reason: string;
}

export interface AIMetrics {
  plannedTasks: number;
  completedTasks: number;
  totalSlippage: number;
  reschedules: number;
  predictedFailures: number;
  examReadiness?: number;
  consistencyScore?: number;
  predictedScore?: number;
  requiredEffortGap?: number;
}

// --- GROUP STUDY TYPES ---

export interface GroupMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  name?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'studying';
}

export interface GroupAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  text?: string;
  attachments?: GroupAttachment[];
  mentions?: string[];
  timestamp: string;
  edited?: boolean;
  readBy?: string[];
  pinned?: boolean;
  isAi?: boolean;
}

export interface PeerGroup {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  members: GroupMember[];
  createdAt: string;
  settings: { allowInvites: boolean; requireApproval: boolean };
  // Mock backend storage helpers
  messages?: GroupMessage[];
  attachments?: GroupAttachment[];
  sessions?: GroupSession[];
  sharedRoadmaps?: string[]; // IDs of roadmaps
  sharedPlans?: string[];
}

export interface GroupInvite {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeEmail?: string;
  inviteeId?: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

export interface GroupSession {
  id: string;
  groupId: string;
  title: string;
  start: string;
  end?: string;
  hostId: string;
  notes?: string;
}

export interface SmartTemplate {
  id: string;
  name: string;
  description: string;
  subjects: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
  imageUrl?: string;
  audioUrl?: string; // For TTS or voice replies
  isThinking?: boolean;
}

// --- STUDY ASSISTANT MODULE TYPES ---

export type Node = {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  level: number;
  estimatedMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  weight?: number;
  summaryOverview?: string;
  summaryDetailed?: string;
};

export type Roadmap = {
  id: string;
  title: string;
  nodes: Node[];
  generatedAt: string;
  timetable?: ScheduledBlock[];
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  nodeId?: string;
  tags?: string[];
  type: 'concept' | 'definition' | 'reverse' | 'example' | 'cloze' | 'key_fact';
};

export type EmbeddingEntry = {
  id: string;
  nodeId: string;
  vector: number[];
  text: string;
  // Group context
  groupId?: string;
  type?: 'node' | 'message' | 'file';
};

export type HistoryItem = {
  id: string;
  roadmapId: string;
  title: string;
  uploadedAt: string;
  nodes: Node[];
  flashcards: Flashcard[];
  embeddings: EmbeddingEntry[];
  mindmap?: Node[];
  summaries?: Record<string, { overview: string; detailed: string }>;
};

export interface FeedbackSubmission {
  id: string;
  userId: string;
  page?: string;
  message: string;
  rating?: number;
  createdAt: string;
}

export interface AppState {
  user: User;
  goals: Goal[];
  plans: StudyPlan[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  themeColor: ThemeColor;
  sidebarOpen: boolean;
  activityLogs: Record<string, number>;
  recentTransactions: Transaction[];
  enableAIPlanner: boolean;
  enableAdvancedAI: boolean;
  scheduledBlocks: ScheduledBlock[];
  riskReports: Record<string, RiskReport>;
  aiMetrics: AIMetrics;
  peerGroups: PeerGroup[];
  chatHistory: ChatMessage[];
  smartTemplates: SmartTemplate[];
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
}
