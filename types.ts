
export type ThemeColor = 'blue' | 'violet' | 'emerald' | 'rose' | 'amber';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'premium';
  joinedDate: string;
  lastActiveDate: string;
  xp: number;
  maxXp: number;
  level: number;
  hearts: number;
  streak: number;
  // Advanced AI Extensions
  survivalMode?: boolean;
  cognitiveLoadScore?: number; // 0-100
  focusScore?: number;
}

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

export interface Habit {
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
  habits: Habit[];
  color?: string;
}

export interface PlanTask {
  id: string;
  title: string;
  isCompleted: boolean;
  // AI Extensions
  estimatedMinutes?: number;
  dueDate?: string; // ISO Date Time
  // Advanced AI Extensions
  subjectWeightage?: number; // 0-100
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

// Backend Specific Types
export interface ActivityLog {
  id: string;
  date: string; // ISO Date "YYYY-MM-DD"
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

// AI Planner Types
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
    assignedDay: string; // YYYY-MM-DD
    nodeId?: string; // Added for Study Assistant
}

export interface RiskReport {
    taskId: string;
    pMiss: number; // 0 to 1
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
    totalSlippage: number; // hours
    reschedules: number;
    predictedFailures: number;
    // Advanced Metrics
    examReadiness?: number; // 0-100
    consistencyScore?: number; // 0-100
    predictedScore?: number; // 0-100 (Predicted Outcome)
    requiredEffortGap?: number; // Hours needed to reach target
}

export interface AppState {
  user: User;
  goals: Goal[];
  plans: StudyPlan[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  themeColor: ThemeColor;
  sidebarOpen: boolean;
  activityLogs: Record<string, number>; // Legacy map for quick lookup
  recentTransactions: Transaction[];
  // AI Feature Flags & Data
  enableAIPlanner: boolean;
  enableAdvancedAI: boolean; // New Master Flag for Features 1-15
  scheduledBlocks: ScheduledBlock[];
  riskReports: Record<string, RiskReport>;
  aiMetrics: AIMetrics;
  // Advanced AI Data
  peerGroups: PeerGroup[];
  chatHistory: ChatMessage[];
  smartTemplates: SmartTemplate[];
  // Study Assistant
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
}

// New Types for Upgrade
export interface PeerGroup {
  id: string;
  name: string;
  members: { name: string; avatar: string; status: string }[];
  sharedPlans: string[];
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
  timestamp: string; // ISO
  sources?: string[]; // For RAG
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
  summaries?: any;
};
