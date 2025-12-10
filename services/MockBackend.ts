
import { Goal, User, ActivityLog, StudyPlan, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, BusySlot, PeerGroup, ChatMessage, SmartTemplate, Roadmap, Flashcard, EmbeddingEntry, HistoryItem } from '../types';
import { scheduleTasks } from './scheduler';
import { computeRiskMetrics, predictLearningOutcome } from './predictor';
import { proposeReschedule } from './rescheduler';
import { addMinutes } from '../utils/dateMath';
import { calculateCognitiveLoad, compressTasks, prioritizeTasks, applyFocusMode } from './optimizer';
import { COURSE_TEMPLATES } from './templates';

// --- DATABASE SCHEMA SIMULATION ---
interface Database {
  user: User;
  goals: Goal[];
  plans: StudyPlan[];
  notifications: Notification[];
  logs: ActivityLog[];
  transactions: Transaction[];
  // AI Data
  busySlots: BusySlot[];
  scheduledBlocks: ScheduledBlock[];
  riskReports: Record<string, RiskReport>;
  aiMetrics: AIMetrics;
  // Advanced AI Data
  peerGroups: PeerGroup[];
  chatHistory: ChatMessage[];
  smartTemplates: SmartTemplate[];
  // Study Assistant Data
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
  embeddings: EmbeddingEntry[];
  history: HistoryItem[];
}

const STORAGE_KEY = 'pl_backend_db_v8';

const INITIAL_DB: Database = {
  user: {
    id: 'u1',
    name: 'Student',
    username: 'student',
    email: 'student@progressloop.app',
    plan: 'free',
    joinedDate: new Date().toISOString().split('T')[0],
    lastActiveDate: new Date().toISOString().split('T')[0],
    xp: 0,
    maxXp: 100,
    level: 1,
    hearts: 5,
    streak: 0,
    survivalMode: false,
    cognitiveLoadScore: 45,
    focusScore: 82
  },
  goals: [],
  plans: [],
  notifications: [
    { id: 'n1', title: 'Welcome!', message: 'Thanks for joining. Create your first goal to start tracking.', time: 'Just now', read: false, type: 'info' }
  ],
  logs: [],
  transactions: [],
  busySlots: [],
  scheduledBlocks: [],
  riskReports: {},
  aiMetrics: { plannedTasks: 0, completedTasks: 0, totalSlippage: 0, reschedules: 0, predictedFailures: 0, examReadiness: 65, consistencyScore: 78 },
  peerGroups: [
      {
          id: 'pg1', name: 'Calculus Study Group', 
          members: [
              { name: 'You', avatar: '', status: 'online' },
              { name: 'Sarah', avatar: '', status: 'studying' },
              { name: 'Mike', avatar: '', status: 'offline' }
          ],
          sharedPlans: ['p1']
      }
  ],
  chatHistory: [
      { id: 'm1', sender: 'ai', text: "Hi! I'm your AI Academic Mentor. Upload your notes to get started!", timestamp: new Date().toISOString() }
  ],
  smartTemplates: COURSE_TEMPLATES,
  roadmaps: [],
  flashcards: [],
  embeddings: [],
  history: []
};

class MockBackendService {
  private db: Database;

  constructor() {
    this.db = this.load();
  }

