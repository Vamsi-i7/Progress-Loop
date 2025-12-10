
import { Goal, User, ActivityLog, StudyPlan, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, BusySlot, PeerGroup, ChatMessage, SmartTemplate, Roadmap, Flashcard, EmbeddingEntry, HistoryItem, FeedbackSubmission, GroupMessage, GroupInvite, GroupSession, GroupAttachment, FriendRequest } from '../types';
import { COURSE_TEMPLATES } from './templates';
import { queryGroupMentor } from './mentorRAG';
import { sendInviteEmail } from '../api/invite';
import { scheduleTasks } from './scheduler';
import { computeRiskMetrics, predictLearningOutcome } from './predictor';
import { proposeReschedule } from './rescheduler';
import { addMinutes } from '../utils/dateMath';
import { calculateCognitiveLoad, compressTasks, prioritizeTasks, applyFocusMode } from './optimizer';

// --- DATABASE SCHEMA SIMULATION ---
interface Database {
  users: User[];
  goals: Goal[];
  plans: StudyPlan[];
  notifications: Notification[];
  logs: ActivityLog[];
  transactions: Transaction[];
  busySlots: BusySlot[];
  scheduledBlocks: ScheduledBlock[];
  riskReports: Record<string, RiskReport>;
  aiMetrics: AIMetrics;
  peerGroups: PeerGroup[];
  groupInvites: GroupInvite[];
  chatHistory: Record<string, ChatMessage[]>; // Keyed by userId
  smartTemplates: SmartTemplate[];
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
  embeddings: EmbeddingEntry[];
  history: HistoryItem[];
  feedback: FeedbackSubmission[];
  summaries: Record<string, Record<string, { overview: string, detailed: string }>>;
  friendRequests: FriendRequest[];
  currentUserSession: string | null; // userId
  featureFlags: { enableAIPlanner: boolean; enableAdvancedAI: boolean };
}

const STORAGE_KEY = 'pl_backend_db_v15_prod';

// Seed Data
const SEED_USERS: User[] = [
    { 
        id: 'u1', name: 'Demo Student', username: 'demo', email: 'demo@example.com', password: 'password', 
        plan: 'free', joinedDate: new Date().toISOString(), lastActiveDate: new Date().toISOString(),
        xp: 1500, maxXp: 2000, level: 5, hearts: 5, streak: 12,
        usage: { aiTokensUsed: 5, uploadsUsed: 1, flashcardsGenerated: 10, lastReset: new Date().toISOString() },
        friends: ['u2'], friendRequests: [] 
    },
    { 
        id: 'u2', name: 'Sarah Jenkins', username: 'sarah_j', email: 'sarah@example.com', password: 'password',
        plan: 'pro', joinedDate: new Date().toISOString(), lastActiveDate: new Date().toISOString(),
        xp: 3200, maxXp: 5000, level: 8, hearts: 5, streak: 45,
        usage: { aiTokensUsed: 0, uploadsUsed: 0, flashcardsGenerated: 0, lastReset: new Date().toISOString() },
        friends: ['u1'], friendRequests: [] 
    }
];

const SEED_GROUPS: PeerGroup[] = [
    {
        id: 'pg_seed_1', name: 'Physics Squad', description: 'Mastering mechanics and thermo.', creatorId: 'u2',
        createdAt: new Date().toISOString(), settings: { allowInvites: true, requireApproval: false },
        members: [
            { userId: 'u2', role: 'owner', joinedAt: new Date().toISOString(), name: 'Sarah Jenkins', status: 'online' },
            { userId: 'u1', role: 'member', joinedAt: new Date().toISOString(), name: 'Demo Student', status: 'studying' }
        ],
        messages: [
            { id: 'm1', groupId: 'pg_seed_1', senderId: 'u2', senderName: 'Sarah Jenkins', text: 'Hey! Did you finish the kinematics worksheet?', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 'm2', groupId: 'pg_seed_1', senderId: 'u1', senderName: 'Demo Student', text: 'Almost done. Stuck on question 5.', timestamp: new Date(Date.now() - 1800000).toISOString() }
        ]
    }
];

