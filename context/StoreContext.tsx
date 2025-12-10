
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Goal, StudyPlan, User, ThemeColor, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, PeerGroup, ChatMessage, SmartTemplate, Roadmap, Flashcard, Node, HistoryItem, FriendRequest } from '../types';
import { MockBackend } from '../services/MockBackend';
import { generateContent } from '../services/ai';
import { parseContentToNodes, readFileAsText } from '../services/syllabusParser';
import { generateRoadmap } from '../services/roadmapGenerator';
import { generateEmbeddings } from '../services/embeddings';
import { queryMentor } from '../services/mentorRAG';
import { generateTimetable } from '../services/timetableGenerator';
import { generateFlashcards } from '../services/flashcardGenerator';
import { generateSummaries } from '../services/summarizer';

interface StoreContextType extends AppState {
  toggleTheme: () => void;
  setThemeColor: (color: ThemeColor) => void;
  toggleSidebar: () => void;
  toggleHabit: (goalId: string, habitId: string) => void;
  addGoal: (goal: Goal) => boolean; 
  deleteGoal: (id: string) => void;
  addPlan: (plan: StudyPlan) => void;
  togglePlanTask: (planId: string, taskId: string) => void;
  
  // Auth
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isDemo: boolean;
  startDemo: () => void;
  
  upgradePlan: (plan: 'free' | 'pro' | 'premium') => void;
  markNotificationsAsRead: () => void;
  refreshData: () => void;
  exportData: () => string;
  
  // AI Features
  enableAIPlanner: boolean;
  toggleAIPlanner: () => void;
  enableAdvancedAI: boolean;
  toggleAdvancedAI: () => void;
  runAIDemo: () => Promise<void>;
  applyAIReschedule: () => void;
  toggleSurvivalMode: () => void;
  sendChatMessage: (text: string) => void;
  handleSyllabusUpload: (file: File) => Promise<void>;
  applySmartTemplate: (templateId: string) => void;
  