  private load(): Database {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
          const parsed = JSON.parse(stored);
          return { ...INITIAL_DB, ...parsed };
      }
      return JSON.parse(JSON.stringify(INITIAL_DB));
    } catch (e) {
      console.error("Database load error", e);
      return INITIAL_DB;
    }
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.error("Database save error", e);
    }
  }

  getRawDatabase(): string {
      return JSON.stringify(this.db, null, 2);
  }

  // --- USER OPERATIONS ---
  getUser(): User { return { ...this.db.user }; }
  updateUser(updates: Partial<User>): User {
    this.db.user = { ...this.db.user, ...updates };
    this.save();
    return this.db.user;
  }
  resetUser(isDemo: boolean = false): Database {
      this.db = JSON.parse(JSON.stringify(INITIAL_DB));
      this.save();
      return this.db;
  }

  // --- CORE DATA OPERATIONS ---
  getGoals(): Goal[] { return this.db.goals; }
  addGoal(goal: Goal): Goal { this.db.goals.push(goal); this.save(); return goal; }
  deleteGoal(id: string): void {
    this.db.goals = this.db.goals.filter(g => g.id !== id);
    this.db.logs = this.db.logs.filter(l => l.goalId !== id);
    this.save();
  }

  toggleHabitCompletion(goalId: string, habitId: string): { goal: Goal, user: User, completed: boolean } {
    const goalIndex = this.db.goals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) throw new Error("Goal not found");

    const habitIndex = this.db.goals[goalIndex].habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) throw new Error("Habit not found");

    const habit = this.db.goals[goalIndex].habits[habitIndex];
    const newStatus = !habit.completed;
    const today = new Date().toISOString().split('T')[0];

    this.db.goals[goalIndex].habits[habitIndex].completed = newStatus;
    
    if (newStatus) {
      this.db.logs.push({
        id: `l_${Date.now()}_${Math.random()}`,
        date: today,
        goalId,
        habitId,
        timestamp: Date.now()
      });
      this.db.goals[goalIndex].habits[habitIndex].streak += 1;
    } else {
      this.db.logs = this.db.logs.filter(l => !(l.habitId === habitId && l.date === today));
      this.db.goals[goalIndex].habits[habitIndex].streak = Math.max(0, this.db.goals[goalIndex].habits[habitIndex].streak - 1);
    }

    const habits = this.db.goals[goalIndex].habits;
    const completedCount = habits.filter(h => h.completed).length;
    this.db.goals[goalIndex].progress = Math.round((completedCount / habits.length) * 100);

    this.recalculateUserStats(today);
    this.save();
    
    return { 
      goal: this.db.goals[goalIndex], 
      user: this.db.user,
      completed: newStatus
    };
  }

  private recalculateUserStats(today: string) {
    const logsToday = this.db.logs.filter(l => l.date === today);
    const hasActivityToday = logsToday.length > 0;
    const totalLogs = this.db.logs.length;
    let newXp = totalLogs * 20;
    let level = 1;
    let maxXp = 100;
    while (newXp >= maxXp) {
        newXp -= maxXp;
        level++;
        maxXp = Math.floor(maxXp * 1.5);
    }
    
    const uniqueDates = Array.from(new Set(this.db.logs.map(l => l.date))).sort();
    let currentStreak = 0;
    if (uniqueDates.length > 0) {
        const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
             let streakCount = 1;
             for (let i = uniqueDates.length - 1; i > 0; i--) {
                 const curr = new Date(uniqueDates[i]);
                 const prev = new Date(uniqueDates[i-1]);
                 const diff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
                 if (diff === 1) streakCount++;
                 else break;
             }
             currentStreak = streakCount;
        }
    }

    this.db.user.xp = newXp;
    this.db.user.maxXp = maxXp;
    this.db.user.level = level;
    this.db.user.streak = currentStreak;
    if (hasActivityToday) this.db.user.lastActiveDate = today;
  }
  
  getActivityMap(): Record<string, number> {
     const map: Record<string, number> = {};
     this.db.logs.forEach(log => {
         map[log.date] = (map[log.date] || 0) + 1;
     });
     return map;
  }

  getTransactions(): Transaction[] { return this.db.transactions; }
  addTransaction(transaction: Transaction) { this.db.transactions.unshift(transaction); this.save(); }

  getPlans() { return this.db.plans; }
  addPlan(plan: StudyPlan) { 
      plan.tasks = prioritizeTasks(plan.tasks, new Date());
      if (this.db.user.survivalMode) {
          plan.tasks = compressTasks(plan.tasks);
      }
      this.db.plans.push(plan); 
      this.runScheduler();
      this.save(); 
  }
  
  togglePlanTask(planId: string, taskId: string) {
      const plan = this.db.plans.find(p => p.id === planId);
      if(plan) {
          const task = plan.tasks.find(t => t.id === taskId);
          if(task) {
              task.isCompleted = !task.isCompleted;
              this.save();
          }
      }
  }

  getNotifications() { return this.db.notifications; }
  addNotification(n: Notification) { this.db.notifications.unshift(n); this.save(); }
  markAllNotificationsRead() { this.db.notifications.forEach(n => n.read = true); this.save(); }

  // --- AI PLANNER METHODS ---

  getScheduledBlocks() { return this.db.scheduledBlocks; }
  getRiskReports() { return this.db.riskReports; }
  getAIMetrics() { return this.db.aiMetrics; }
  
  // Advanced AI Methods
  getPeerGroups() { return this.db.peerGroups; }
  getChatHistory() { return this.db.chatHistory; }
  addChatMessage(msg: ChatMessage) { this.db.chatHistory.push(msg); this.save(); }
  getSmartTemplates() { return this.db.smartTemplates; }

  // --- STUDY ASSISTANT METHODS ---
  getRoadmaps() { return this.db.roadmaps; }
  setRoadmaps(roadmaps: Roadmap[]) { this.db.roadmaps = roadmaps; this.save(); }
  addRoadmap(roadmap: Roadmap) { 
      this.db.roadmaps = [roadmap]; // Current implementation focuses on single active roadmap
      this.save();
      return roadmap;
  }
  
  getFlashcards() { return this.db.flashcards; }
  setFlashcards(cards: Flashcard[]) { this.db.flashcards = cards; this.save(); }
  addFlashcards(cards: Flashcard[]) {
      const existingIds = new Set(this.db.flashcards.map(f => f.id));
      const newCards = cards.filter(c => !existingIds.has(c.id));
      this.db.flashcards.push(...newCards);
      this.save();
  }
  
  getEmbeddings() { return this.db.embeddings; }
  setEmbeddings(emb: EmbeddingEntry[]) { this.db.embeddings = emb; this.save(); }
  addEmbeddings(embeddings: EmbeddingEntry[]) {
      this.db.embeddings.push(...embeddings);
      this.save();
  }
  
  updateNodeSummary(roadmapId: string, nodeId: string, overview: string, detailed: string) {
      const roadmap = this.db.roadmaps.find(r => r.id === roadmapId);
      if (roadmap) {
          const node = roadmap.nodes.find(n => n.id === nodeId);
          if (node) {
              node.summaryOverview = overview;
              node.summaryDetailed = detailed;
              this.save();
              
              // Update History if exists
              const historyItem = this.db.history.find(h => h.roadmapId === roadmapId);
              if (historyItem) {
                  const hNode = historyItem.nodes.find(n => n.id === nodeId);
                  if (hNode) {
                      hNode.summaryOverview = overview;
                      hNode.summaryDetailed = detailed;
                      this.save();
                  }
              }
          }
      }
  }
  
  addScheduledBlocks(blocks: ScheduledBlock[]) {
      this.db.scheduledBlocks.push(...blocks);
      this.save();
  }

  // --- HISTORY MANAGEMENT ---
  getHistory(): HistoryItem[] { return this.db.history; }
  addHistory(item: HistoryItem) {
      this.db.history.unshift(item);
      this.save();
  }
  deleteHistory(id: string) {
      this.db.history = this.db.history.filter(h => h.id !== id);
      this.save();
  }
  clearHistory() {
      this.db.history = [];
      this.save();
  }

  // Internal Scheduler Runner
  runScheduler() {
      const now = new Date();
      const horizon = addMinutes(now, 7 * 24 * 60);
      
      this.db.plans.forEach(p => {
          p.tasks = applyFocusMode(p.tasks);
      });

      const schedule = scheduleTasks(this.db.plans, this.db.busySlots, now, horizon);
      this.db.scheduledBlocks = schedule;
      
      const allTasks = this.db.plans.flatMap(p => p.tasks);
      const report = computeRiskMetrics(this.db.user, allTasks, schedule, now);
      this.db.riskReports = report;

      const todaysBlocks = schedule.filter(b => b.assignedDay === now.toISOString().split('T')[0]);
      this.db.user.cognitiveLoadScore = calculateCognitiveLoad(allTasks, todaysBlocks);
      
      const highRisks = Object.values(report).filter(r => r.riskLevel === 'high');
      if (highRisks.length > 0) {
          const existingAlert = this.db.notifications.find(n => n.id.startsWith('alert_risk_'));
          if (!existingAlert) {
              this.addNotification({
                  id: `alert_risk_${Date.now()}`,
                  title: 'Intervention Alert',
                  message: `You are at high risk of missing ${highRisks.length} tasks. Survival Mode recommended.`,
                  time: 'Just now',
                  read: false,
                  type: 'alert'
              });
          }
      }

      const completedCount = allTasks.filter(t => t.isCompleted).length;
      const prediction = predictLearningOutcome(this.db.user, allTasks, completedCount);
      this.db.aiMetrics.predictedScore = prediction.score;
      this.db.aiMetrics.requiredEffortGap = prediction.gap;

      this.save();
  }

  runDemoScenario() {
      this.db.plans = [];
      this.db.scheduledBlocks = [];
      this.db.busySlots = [];
      this.db.riskReports = {};

      const now = new Date();
      const tomorrow = addMinutes(now, 24*60);
      const dayAfter = addMinutes(now, 48*60);

      this.db.busySlots = [
          { start: addMinutes(now, 60), end: addMinutes(now, 120), title: "Math Class" },
          { start: addMinutes(now, 240), end: addMinutes(now, 300), title: "Lunch" },
          { start: addMinutes(tomorrow, 60), end: addMinutes(tomorrow, 120), title: "Physics Class" },
      ];

      this.db.plans.push({
          id: 'p1', title: 'Calculus Midterm', subject: 'Math', startDate: now.toISOString().split('T')[0], endDate: dayAfter.toISOString().split('T')[0], priority: 'high',
          tasks: [
              { id: 't1', title: 'Review Limits', isCompleted: false, estimatedMinutes: 60, dueDate: addMinutes(now, 180).toISOString(), difficulty: 'medium', subjectWeightage: 30 },
              { id: 't2', title: 'Practice Problems', isCompleted: false, estimatedMinutes: 90, dueDate: addMinutes(tomorrow, 300).toISOString(), difficulty: 'hard', subjectWeightage: 40 }
          ]
      });
      this.runScheduler();
      const report = this.db.riskReports;
      const highRisks = Object.values(report).filter(r => r.riskLevel === 'high').length;
      this.db.aiMetrics = {
          plannedTasks: this.db.scheduledBlocks.length,
          completedTasks: 0,
          totalSlippage: 2.5,
          reschedules: 0,
          predictedFailures: highRisks,
          examReadiness: 72,
          consistencyScore: 85,
          predictedScore: 78,
          requiredEffortGap: 12
      };
      this.save();
      return { schedule: this.db.scheduledBlocks, report, metrics: this.db.aiMetrics };
  }

  applyAutoReschedule() {
      const report = Object.values(this.db.riskReports).find(r => r.riskLevel === 'high' || r.riskLevel === 'medium');
      if (!report) return null;

      const plan = this.db.plans.find(p => p.tasks.some(t => t.id === report.taskId));
      const task = plan?.tasks.find(t => t.id === report.taskId);
      if (!task || !task.estimatedMinutes || !task.dueDate) return null;

      const proposal = proposeReschedule(
          task.id, 
          task.estimatedMinutes, 
          new Date(task.dueDate), 
          this.db.scheduledBlocks, 
          this.db.busySlots, 
          new Date()
      );

      if (proposal) {
          if (proposal.originalSlot) {
               this.db.scheduledBlocks = this.db.scheduledBlocks.filter(b => b.id !== proposal.originalSlot!.id);
          }
          this.db.scheduledBlocks.push(proposal.proposedSlot);
          this.db.aiMetrics.reschedules += 1;
          this.db.riskReports[task.id].riskLevel = 'low';
          this.db.riskReports[task.id].pMiss = 0.2;
          this.db.riskReports[task.id].reasons = ['Rescheduled to safe slot'];
          this.save();
          return proposal;
      }
      return null;
  }
}

export const MockBackend = new MockBackendService();
