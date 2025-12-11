
import { Goal, User, ActivityLog, StudyPlan, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, BusySlot, PeerGroup, ChatMessage, SmartTemplate, Roadmap, Flashcard, EmbeddingEntry, HistoryItem, FeedbackSubmission, GroupMessage, GroupInvite, GroupSession, GroupAttachment, FriendRequest } from '../types';
import { scheduleTasks } from './scheduler';
import { computeRiskMetrics, predictLearningOutcome } from './predictor';
import { proposeReschedule } from './rescheduler';
import { addMinutes } from '../utils/dateMath';
import { calculateCognitiveLoad, compressTasks, prioritizeTasks, applyFocusMode } from './optimizer';
import { COURSE_TEMPLATES } from './templates';
import { queryGroupMentor } from './mentorRAG';
import { sendInviteEmail } from '../api/invite';

// --- DATABASE SCHEMA SIMULATION ---
interface Database {
  user: User;
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
  chatHistory: ChatMessage[]; 
  smartTemplates: SmartTemplate[];
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
  embeddings: EmbeddingEntry[];
  history: HistoryItem[];
  feedback: FeedbackSubmission[];
  summaries: Record<string, Record<string, { overview: string, detailed: string }>>;
  friendRequests: FriendRequest[];
  featureFlags: { enableAIPlanner: boolean; enableAdvancedAI: boolean };
}

const STORAGE_KEY = 'pl_backend_db_v14_final';