  // Study Assistant
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
  isUploadModalOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  uploadNotes: (file: File) => Promise<void>;
  generateRoadmapTimetable: (roadmapId: string) => void;
  createNodeFlashcards: (node: Node) => Promise<void>;
  createNodeSummary: (node: Node) => Promise<void>;
  history: HistoryItem[];
  loadHistoryItem: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  
  // Social
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  getFriends: () => any[];
  getFriendRequests: () => FriendRequest[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [user, setUser] = useState<User>(MockBackend.getUser());
  
  // Global State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<Record<string, number>>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('pl_theme') as 'light' | 'dark') || 'light');
  const [themeColor, setThemeColorState] = useState<ThemeColor>('blue');
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  
  // Feature Flags
  const flags = MockBackend.getFeatureFlags();
  const [enableAIPlanner, setEnableAIPlanner] = useState(flags.enableAIPlanner);
  const [enableAdvancedAI, setEnableAdvancedAI] = useState(flags.enableAdvancedAI);
  
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [riskReports, setRiskReports] = useState<Record<string, RiskReport>>({});
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({ plannedTasks: 0, completedTasks: 0, totalSlippage: 0, reschedules: 0, predictedFailures: 0 });
  
  const [peerGroups, setPeerGroups] = useState<PeerGroup[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Refresh data from MockBackend
  const refreshData = () => {
      const currentUser = MockBackend.getUser();
      setUser(currentUser);
      setIsAuthenticated(!!MockBackend.getCurrentUser());
      
      setGoals([...MockBackend.getGoals()]);
      setPlans([...MockBackend.getPlans()]);
      setNotifications([...MockBackend.getNotifications()]);
      setActivityLogs(MockBackend.getActivityMap());
      setRecentTransactions([...MockBackend.getTransactions()]);
      setScheduledBlocks([...MockBackend.getScheduledBlocks()]);
      setRiskReports({...MockBackend.getRiskReports()});
      setAiMetrics({...MockBackend.getAIMetrics()});
      
      setPeerGroups([...MockBackend.getGroups()]);
      setChatHistory([...MockBackend.getChatHistory()]);
      setSmartTemplates([...MockBackend.getSmartTemplates()]);
      setRoadmaps([...MockBackend.getRoadmaps()]);
      setFlashcards([...MockBackend.getFlashcards()]);
      setHistory([...MockBackend.getHistory()]);
      
      const f = MockBackend.getFeatureFlags();
      setEnableAIPlanner(f.enableAIPlanner);
      setEnableAdvancedAI(f.enableAdvancedAI);
  };

  useEffect(() => {
    localStorage.setItem('pl_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Initial Check
  useEffect(() => {
      const u = MockBackend.getCurrentUser();
      if (u) {
          setIsAuthenticated(true);
          refreshData();
      }
  }, []);

  // --- Auth Actions ---
  const login = async (email: string, password?: string) => {
      const u = MockBackend.authenticate(email, password);
      if (u) {
          setIsAuthenticated(true);
          refreshData();
          return true;
      }
      return false;
  };

  const signup = async (name: string, email: string, password?: string) => {
      try {
          MockBackend.signup(name, email, password);
          setIsAuthenticated(true);
          refreshData();
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  };

  const logout = () => {
      MockBackend.logout();
      setIsAuthenticated(false);
      setIsDemo(false);
      window.location.href = '/'; // Hard redirect to clear state visual artifacts
  };

  const startDemo = () => {
      // Switch to demo user
      MockBackend.authenticate('demo@example.com');
      setIsDemo(true);
      setIsAuthenticated(true);
      refreshData();
  };

  // --- Feature Toggles ---
  const toggleAIPlanner = () => {
      MockBackend.toggleFeature('enableAIPlanner');
      refreshData();
  };
  const toggleAdvancedAI = () => {
      MockBackend.toggleFeature('enableAdvancedAI');
      refreshData();
  };

  // --- Core Logic Wrappers ---
  const upgradePlan = (plan: 'free' | 'pro' | 'premium') => { MockBackend.updateUser({ plan }); refreshData(); };
  const markNotificationsAsRead = () => { MockBackend.markAllNotificationsRead(); refreshData(); };
  
  const addGoal = (goal: Goal) => { MockBackend.addGoal(goal); refreshData(); return true; };
  const deleteGoal = (id: string) => { MockBackend.deleteGoal(id); refreshData(); };
  const addPlan = (plan: StudyPlan) => { MockBackend.addPlan(plan); refreshData(); };
  const togglePlanTask = (pid: string, tid: string) => { MockBackend.togglePlanTask(pid, tid); refreshData(); };
  const toggleHabit = (gid: string, hid: string) => { MockBackend.toggleHabitCompletion(gid, hid); refreshData(); };
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const setThemeColor = (c: ThemeColor) => setThemeColorState(c);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const exportData = () => MockBackend.getRawDatabase();

  const runAIDemo = async () => { MockBackend.runDemoScenario(); refreshData(); };
  const applyAIReschedule = () => { MockBackend.applyAutoReschedule(); refreshData(); };
  const toggleSurvivalMode = () => { MockBackend.updateUser({ survivalMode: !user.survivalMode }); refreshData(); };

  // --- AI & Chat ---
  const sendChatMessage = async (text: string) => {
      if (!MockBackend.checkUsage('ai')) {
          alert("AI Limit Reached. Upgrade Plan.");
          return;
      }
      MockBackend.incrementUsage('ai');
      
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString() };
      MockBackend.addChatMessage(userMsg);
      refreshData();

      // Retrieve Context from Vector Store (Mocked in services)
      const embeddings = MockBackend.getEmbeddings();
      const { answer, sources } = await queryMentor(text, embeddings);
      
      const aiMsg: ChatMessage = { 
          id: `ai_${Date.now()}`, 
          sender: 'ai', 
          text: answer, 
          timestamp: new Date().toISOString(),
          sources 
      };
      
      setTimeout(() => {
          MockBackend.addChatMessage(aiMsg);
          refreshData();
      }, 1000);
  };

  // --- Study Assistant ---
  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => setUploadModalOpen(false);
  
  const uploadNotes = async (file: File) => {
      if (!MockBackend.checkUsage('upload')) {
          alert("Upload limit reached.");
          return;
      }
      MockBackend.incrementUsage('upload');
      
      const text = await readFileAsText(file);
      const nodes = await parseContentToNodes(text, file.name);
      
      const roadmap = generateRoadmap(file.name, nodes);
      MockBackend.addRoadmap(roadmap);
      
      const embs = await generateEmbeddings(nodes);
      MockBackend.addEmbeddings(embs);
      
      const item: HistoryItem = {
          id: `h_${Date.now()}`, roadmapId: roadmap.id, title: roadmap.title, uploadedAt: new Date().toISOString(),
          nodes, flashcards: [], embeddings: embs, summaries: {}
      };
      MockBackend.addHistory(item);
      refreshData();
  };

  const createNodeFlashcards = async (node: Node) => {
      if (!MockBackend.checkUsage('ai')) return;
      MockBackend.incrementUsage('ai');
      const cards = await generateFlashcards(node);
      MockBackend.addFlashcards(cards);
      refreshData();
  };

  const createNodeSummary = async (node: Node) => {
      if (!MockBackend.checkUsage('ai')) return;
      MockBackend.incrementUsage('ai');
      const res = await generateSummaries(node);
      MockBackend.updateNodeSummary(roadmaps[0]?.id, node.id, res.overview, res.detailed);
      refreshData();
  };

  // --- Friends ---
  const sendFriendRequest = (uid: string) => { MockBackend.sendFriendRequest(uid); refreshData(); };
  const acceptFriendRequest = (rid: string) => { MockBackend.acceptFriendRequest(rid); refreshData(); };
  const rejectFriendRequest = (rid: string) => { MockBackend.rejectFriendRequest(rid); refreshData(); };
  const getFriends = () => MockBackend.getFriends();
  const getFriendRequests = () => MockBackend.getFriendRequests();

  // Stub handlers
  const handleSyllabusUpload = async (f: File) => { await uploadNotes(f); };
  const applySmartTemplate = (tid: string) => { console.log('Template applied', tid); };
  const generateRoadmapTimetable = (rid: string) => { 
      const rm = roadmaps.find(r => r.id === rid);
      if(rm) {
          const tt = generateTimetable(rm.nodes, []);
          MockBackend.addScheduledBlocks(tt);
          refreshData();
      }
  };
  const loadHistoryItem = (id: string) => {
      const item = history.find(h => h.id === id);
      if(item) {
          MockBackend.setRoadmaps([{ id: item.roadmapId, title: item.title, nodes: item.nodes, generatedAt: item.uploadedAt }]);
          MockBackend.setFlashcards(item.flashcards || []);
          MockBackend.setEmbeddings(item.embeddings || []);
          refreshData();
      }
  };
  const deleteHistoryItem = (id: string) => { MockBackend.deleteHistory(id); refreshData(); };
  const clearHistory = () => { MockBackend.clearHistory(); refreshData(); };

  return (
    <StoreContext.Provider value={{
      user, goals, plans, theme, themeColor, sidebarOpen, isAuthenticated, activityLogs, isDemo, notifications, recentTransactions,
      toggleTheme, setThemeColor, toggleSidebar, toggleHabit, addGoal, deleteGoal, 
      addPlan, togglePlanTask, login, signup, logout, startDemo, upgradePlan, markNotificationsAsRead, refreshData, exportData,
      enableAIPlanner, toggleAIPlanner, scheduledBlocks, riskReports, runAIDemo, applyAIReschedule, aiMetrics,
      enableAdvancedAI, toggleAdvancedAI, peerGroups, chatHistory, smartTemplates, toggleSurvivalMode, sendChatMessage, handleSyllabusUpload, applySmartTemplate,
      roadmaps, flashcards, uploadNotes, generateRoadmapTimetable, createNodeFlashcards, createNodeSummary,
      isUploadModalOpen, openUploadModal, closeUploadModal, history, loadHistoryItem, deleteHistoryItem, clearHistory,
      sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, getFriendRequests
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const getColorClass = (color: ThemeColor, type: 'bg' | 'text' | 'border' | 'hover' | 'ring') => {
  const map: Record<ThemeColor, any> = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', hover: 'hover:bg-blue-700', ring: 'ring-blue-600' },
    violet: { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-600', hover: 'hover:bg-violet-700', ring: 'ring-violet-600' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', hover: 'hover:bg-emerald-700', ring: 'ring-emerald-600' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', hover: 'hover:bg-rose-700', ring: 'ring-rose-600' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', hover: 'hover:bg-amber-700', ring: 'ring-amber-600' },
  };
  return map[color] ? map[color][type] : map['blue'][type];
};

export const getLightColorClass = (color: ThemeColor) => {
  const map: Record<ThemeColor, string> = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return map[color] || map['blue'];
};