const INITIAL_DB: Database = {
  users: SEED_USERS,
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
  peerGroups: SEED_GROUPS,
  groupInvites: [],
  chatHistory: { 'u1': [{ id: 'm1', sender: 'ai', text: "Hi! I'm your AI Academic Mentor. Upload your notes to get started!", timestamp: new Date().toISOString() }] },
  smartTemplates: COURSE_TEMPLATES,
  roadmaps: [],
  flashcards: [],
  embeddings: [],
  history: [],
  feedback: [],
  summaries: {},
  friendRequests: [],
  currentUserSession: null,
  featureFlags: { enableAIPlanner: true, enableAdvancedAI: true }
};

class MockBackendService {
  private db: Database;
  private subscribers: Record<string, ((data: any) => void)[]> = {};

  constructor() {
    this.db = this.load();
  }

  private load(): Database {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
          const parsed = JSON.parse(stored);
          // Ensure structure integrity by merging with initial
          return { ...INITIAL_DB, ...parsed, users: parsed.users || SEED_USERS };
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

  // --- AUTHENTICATION ---
  
  authenticate(email: string, password?: string): User | null {
      const user = this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
          // In mock, we trust password if provided, or auto-login for demo users
          this.db.currentUserSession = user.id;
          this.save();
          return user;
      }
      return null;
  }

  signup(name: string, email: string, password?: string): User {
      const existing = this.db.users.find(u => u.email === email);
      if (existing) throw new Error("User already exists");

      const newUser: User = {
          id: `u_${Date.now()}`,
          name,
          username: email.split('@')[0],
          email,
          password,
          plan: 'free',
          joinedDate: new Date().toISOString(),
          lastActiveDate: new Date().toISOString(),
          xp: 0, maxXp: 100, level: 1, hearts: 5, streak: 0,
          usage: { aiTokensUsed: 0, uploadsUsed: 0, flashcardsGenerated: 0, lastReset: new Date().toISOString() },
          friends: [],
          friendRequests: []
      };
      this.db.users.push(newUser);
      this.db.currentUserSession = newUser.id;
      this.save();
      return newUser;
  }

  logout() {
      this.db.currentUserSession = null;
      this.save();
  }

  getCurrentUser(): User | null {
      if (!this.db.currentUserSession) return null;
      return this.db.users.find(u => u.id === this.db.currentUserSession) || null;
  }

  // --- USAGE & QUOTA ---
  
  checkUsage(type: 'ai' | 'upload'): boolean {
      const user = this.getCurrentUser();
      if (!user) return false;
      
      const limits = {
          free: { ai: 20, upload: 3 },
          pro: { ai: 500, upload: 50 },
          premium: { ai: 10000, upload: 1000 }
      };
      
      const limit = limits[user.plan][type];
      const used = type === 'ai' ? user.usage.aiTokensUsed : user.usage.uploadsUsed;
      
      return used < limit;
  }

  incrementUsage(type: 'ai' | 'upload') {
      const user = this.getCurrentUser();
      if (user) {
          if (type === 'ai') user.usage.aiTokensUsed += 1;
          else user.usage.uploadsUsed += 1;
          this.updateUser(user);
      }
  }

  // --- SOCIAL & FRIENDS ---

