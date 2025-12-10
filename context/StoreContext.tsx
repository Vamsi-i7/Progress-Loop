
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Goal, StudyPlan, User, ThemeColor, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, PeerGroup, ChatMessage, SmartTemplate, Roadmap, Flashcard, Node, HistoryItem } from '../types';
import { MockBackend } from '../services/MockBackend';
import { getMentorResponse } from '../services/mentor';
import { parseSyllabus, parseContentToNodes, readFileAsText } from '../services/syllabusParser';
import { generateRoadmap } from '../services/roadmapGenerator';
import { generateEmbeddings } from '../services/embeddings';
import { queryMentor } from '../services/mentorRAG';
import { generateTimetable } from '../services/timetableGenerator';
import { generateFlashcards } from '../services/flashcardGenerator';
import { generateSummaries } from '../services/summarizer';

const populateDemoData = () => {
    MockBackend.resetUser(false);
    MockBackend.updateUser({
        name: 'Alex Chen', username: 'alexc_demo', email: 'alex@demo.com',
        plan: 'pro', level: 12, xp: 3450, maxXp: 5000, hearts: 5, streak: 42
    });
};

interface StoreContextType extends AppState {
  toggleTheme: () => void;
  setThemeColor: (color: ThemeColor) => void;
  toggleSidebar: () => void;
  toggleHabit: (goalId: string, habitId: string) => void;
  addGoal: (goal: Goal) => boolean; 
  deleteGoal: (id: string) => void;
  addPlan: (plan: StudyPlan) => void;
  togglePlanTask: (planId: string, taskId: string) => void;
  login: (name?: string, email?: string) => void;
  logout: () => void;
  startDemo: () => void;
  upgradePlan: (plan: 'free' | 'pro' | 'premium') => void;
  markNotificationsAsRead: () => void;
  refreshData: () => void;
  exportData: () => string;
  isAuthenticated: boolean;
  isDemo: boolean;
  // AI Actions
  toggleAIPlanner: () => void;
  toggleAdvancedAI: () => void;
  runAIDemo: () => Promise<void>;
  applyAIReschedule: () => void;
  // Advanced AI Actions
  toggleSurvivalMode: () => void;
  sendChatMessage: (text: string) => void;
  handleSyllabusUpload: (file: File) => Promise<void>;
  applySmartTemplate: (templateId: string) => void;
  // Study Assistant Actions
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
  isUploadModalOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  uploadNotes: (file: File) => Promise<void>;
  generateRoadmapTimetable: (roadmapId: string) => void;
  createNodeFlashcards: (node: Node) => Promise<void>;
  createNodeSummary: (node: Node) => Promise<void>;
  // History Actions
  history: HistoryItem[];
  loadHistoryItem: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('pl_auth') === 'true');
  const [isDemo, setIsDemo] = useState(false);
  const [user, setUser] = useState<User>(MockBackend.getUser());
  const [goals, setGoals] = useState<Goal[]>(MockBackend.getGoals());
  const [plans, setPlans] = useState<StudyPlan[]>(MockBackend.getPlans());
  const [notifications, setNotifications] = useState<Notification[]>(MockBackend.getNotifications());
  const [activityLogs, setActivityLogs] = useState<Record<string, number>>(MockBackend.getActivityMap());
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(MockBackend.getTransactions());
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('pl_theme') as 'light' | 'dark') || 'light');
  const [themeColor, setThemeColorState] = useState<ThemeColor>('blue');
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  
  // AI State
  const [enableAIPlanner, setEnableAIPlanner] = useState(() => localStorage.getItem('pl_ai_enabled') === 'true');
  const [enableAdvancedAI, setEnableAdvancedAI] = useState(() => localStorage.getItem('pl_adv_ai_enabled') === 'true');
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);
  const [riskReports, setRiskReports] = useState<Record<string, RiskReport>>({});
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({ plannedTasks: 0, completedTasks: 0, totalSlippage: 0, reschedules: 0, predictedFailures: 0 });
  
  // Advanced AI State
  const [peerGroups, setPeerGroups] = useState<PeerGroup[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>([]);

  // Study Assistant State
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const refreshData = () => {
      setUser(MockBackend.getUser());
      setGoals([...MockBackend.getGoals()]);
      setPlans([...MockBackend.getPlans()]);
      setNotifications([...MockBackend.getNotifications()]);
      setActivityLogs(MockBackend.getActivityMap());
      setRecentTransactions([...MockBackend.getTransactions()]);
      
      if (enableAIPlanner) {
          setScheduledBlocks([...MockBackend.getScheduledBlocks()]);
          setRiskReports({...MockBackend.getRiskReports()});
          setAiMetrics({...MockBackend.getAIMetrics()});
      }
      if (enableAdvancedAI) {
          setPeerGroups([...MockBackend.getPeerGroups()]);
          setChatHistory([...MockBackend.getChatHistory()]);
          setSmartTemplates([...MockBackend.getSmartTemplates()]);
          setRoadmaps([...MockBackend.getRoadmaps()]);
          setFlashcards([...MockBackend.getFlashcards()]);
          setHistory([...MockBackend.getHistory()]);
      }
  };

  useEffect(() => { 
      if (!isDemo) localStorage.setItem('pl_auth', String(isAuthenticated)); 
  }, [isAuthenticated, isDemo]);

  useEffect(() => {
    localStorage.setItem('pl_theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
      // Initial load
      refreshData();
  }, []);

  // Actions
  const toggleAIPlanner = () => {
      const newState = !enableAIPlanner;
      setEnableAIPlanner(newState);
      localStorage.setItem('pl_ai_enabled', String(newState));
      if (newState) refreshData();
  };

  const toggleAdvancedAI = () => {
      const newState = !enableAdvancedAI;
      setEnableAdvancedAI(newState);
      localStorage.setItem('pl_adv_ai_enabled', String(newState));
      if (newState) refreshData();
  };

  const runAIDemo = async () => { MockBackend.runDemoScenario(); refreshData(); };
  const applyAIReschedule = () => { MockBackend.applyAutoReschedule(); refreshData(); };
  
  const toggleSurvivalMode = () => {
      const newUser = MockBackend.updateUser({ survivalMode: !user.survivalMode });
      setUser(newUser);
      MockBackend.runScheduler();
      refreshData();
  };

  const sendChatMessage = async (text: string) => {
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString() };
      MockBackend.addChatMessage(userMsg);
      setChatHistory([...MockBackend.getChatHistory()]);

      const roadmaps = MockBackend.getRoadmaps();
      if (roadmaps.length > 0) {
          const embeddings = MockBackend.getEmbeddings();
          const { answer, sources } = await queryMentor(text, embeddings);
          const aiMsg: ChatMessage = { 
              id: `ai_${Date.now()}`, 
              sender: 'ai', 
              text: answer, 
              timestamp: new Date().toISOString(),
              sources
          };
          MockBackend.addChatMessage(aiMsg);
      } else {
          setTimeout(() => {
              const aiMsg = getMentorResponse(user, plans, scheduledBlocks, text);
              MockBackend.addChatMessage(aiMsg);
              refreshData();
          }, 1000);
      }
      refreshData();
  };

  const handleSyllabusUpload = async (file: File) => {
      const plan = await parseSyllabus(file);
      MockBackend.addPlan(plan);
      refreshData();
  };

  const applySmartTemplate = (templateId: string) => {
      refreshData();
  };

  // --- STUDY ASSISTANT ACTIONS ---

  const openUploadModal = () => setUploadModalOpen(true);
  const closeUploadModal = () => setUploadModalOpen(false);

  const uploadNotes = async (file: File) => {
      const text = await readFileAsText(file);
      
      // 1. Parse into nodes
      const nodes = await parseContentToNodes(text, file.name);
      
      // 2. Generate Roadmap
      const roadmap = generateRoadmap(file.name, nodes);
      MockBackend.addRoadmap(roadmap);

      // 3. Generate Embeddings (Background)
      const embeddings = await generateEmbeddings(nodes);
      MockBackend.addEmbeddings(embeddings);
      
      // 4. Save to History
      const historyItem: HistoryItem = {
          id: `hist_${Date.now()}`,
          roadmapId: roadmap.id,
          title: roadmap.title,
          uploadedAt: new Date().toISOString(),
          nodes: roadmap.nodes,
          flashcards: [],
          embeddings: embeddings
      };
      MockBackend.addHistory(historyItem);

      MockBackend.addNotification({id: `n_emb_${Date.now()}`, title: 'AI Ready', message: 'You can now chat with your notes!', time: 'Just now', read: false, type: 'success'});
      
      refreshData();
  };

  const generateRoadmapTimetable = (roadmapId: string) => {
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (roadmap) {
          const timetable = generateTimetable(roadmap.nodes, []); 
          MockBackend.addScheduledBlocks(timetable);
          refreshData();
      }
  };

  const createNodeFlashcards = async (node: Node) => {
      const cards = await generateFlashcards(node);
      MockBackend.addFlashcards(cards);
      
      // Update history if active
      if (roadmaps.length > 0) {
          const activeHistory = MockBackend.getHistory().find(h => h.roadmapId === roadmaps[0].id);
          if (activeHistory) {
               const currentCards = activeHistory.flashcards || [];
               activeHistory.flashcards = [...currentCards, ...cards];
               MockBackend.save();
          }
      }
      refreshData();
  };

  const createNodeSummary = async (node: Node) => {
      const { overview, detailed } = await generateSummaries(node);
      MockBackend.updateNodeSummary(roadmaps[0]?.id, node.id, overview, detailed);
      refreshData();
  };

  const loadHistoryItem = (id: string) => {
      const item = history.find(h => h.id === id);
      if (item) {
          const roadmap: Roadmap = {
              id: item.roadmapId,
              title: item.title,
              nodes: item.nodes,
              generatedAt: item.uploadedAt
          };
          MockBackend.setRoadmaps([roadmap]);
          MockBackend.setFlashcards(item.flashcards || []);
          MockBackend.setEmbeddings(item.embeddings || []);
          refreshData();
      }
  };

  const deleteHistoryItem = (id: string) => {
      MockBackend.deleteHistory(id);
      refreshData();
  };

  const clearHistory = () => {
      MockBackend.clearHistory();
      refreshData();
  };

  // (Standard Actions)
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const setThemeColor = (color: ThemeColor) => setThemeColorState(color);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const upgradePlan = (plan: 'free' | 'pro' | 'premium') => { MockBackend.updateUser({ plan }); refreshData(); };
  const markNotificationsAsRead = () => { MockBackend.markAllNotificationsRead(); refreshData(); };
  const login = (name?: string, email?: string) => {
    setIsDemo(false);
    if (name && email) MockBackend.updateUser({ name, email, username: email.split('@')[0] });
    refreshData();
    setIsAuthenticated(true);
  };
  const logout = () => { setIsDemo(false); setIsAuthenticated(false); localStorage.removeItem('pl_auth'); };
  const startDemo = () => { setIsDemo(true); populateDemoData(); refreshData(); setIsAuthenticated(true); };
  const exportData = () => MockBackend.getRawDatabase();
  const addGoal = (newGoal: Goal): boolean => {
    if (user.plan === 'free' && goals.length >= 3 && !isDemo) return false;
    MockBackend.addGoal(newGoal); refreshData(); return true;
  };
  const deleteGoal = (id: string) => { MockBackend.deleteGoal(id); refreshData(); };
  const addPlan = (newPlan: StudyPlan) => { MockBackend.addPlan(newPlan); refreshData(); };
  const togglePlanTask = (planId: string, taskId: string) => { MockBackend.togglePlanTask(planId, taskId); refreshData(); };
  const toggleHabit = (goalId: string, habitId: string) => {
      const result = MockBackend.toggleHabitCompletion(goalId, habitId);
      refreshData();
  };

  return (
    <StoreContext.Provider value={{
      user, goals, plans, theme, themeColor, sidebarOpen, isAuthenticated, activityLogs, isDemo, notifications, recentTransactions,
      toggleTheme, setThemeColor, toggleSidebar, toggleHabit, addGoal, deleteGoal, 
      addPlan, togglePlanTask, login, logout, startDemo, upgradePlan, markNotificationsAsRead, refreshData, exportData,
      enableAIPlanner, toggleAIPlanner, scheduledBlocks, riskReports, runAIDemo, applyAIReschedule, aiMetrics,
      enableAdvancedAI, toggleAdvancedAI, peerGroups, chatHistory, smartTemplates, toggleSurvivalMode, sendChatMessage, handleSyllabusUpload, applySmartTemplate,
      // Study Assistant
      roadmaps, flashcards, uploadNotes, generateRoadmapTimetable, createNodeFlashcards, createNodeSummary,
      isUploadModalOpen, openUploadModal, closeUploadModal,
      history, loadHistoryItem, deleteHistoryItem, clearHistory
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
