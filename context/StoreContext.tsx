
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Goal, StudyPlan, User, ThemeColor, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, PeerGroup, ChatMessage, SmartTemplate } from '../types';
import { MockBackend } from '../services/MockBackend';
import { getMentorResponse } from '../services/mentor';
import { parseSyllabus } from '../services/syllabusParser';

const populateDemoData = () => {
    MockBackend.resetUser(false);
    MockBackend.updateUser({
        name: 'Alex Chen', username: 'alexc_demo', email: 'alex@demo.com',
        plan: 'pro', level: 12, xp: 3450, maxXp: 5000, hearts: 5, streak: 42
    });
    MockBackend.addGoal({
        id: 'dg1', title: 'Full Stack Development', type: 'daily', category: 'long-term', progress: 66,
        habits: [
            { id: 'dh1', title: 'Code for 1 hour', completed: true, streak: 42 },
            { id: 'dh2', title: 'Read tech docs', completed: false, streak: 15 },
            { id: 'dh3', title: 'Commit to GitHub', completed: true, streak: 42 }
        ]
    });
    MockBackend.addTransaction({
        id: 'txn_demo_1', date: '2023-10-01', amount: 1999, currency: 'INR', plan: 'pro', status: 'success'
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

  const refreshData = () => {
      setUser(MockBackend.getUser());
      setGoals([...MockBackend.getGoals()]);
      setPlans([...MockBackend.getPlans()]);
      setNotifications([...MockBackend.getNotifications()]);
      setActivityLogs(MockBackend.getActivityMap());
      setRecentTransactions([...MockBackend.getTransactions()]);
      
      // Refresh AI Data if enabled
      if (enableAIPlanner) {
          setScheduledBlocks([...MockBackend.getScheduledBlocks()]);
          setRiskReports({...MockBackend.getRiskReports()});
          setAiMetrics({...MockBackend.getAIMetrics()});
      }
      // Refresh Advanced AI Data
      if (enableAdvancedAI) {
          setPeerGroups([...MockBackend.getPeerGroups()]);
          setChatHistory([...MockBackend.getChatHistory()]);
          setSmartTemplates([...MockBackend.getSmartTemplates()]);
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

  // AI Feature Toggle
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

  const runAIDemo = async () => {
      MockBackend.runDemoScenario();
      refreshData();
  };

  const applyAIReschedule = () => {
      MockBackend.applyAutoReschedule();
      refreshData();
  };

  const toggleSurvivalMode = () => {
      const newUser = MockBackend.updateUser({ survivalMode: !user.survivalMode });
      setUser(newUser);
      // Re-run scheduler with/without compression
      MockBackend.runScheduler();
      refreshData();
  };

  const sendChatMessage = (text: string) => {
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString() };
      MockBackend.addChatMessage(userMsg);
      setChatHistory([...MockBackend.getChatHistory()]);

      setTimeout(() => {
          const aiMsg = getMentorResponse(user, plans, scheduledBlocks, text);
          MockBackend.addChatMessage(aiMsg);
          refreshData();
      }, 1000);
  };

  const handleSyllabusUpload = async (file: File) => {
      const plan = await parseSyllabus(file);
      MockBackend.addPlan(plan);
      refreshData();
  };

  const applySmartTemplate = (templateId: string) => {
      const t = smartTemplates.find(temp => temp.id === templateId);
      if (t) {
          const plan: StudyPlan = {
              id: `p_${Date.now()}`,
              title: `${t.name} Plan`,
              subject: 'Mixed',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              priority: 'high',
              tasks: t.subjects.map((sub, i) => ({
                  id: `t_${Date.now()}_${i}`,
                  title: `Study ${sub}`,
                  isCompleted: false,
                  estimatedMinutes: 60,
                  dueDate: new Date(Date.now() + (i+1)*24*60*60*1000).toISOString(),
                  difficulty: 'medium',
                  subjectWeightage: 20
              }))
          };
          MockBackend.addPlan(plan);
          refreshData();
      }
  };

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
      if (result.completed && Math.random() > 0.8) {
          MockBackend.addNotification({ id: `n${Date.now()}`, title: 'Great Job!', message: 'Keep the momentum going!', time: 'Just now', read: false, type: 'success' });
      }
      refreshData();
  };

  return (
    <StoreContext.Provider value={{
      user, goals, plans, theme, themeColor, sidebarOpen, isAuthenticated, activityLogs, isDemo, notifications, recentTransactions,
      toggleTheme, setThemeColor, toggleSidebar, toggleHabit, addGoal, deleteGoal, 
      addPlan, togglePlanTask, login, logout, startDemo, upgradePlan, markNotificationsAsRead, refreshData, exportData,
      enableAIPlanner, toggleAIPlanner, scheduledBlocks, riskReports, runAIDemo, applyAIReschedule, aiMetrics,
      enableAdvancedAI, toggleAdvancedAI, peerGroups, chatHistory, smartTemplates, toggleSurvivalMode, sendChatMessage, handleSyllabusUpload, applySmartTemplate
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