const MOCK_USERS = [
    { id: 'u2', name: 'Sarah Jenkins', username: 'sarah_j', email: 'sarah@example.com', avatar: '' },
    { id: 'u3', name: 'Mike Ross', username: 'mike_r', email: 'mike@example.com', avatar: '' },
    { id: 'u4', name: 'Jessica Pearson', username: 'jess_p', email: 'jessica@example.com', avatar: '' },
    { id: 'u5', name: 'Harvey Specter', username: 'harvey_s', email: 'harvey@example.com', avatar: '' },
];

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
    focusScore: 82,
    subscriptionStatus: 'active',
    aiQuotaLimit: 10,
    uploadsLimit: 3,
    usage: { aiTokensUsed: 0, uploadsUsed: 0, lastReset: new Date().toISOString() },
    friends: [],
    friendRequests: []
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
  peerGroups: [],
  groupInvites: [],
  chatHistory: [
      { id: 'm1', sender: 'ai', text: "Hi! I'm your AI Academic Mentor. Upload your notes to get started!", timestamp: new Date().toISOString() }
  ],
  smartTemplates: COURSE_TEMPLATES,
  roadmaps: [],
  flashcards: [],
  embeddings: [],
  history: [],
  feedback: [],
  summaries: {},
  friendRequests: [],
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
          const mergedUser = { ...INITIAL_DB.user, ...parsed.user };
          return { ...INITIAL_DB, ...parsed, user: mergedUser };
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

  resetState() {
      localStorage.removeItem(STORAGE_KEY);
      this.db = JSON.parse(JSON.stringify(INITIAL_DB));
      this.save();
  }

  // --- AUTHENTICATION ---
  
  authenticate(email: string, password?: string): User | null {
      this.db.user.email = email;
      this.save();
      return this.db.user;
  }

  signup(name: string, email: string, password?: string): User {
      this.db.user.name = name;
      this.db.user.email = email;
      this.db.user.username = email.split('@')[0];
      this.db.user.joinedDate = new Date().toISOString().split('T')[0];
      this.save();
      return this.db.user;
  }

  logout() {
      // No-op
  }

  getCurrentUser(): User | null {
      return this.db.user;
  }

  // --- SUBSCRIPTION & USAGE ---
  
  checkUsage(type: 'ai' | 'upload'): boolean {
      const { plan, usage, aiQuotaLimit, uploadsLimit } = this.db.user;
      if (plan === 'premium') return true;
      if (type === 'ai') return usage.aiTokensUsed < (aiQuotaLimit || 10);
      else return usage.uploadsUsed < (uploadsLimit || 3);
  }

  incrementUsage(type: 'ai' | 'upload') {
      if (type === 'ai') this.db.user.usage.aiTokensUsed += 1;
      else this.db.user.usage.uploadsUsed += 1;
      this.save();
  }

  // --- SOCIAL ---
  
  searchUsers(query: string) {
      const lowerQ = query.toLowerCase();
      const friends = this.db.user.friends || [];
      return MOCK_USERS.filter(u => 
          u.id !== this.db.user.id &&
          !friends.includes(u.id) &&
          (u.username.toLowerCase().includes(lowerQ) || 
           u.name.toLowerCase().includes(lowerQ) ||
           u.email.toLowerCase().includes(lowerQ))
      );
  }

  sendFriendRequest(toUserId: string): boolean {
      const existing = this.db.friendRequests.find(r => r.fromUserId === this.db.user.id && r.toUserId === toUserId);
      if (existing) return false;

      const req: FriendRequest = {
          id: `fr_${Date.now()}`,
          fromUserId: this.db.user.id,
          fromUserName: this.db.user.name,
          toUserId: toUserId,
          status: 'pending',
          createdAt: new Date().toISOString()
      };
      
      this.db.friendRequests.push(req);
      this.save();
      return true;
  }

  getFriendRequests(): FriendRequest[] {
      return this.db.friendRequests.filter(r => r.toUserId === this.db.user.id || r.fromUserId === this.db.user.id);
  }

  acceptFriendRequest(requestId: string) {
      const req = this.db.friendRequests.find(r => r.id === requestId);
      if (!req || req.status !== 'pending') return;

      req.status = 'accepted';
      
      if (!this.db.user.friends.includes(req.fromUserId) && req.toUserId === this.db.user.id) {
          this.db.user.friends.push(req.fromUserId);
      } else if (!this.db.user.friends.includes(req.toUserId) && req.fromUserId === this.db.user.id) {
          this.db.user.friends.push(req.toUserId);
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
      return this.db.user.friends.map(fid => MOCK_USERS.find(u => u.id === fid)).filter(Boolean);
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

  // --- USER OPERATIONS ---
  getUser(): User { return { ...this.db.user }; }
  updateUser(updates: Partial<User>): User {
    this.db.user = { ...this.db.user, ...updates };
    this.save();
    return this.db.user;
  }

  // --- GROUP OPERATIONS ---
  
  getGroups(): PeerGroup[] {
      return this.db.peerGroups;
  }

  createGroup(name: string, description: string, settings: { allowInvites: boolean, requireApproval: boolean }): PeerGroup {
      const newGroup: PeerGroup = {
          id: `pg_${Date.now()}`,
          name,
          description,
          creatorId: this.db.user.id,
          members: [
              { 
                  userId: this.db.user.id, 
                  name: this.db.user.name, 
                  avatar: this.db.user.avatar || '', 
                  role: 'owner',
                  status: 'online',
                  joinedAt: new Date().toISOString()
              }
          ],
          createdAt: new Date().toISOString(),
          settings,
          sharedPlans: [],
          messages: [],
          attachments: [],
          sessions: [],
          sharedRoadmaps: []
      };
      this.db.peerGroups.push(newGroup);
      this.save();
      return newGroup;
  }

  updateGroup(groupId: string, updates: Partial<PeerGroup>) {
      const idx = this.db.peerGroups.findIndex(g => g.id === groupId);
      if (idx !== -1) {
          this.db.peerGroups[idx] = { ...this.db.peerGroups[idx], ...updates };
          this.save();
          this.notifyGroupSubscribers(groupId);
      }
  }

  deleteGroup(groupId: string) {
      this.db.peerGroups = this.db.peerGroups.filter(g => g.id !== groupId);
      this.save();
  }

  async inviteToGroup(groupId: string, emailOrId: string, isId: boolean = false): Promise<string> {
      if (isId) {
          const user = MOCK_USERS.find(u => u.id === emailOrId);
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
      const invite: GroupInvite = {
          id: `gi_${Date.now()}`,
          groupId,
          inviterId: this.db.user.id,
          inviteeEmail: isId ? undefined : emailOrId,
          inviteeId: isId ? emailOrId : undefined,
          token,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      this.db.groupInvites.push(invite);
      this.save();

      const group = this.db.peerGroups.find(g => g.id === groupId);
      const link = `${window.location.origin}/#/study/group?invite=${token}`;
      
      if (!isId) {
          await sendInviteEmail(emailOrId, link, this.db.user.name, group?.name || 'Study Group');
      }
      
      return token;
  }

  acceptInvite(token: string) {
      const invite = this.db.groupInvites.find(i => i.token === token);
      if (!invite) throw new Error("Invalid or expired invite");
      if (invite.status !== 'pending' && invite.inviteeId !== this.db.user.id) throw new Error("Invite invalid");
      
      if (new Date(invite.expiresAt!) < new Date()) {
          invite.status = 'expired';
          this.save();
          throw new Error("Invite expired");
      }

      const group = this.db.peerGroups.find(g => g.id === invite.groupId);
      if (!group) throw new Error("Group not found");

      if (group.members.some(m => m.userId === this.db.user.id)) return; // Already joined

      group.members.push({
          userId: this.db.user.id,
          name: this.db.user.name,
          avatar: this.db.user.avatar || '',
          role: 'member',
          status: 'online',
          joinedAt: new Date().toISOString()
      });

      invite.status = 'accepted';
      invite.inviteeId = this.db.user.id;
      this.save();
      this.notifyGroupSubscribers(group.id);
  }

  removeGroupMember(groupId: string, userId: string) {
      const group = this.db.peerGroups.find(g => g.id === groupId);
      if (group) {
          group.members = group.members.filter(m => m.userId !== userId);
          this.save();
          this.notifyGroupSubscribers(groupId);
      }
  }

  async sendGroupMessage(groupId: string, text: string, attachments?: GroupAttachment[]) {
      const group = this.db.peerGroups.find(g => g.id === groupId);
      if (!group) return;

      const msg: GroupMessage = {
          id: `gm_${Date.now()}`,
          groupId,
          senderId: this.db.user.id,
          senderName: this.db.user.name,
          text,
          attachments,
          timestamp: new Date().toISOString(),
          readBy: [this.db.user.id]
      };

      if (!group.messages) group.messages = [];
      group.messages.push(msg);
      this.save();
      this.notifyGroupSubscribers(groupId);

      // AI Logic
      if (text.toLowerCase().includes('@ai') || (msg.mentions && msg.mentions.includes('ai'))) {
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
                      text: '⚠️ AI Usage Limit Reached. Upgrade to Pro/Premium to continue chatting with AI.',
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
      
      // Use all embeddings if no specific shared ones to ensure demo works
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
      return new Promise((resolve) => {
          setTimeout(() => {
              const attachment: GroupAttachment = {
                  id: `att_${Date.now()}`,
                  name: file.name,
                  url: '#',
                  type: file.type,
                  size: file.size,
                  uploadedBy: this.db.user.id,
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

  // --- FEATURE FLAGS ---
  getFeatureFlags() { return this.db.featureFlags || { enableAIPlanner: true, enableAdvancedAI: true }; }
  toggleFeature(feature: 'enableAIPlanner' | 'enableAdvancedAI') {
      if (!this.db.featureFlags) this.db.featureFlags = { enableAIPlanner: true, enableAdvancedAI: true };
      this.db.featureFlags[feature] = !this.db.featureFlags[feature];
      this.save();
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

    // Simple exp calculation
    this.db.user.xp += newStatus ? 10 : -10;
    
    this.save();
    
    return { 
      goal: this.db.goals[goalIndex], 
      user: this.db.user,
      completed: newStatus
    };
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

  getScheduledBlocks() { return this.db.scheduledBlocks; }
  getRiskReports() { return this.db.riskReports; }
  getAIMetrics() { return this.db.aiMetrics; }
  getPeerGroups() { return this.db.peerGroups; }
  getChatHistory() { return this.db.chatHistory; }
  addChatMessage(msg: ChatMessage) { this.db.chatHistory.push(msg); this.save(); }
  getSmartTemplates() { return this.db.smartTemplates; }
  getRoadmaps() { return this.db.roadmaps; }
  setRoadmaps(roadmaps: Roadmap[]) { this.db.roadmaps = roadmaps; this.save(); }
  addRoadmap(roadmap: Roadmap) { 
      this.db.roadmaps = [roadmap]; 
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
              if (!this.db.summaries[roadmapId]) this.db.summaries[roadmapId] = {};
              this.db.summaries[roadmapId][nodeId] = { overview, detailed };
              this.save();
              
              const historyItem = this.db.history.find(h => h.roadmapId === roadmapId);
              if (historyItem) {
                  if (!historyItem.summaries) historyItem.summaries = {};
                  historyItem.summaries[nodeId] = { overview, detailed };
                  this.save();
              }
          }
      }
  }
  addScheduledBlocks(blocks: ScheduledBlock[]) {
      this.db.scheduledBlocks.push(...blocks);
      this.save();
  }
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
  runScheduler() {
      const now = new Date();
      const horizon = addMinutes(now, 7 * 24 * 60);
      this.db.plans.forEach(p => { p.tasks = applyFocusMode(p.tasks); });
      const schedule = scheduleTasks(this.db.plans, this.db.busySlots, now, horizon);
      this.db.scheduledBlocks = schedule;
      const allTasks = this.db.plans.flatMap(p => p.tasks);
      const report = computeRiskMetrics(this.db.user, allTasks, schedule, now);
      this.db.riskReports = report;
      const todaysBlocks = schedule.filter(b => b.assignedDay === now.toISOString().split('T')[0]);
      this.db.user.cognitiveLoadScore = calculateCognitiveLoad(allTasks, todaysBlocks);
      const riskReportsArray = Object.values(report) as RiskReport[];
      const highRisks = riskReportsArray.filter(r => r.riskLevel === 'high');
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
      // Mock scenario reset
      this.db.plans = []; this.db.scheduledBlocks = []; this.db.busySlots = []; this.db.riskReports = {};
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
      this.save();
  }
  applyAutoReschedule() {
      const reports = Object.values(this.db.riskReports) as RiskReport[];
      const report = reports.find(r => r.riskLevel === 'high' || r.riskLevel === 'medium');
      if (!report) return null;
      const plan = this.db.plans.find(p => p.tasks.some(t => t.id === report.taskId));
      const task = plan?.tasks.find(t => t.id === report.taskId);
      if (!task || !task.estimatedMinutes || !task.dueDate) return null;
      const proposal = proposeReschedule(
          task.id, task.estimatedMinutes, new Date(task.dueDate), this.db.scheduledBlocks, this.db.busySlots, new Date()
      );
      if (proposal) {
          if (proposal.originalSlot) {
               this.db.scheduledBlocks = this.db.scheduledBlocks.filter(b => b.id !== proposal.originalSlot!.id);
          }
          this.db.scheduledBlocks.push(proposal.proposedSlot);
          this.db.aiMetrics.reschedules += 1;
          if (this.db.riskReports[task.id]) {
              this.db.riskReports[task.id].riskLevel = 'low';
              this.db.riskReports[task.id].pMiss = 0.2;
              this.db.riskReports[task.id].reasons = ['Rescheduled to safe slot'];
          }
          this.save();
          return proposal;
      }
      return null;
  }
  submitFeedback(feedback: FeedbackSubmission) {
    this.db.feedback.push(feedback);
    this.save();
  }
}

export const MockBackend = new MockBackendService();