  searchUsers(query: string) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return [];
      const lowerQ = query.toLowerCase();
      return this.db.users.filter(u => 
          u.id !== currentUser.id &&
          !currentUser.friends.includes(u.id) &&
          (u.username.toLowerCase().includes(lowerQ) || 
           u.name.toLowerCase().includes(lowerQ) ||
           u.email.toLowerCase().includes(lowerQ))
      );
  }

  sendFriendRequest(toUserId: string): boolean {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;
      
      const existing = this.db.friendRequests.find(r => r.fromUserId === currentUser.id && r.toUserId === toUserId);
      if (existing) return false;

      const req: FriendRequest = {
          id: `fr_${Date.now()}`,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: toUserId,
          status: 'pending',
          createdAt: new Date().toISOString()
      };
      
      this.db.friendRequests.push(req);
      this.save();
      return true;
  }

  getFriendRequests(): FriendRequest[] {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return [];
      return this.db.friendRequests.filter(r => r.toUserId === currentUser.id || r.fromUserId === currentUser.id);
  }

  acceptFriendRequest(requestId: string) {
      const req = this.db.friendRequests.find(r => r.id === requestId);
      if (!req || req.status !== 'pending') return;

      req.status = 'accepted';
      
      const toUser = this.db.users.find(u => u.id === req.toUserId);
      const fromUser = this.db.users.find(u => u.id === req.fromUserId);

      if (toUser && fromUser) {
          if (!toUser.friends.includes(fromUser.id)) toUser.friends.push(fromUser.id);
          if (!fromUser.friends.includes(toUser.id)) fromUser.friends.push(toUser.id);
      }
      
      this.save();
  }

  rejectFriendRequest(requestId: string) {
      const req = this.db.friendRequests.find(r => r.id === requestId);
      if (req) {
          req.status = 'declined';
          this.save();
      }
  }

  getFriends() {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return [];
      return currentUser.friends.map(fid => this.db.users.find(u => u.id === fid)).filter(Boolean);
  }

  // --- PUB/SUB FOR REALTIME MOCK ---
  subscribeToGroup(groupId: string, callback: (data: any) => void) {
      if (!this.subscribers[groupId]) this.subscribers[groupId] = [];
      this.subscribers[groupId].push(callback);
      const group = this.db.peerGroups.find(g => g.id === groupId);
      if (group) callback(group);
      
      return () => {
          this.subscribers[groupId] = this.subscribers[groupId].filter(cb => cb !== callback);
      };
  }

  private notifyGroupSubscribers(groupId: string) {
      const group = this.db.peerGroups.find(g => g.id === groupId);
      if (group && this.subscribers[groupId]) {
          this.subscribers[groupId].forEach(cb => cb(group));
      }
  }

  // --- USER DATA ---
  getUser(): User { 
      const u = this.getCurrentUser();
      return u || SEED_USERS[0]; // Fallback for safety, though app should redirect
  }
  
  updateUser(updates: Partial<User>): User {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return SEED_USERS[0];
    
    // Update in the big user list
    const idx = this.db.users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
        this.db.users[idx] = { ...this.db.users[idx], ...updates };
        this.save();
        return this.db.users[idx];
    }
    return currentUser;
  }

  // --- GROUP OPERATIONS ---
  
  getGroups(): PeerGroup[] {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return [];
      return this.db.peerGroups.filter(g => g.members.some(m => m.userId === currentUser.id));
  }

  createGroup(name: string, description: string, settings: { allowInvites: boolean, requireApproval: boolean }): PeerGroup {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error("Not logged in");

      const newGroup: PeerGroup = {
          id: `pg_${Date.now()}`,
          name,
          description,
          creatorId: currentUser.id,
          members: [
              { 
                  userId: currentUser.id, 
                  name: currentUser.name, 
                  avatar: currentUser.avatar || '', 
                  role: 'owner',
                  status: 'online',
                  joinedAt: new Date().toISOString()
              }
          ],
          createdAt: new Date().toISOString(),
          settings,
          messages: [],
          attachments: []
      };
      this.db.peerGroups.push(newGroup);
      this.save();
      return newGroup;
  }

  async inviteToGroup(groupId: string, emailOrId: string, isId: boolean = false): Promise<string> {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error("Not logged in");

      if (isId) {
          const user = this.db.users.find(u => u.id === emailOrId);
          if (user) {
              const group = this.db.peerGroups.find(g => g.id === groupId);
              if (group && !group.members.some(m => m.userId === user.id)) {
                  group.members.push({
                      userId: user.id,
                      name: user.name,
                      avatar: '',
                      role: 'member',
                      status: 'offline',
                      joinedAt: new Date().toISOString()
                  });
                  this.save();
                  this.notifyGroupSubscribers(groupId);
                  return 'auto-added';
              }
          }
      }

      const token = `inv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      // Logic for email invitation remains (simulated)
      return token;
  }

  async sendGroupMessage(groupId: string, text: string, attachments?: GroupAttachment[]) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return;

      const group = this.db.peerGroups.find(g => g.id === groupId);
      if (!group) return;

      const msg: GroupMessage = {
          id: `gm_${Date.now()}`,
          groupId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text,
          attachments,
          timestamp: new Date().toISOString(),
          readBy: [currentUser.id]
      };

      if (!group.messages) group.messages = [];
      group.messages.push(msg);
      this.save();
      this.notifyGroupSubscribers(groupId);

      if (text.toLowerCase().includes('@ai')) {
          if (this.checkUsage('ai')) {
              this.incrementUsage('ai');
              this.handleGroupAIResponse(group, text);
          } else {
              setTimeout(() => {
                  if (!group.messages) group.messages = [];
                  group.messages.push({
                      id: `gm_sys_${Date.now()}`,
                      groupId,
                      senderId: 'system',
                      senderName: 'System',
                      text: '⚠️ AI Usage Limit Reached. Upgrade to Pro/Premium.',
                      timestamp: new Date().toISOString()
                  });
                  this.notifyGroupSubscribers(groupId);
              }, 500);
          }
      }
  }

  private async handleGroupAIResponse(group: PeerGroup, userText: string) {
      const recentChat = (group.messages || [])
          .slice(-10)
          .map(m => `${m.senderName}: ${m.text}`)
          .join('\n');
      
      let groupEmbeddings: EmbeddingEntry[] = this.db.embeddings; 

      const query = userText.replace(/@ai/gi, '').trim();
      const { answer, sources } = await queryGroupMentor(query, groupEmbeddings, recentChat);

      const aiMsg: GroupMessage = {
          id: `gm_ai_${Date.now()}`,
          groupId: group.id,
          senderId: 'ai',
          senderName: 'AI Assistant',
          text: answer,
          timestamp: new Date().toISOString(),
          isAi: true,
          readBy: []
      };

      setTimeout(() => {
          if (!group.messages) group.messages = [];
          group.messages.push(aiMsg);
          this.save();
          this.notifyGroupSubscribers(group.id);
      }, 1500);
  }

  uploadGroupAttachment(groupId: string, file: File): Promise<GroupAttachment> {
      const currentUser = this.getCurrentUser();
      return new Promise((resolve) => {
          setTimeout(() => {
              const attachment: GroupAttachment = {
                  id: `att_${Date.now()}`,
                  name: file.name,
                  url: '#', // In real app, S3 url
                  type: file.type,
                  size: file.size,
                  uploadedBy: currentUser?.id || 'unknown',
                  uploadedAt: new Date().toISOString()
              };
              
              const group = this.db.peerGroups.find(g => g.id === groupId);
              if (group) {
                  if (!group.attachments) group.attachments = [];
                  group.attachments.push(attachment);
                  this.save();
                  this.notifyGroupSubscribers(groupId);
              }
              resolve(attachment);
          }, 1000);
      });
  }

  removeGroupMember(groupId: string, userId: string) {
      const group = this.db.peerGroups.find(g => g.id === groupId);
      if (group) {
          group.members = group.members.filter(m => m.userId !== userId);
          this.save();
          this.notifyGroupSubscribers(groupId);
      }
  }

  // --- FEATURE FLAGS ---
  getFeatureFlags() { return this.db.featureFlags; }
  toggleFeature(feature: keyof typeof INITIAL_DB.featureFlags) {
      this.db.featureFlags[feature] = !this.db.featureFlags[feature];
      this.save();
  }

  // --- DATA ACCESSORS ---
  getGoals(): Goal[] { return this.db.goals; }
  addGoal(goal: Goal): Goal { this.db.goals.push(goal); this.save(); return goal; }
  deleteGoal(id: string): void {
    this.db.goals = this.db.goals.filter(g => g.id !== id);
    this.save();
  }
  
  toggleHabitCompletion(goalId: string, habitId: string): void {
      const goal = this.db.goals.find(g => g.id === goalId);
      if (!goal) return;
      const habit = goal.habits.find(h => h.id === habitId);
      if (!habit) return;
      habit.completed = !habit.completed;
      if (habit.completed) {
          habit.streak++;
          this.db.logs.push({ id: `l_${Date.now()}`, date: new Date().toISOString().split('T')[0], goalId, habitId, timestamp: Date.now() });
      } else {
          habit.streak = Math.max(0, habit.streak - 1);
      }
      const completedCount = goal.habits.filter(h => h.completed).length;
      goal.progress = Math.round((completedCount / goal.habits.length) * 100);
      this.save();
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
  addPlan(plan: StudyPlan) { this.db.plans.push(plan); this.save(); }
  togglePlanTask(planId: string, taskId: string) {
      const plan = this.db.plans.find(p => p.id === planId);
      const task = plan?.tasks.find(t => t.id === taskId);
      if (task) { task.isCompleted = !task.isCompleted; this.save(); }
  }
  
  // AI Specific
  getChatHistory(userId?: string) { 
      const uid = userId || this.db.currentUserSession || 'default';
      return this.db.chatHistory[uid] || []; 
  }
  addChatMessage(msg: ChatMessage) {
      const uid = this.db.currentUserSession || 'default';
      if (!this.db.chatHistory[uid]) this.db.chatHistory[uid] = [];
      this.db.chatHistory[uid].push(msg);
      this.save();
  }
  
  getNotifications() { return this.db.notifications; }
  markAllNotificationsRead() { this.db.notifications.forEach(n => n.read = true); this.save(); }
  addNotification(n: Notification) { this.db.notifications.unshift(n); this.save(); }

  // Other Getters
  getScheduledBlocks() { return this.db.scheduledBlocks; }
  addScheduledBlocks(blocks: ScheduledBlock[]) {
      this.db.scheduledBlocks.push(...blocks);
      this.save();
  }
  getRiskReports() { return this.db.riskReports; }
  getAIMetrics() { return this.db.aiMetrics; }
  getSmartTemplates() { return this.db.smartTemplates; }
  getRoadmaps() { return this.db.roadmaps; }
  setRoadmaps(roadmaps: Roadmap[]) { this.db.roadmaps = roadmaps; this.save(); }
  addRoadmap(roadmap: Roadmap) { this.db.roadmaps.unshift(roadmap); this.save(); return roadmap; }
  getFlashcards() { return this.db.flashcards; }
  addFlashcards(cards: Flashcard[]) { this.db.flashcards.push(...cards); this.save(); }
  setFlashcards(cards: Flashcard[]) { this.db.flashcards = cards; this.save(); }
  getEmbeddings() { return this.db.embeddings; }
  addEmbeddings(emb: EmbeddingEntry[]) { this.db.embeddings.push(...emb); this.save(); }
  setEmbeddings(emb: EmbeddingEntry[]) { this.db.embeddings = emb; this.save(); }
  getHistory() { return this.db.history; }
  addHistory(item: HistoryItem) { this.db.history.unshift(item); this.save(); }
  deleteHistory(id: string) { this.db.history = this.db.history.filter(h => h.id !== id); this.save(); }
  clearHistory() { this.db.history = []; this.save(); }
  
  updateNodeSummary(roadmapId: string, nodeId: string, overview: string, detailed: string) {
      if (!this.db.summaries[roadmapId]) this.db.summaries[roadmapId] = {};
      this.db.summaries[roadmapId][nodeId] = { overview, detailed };
      const roadmap = this.db.roadmaps.find(r => r.id === roadmapId);
      const node = roadmap?.nodes.find(n => n.id === nodeId);
      if(node) { node.summaryOverview = overview; node.summaryDetailed = detailed; }
      this.save();
  }

  submitFeedback(f: FeedbackSubmission) { this.db.feedback.push(f); this.save(); }
  
  // Helpers
  runDemoScenario() { /* No-op or simulated data update */ }
  applyAutoReschedule() { /* No-op */ }
  getRawDatabase() { return JSON.stringify(this.db); }
}

export const MockBackend = new MockBackendService();
