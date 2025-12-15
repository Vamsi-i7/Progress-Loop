
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Goal, StudyPlan, User, ThemeColor, Notification, Transaction, ScheduledBlock, RiskReport, AIMetrics, PeerGroup, ChatMessage, SmartTemplate, Roadmap, Flashcard, Node, HistoryItem, FriendRequest } from '../types';
import { api } from '../services/api';
import { getMentorResponse } from '../services/mentor';
import { parseSyllabus, parseContentToNodes, readFileAsText } from '../services/syllabusParser';
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
    addGoal: (goal: Goal) => Promise<boolean>;
    deleteGoal: (id: string) => void;
    addPlan: (plan: StudyPlan) => void;
    togglePlanTask: (planId: string, taskId: string) => void;

    // Auth
    login: (email: string, password?: string) => Promise<boolean>;
    signup: (name: string, email: string, password?: string) => Promise<any>;
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
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('pl_token'));
    const [isDemo, setIsDemo] = useState(false); // Demo mode deprecated in strict backend
    const [user, setUser] = useState<User | null>(null); // Start null until loaded

    // Global Data
    const [goals, setGoals] = useState<Goal[]>([]);
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activityLogs, setActivityLogs] = useState<Record<string, number>>({});
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('pl_theme') as 'light' | 'dark') || 'light');
    const [themeColor, setThemeColorState] = useState<ThemeColor>('blue');
    const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

    // Feature Flags & AI
    const [enableAIPlanner, setEnableAIPlanner] = useState(true);
    const [enableAdvancedAI, setEnableAdvancedAI] = useState(true);

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

    // --- Initial Data Load ---
    const refreshData = async () => {
        try {
            if (!isAuthenticated) return;
            const data = await api.getInitialState();

            if (data.user) setUser(data.user);
            if (data.goals) setGoals(data.goals);
            if (data.plans) setPlans(data.plans);

            // Legacy/Pending Backend Implementation - Defaults to empty from backend or fallback here
            setNotifications(data.notifications || []);
            setScheduledBlocks(data.scheduledBlocks || []);
            setRiskReports(data.riskReports || {});
            setPeerGroups(data.peerGroups || []);
            setChatHistory(data.chatHistory || []);

        } catch (err) {
            console.error("Failed to refresh data", err);
            // If 401, handle logout? api.ts handles it mostly
        }
    };

    useEffect(() => {
        localStorage.setItem('pl_theme', theme);
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    // Initial Load
    useEffect(() => {
        if (isAuthenticated) {
            refreshData();
        }
    }, [isAuthenticated]);

    // --- Auth Actions ---
    const login = async (email: string, password?: string) => {
        try {
            const res = await api.login(email, password);
            if (res.token) {
                api.setToken(res.token);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const signup = async (name: string, email: string, password?: string) => {
        try {
            const res = await api.signup(name, email, password);
            if (res.token) {
                // Check if getting the token implies immediate login?
                // Current backend logic: NO token sent if successful registration (verification required).
                // So res.token will be undefined.
                // We return the response object.
                api.setToken(res.token);
                setIsAuthenticated(true);
                await refreshData();
                return true;
            }
            if (res.success) {
                return res; // Return object { success: true, message: ... }
            }
            return false;
        } catch (error) {
            console.error(error);
            // Throwing or returning object with error?
            // Let's propagate error for explicit message in UI
            throw error;
        }
    };

    const logout = () => {
        api.logout();
        setIsAuthenticated(false);
        setUser(null);
        // Clear data
        setGoals([]);
        setPlans([]);
        window.location.href = '/login';
    };

    const startDemo = () => {
        alert("Demo mode is currently disabled in the live version.");
    };

    // --- Feature Toggles ---
    const toggleAIPlanner = () => setEnableAIPlanner(!enableAIPlanner);
    const toggleAdvancedAI = () => setEnableAdvancedAI(!enableAdvancedAI);

    // --- Actions (Delegated to API) ---
    const upgradePlan = async (plan: 'free' | 'pro' | 'premium') => {
        try {
            await api.updateUser({ plan });
            refreshData();
        } catch (e) { console.error(e); }
    };

    const markNotificationsAsRead = () => {
        // Placeholder: Implement api.markNotificationsRead()
        setNotifications([]);
    };

    const addGoal = async (goal: Goal) => {
        try {
            await api.createGoal(goal);
            refreshData();
            return true;
        } catch (e) { console.error(e); return false; }
    };

    const deleteGoal = (id: string) => {
        // api.deleteGoal(id); // Pending implementation
        console.warn("Delete Goal not implemented in backend yet");
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const addPlan = async (plan: StudyPlan) => {
        try {
            await api.createPlan(plan);
            refreshData();
        } catch (e) { console.error(e); }
    };

    const togglePlanTask = (pid: string, tid: string) => { console.warn("Toggle Plan Task: Pending Backend"); };

    const toggleHabit = async (gid: string, hid: string) => {
        try {
            await api.toggleHabit(gid, hid);
            refreshData();
        } catch (e) { console.error(e); }
    };

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const setThemeColor = (c: ThemeColor) => setThemeColorState(c);
    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const exportData = () => JSON.stringify({ user, goals, plans }, null, 2);

    const runAIDemo = async () => { alert("AI Demo not available."); };
    const applyAIReschedule = () => { console.log("AI Reschedule triggered"); };
    const toggleSurvivalMode = async () => {
        if (user) {
            await api.updateUser({ survivalMode: !user.survivalMode });
            refreshData();
        }
    };

    // --- AI & Chat ---
    const sendChatMessage = async (text: string) => {
        const userMsg: ChatMessage = {
            id: `u_${Date.now()}`,
            sender: 'user',
            text,
            timestamp: new Date().toISOString()
        };

        // Optimistic Update
        setChatHistory(prev => [...prev, userMsg]);

        try {
            // Send to Backend
            // Pass recent history for context if needed, currently api.chatWithAI takes (message, history)
            // We can just pass the text and let backend handle context or pass a sliced history.
            const payloadHistory = chatHistory.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const res = await api.chatWithAI(text, payloadHistory);

            const aiMsg: ChatMessage = {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: res.answer,
                timestamp: new Date().toISOString(),
                sources: res.sources
            };

            setChatHistory(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error("Failed to send message", err);
            // Optional: Add error message to chat
        }
    };

    // --- Study Assistant (Stubs for now) ---
    const openUploadModal = () => setUploadModalOpen(true);
    const closeUploadModal = () => setUploadModalOpen(false);
    const uploadNotes = async (file: File) => { alert("Uploads require backend storage implementation."); };
    const createNodeFlashcards = async (node: Node) => { };
    const createNodeSummary = async (node: Node) => { };

    // --- Friends ---
    const sendFriendRequest = (uid: string) => { console.log("Friend Req:", uid); };
    const acceptFriendRequest = (rid: string) => { console.log("Accept:", rid); };
    const rejectFriendRequest = (rid: string) => { console.log("Reject:", rid); };
    const getFriends = () => [];
    const getFriendRequests = () => [];

    // Stub handlers
    const handleSyllabusUpload = async (f: File) => { };
    const applySmartTemplate = (tid: string) => { };
    const generateRoadmapTimetable = (rid: string) => { };
    const loadHistoryItem = (id: string) => { };
    const deleteHistoryItem = (id: string) => { };
    const clearHistory = () => { };

    // Helper handling for user defaults
    const safeUser = user || {
        id: 'guest', name: 'Guest', email: '', password: '',
        plan: 'free', joinedDate: new Date().toISOString(), lastActiveDate: new Date().toISOString(),
        xp: 0, level: 1, streak: 0, hearts: 5, survivalMode: false,
        goals: [], studyPlans: [], preferences: { theme: 'light', notifications: true },
        stats: { totalStudyTime: 0, focusSessions: 0, tasksCompleted: 0, averageGrade: 0 }
    } as unknown as User;

    return (
        <StoreContext.Provider value={{
            user: safeUser, goals, plans, theme, themeColor, sidebarOpen, isAuthenticated, activityLogs, isDemo, notifications, recentTransactions,
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
