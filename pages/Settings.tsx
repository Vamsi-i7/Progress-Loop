
import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { ThemeColor } from '../types';
import Header from '../components/Layout/Header';
import { Palette, Moon, Globe, Bell, CreditCard, LogOut, Shield, Database, Download, Bot, Zap, BrainCircuit } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 

const Settings: React.FC = () => {
  const { theme, toggleTheme, themeColor, setThemeColor, user, logout, isDemo, exportData, enableAIPlanner, toggleAIPlanner, enableAdvancedAI, toggleAdvancedAI } = useStore();
  const navigate = useNavigate(); 
  const colors: ThemeColor[] = ['blue', 'violet', 'emerald', 'rose', 'amber'];

  const handleLogout = () => {
    if (window.confirm(isDemo ? "Are you sure you want to exit the demo?" : "Are you sure you want to log out?")) {
        logout();
        navigate('/');
    }
  };

  const handleExportData = () => {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress_loop_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Icon size={20} className="text-slate-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <Header title="Settings" subtitle="Manage your preferences and account settings" />

      <main className="p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
        
        {/* AI Features Section */}
        <Section title="AI Features" icon={Bot}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                     <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Enable AI Planner
                        </h4>
                        <p className="text-xs text-slate-500">Auto-scheduling and failure prediction features (Beta).</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={enableAIPlanner} onChange={toggleAIPlanner} />
                        <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${getColorClass(themeColor, 'bg')}`}></div>
                     </label>
                </div>
                
                <div className="flex items-center justify-between">
                     <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            <BrainCircuit size={14} className="text-purple-500" /> Enable Advanced AI
                        </h4>
                        <p className="text-xs text-slate-500">Mentor Bot, Survival Mode, Cognitive Load, & Syllabus Ingestion.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={enableAdvancedAI} onChange={toggleAdvancedAI} />
                        <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:${getColorClass(themeColor, 'bg')}`}></div>
                     </label>
                </div>
            </div>
        </Section>

        {/* Subscription Management Section */}
        <Section title="Subscription" icon={CreditCard}>
           <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                 <p className="text-sm font-medium text-slate-900 dark:text-white">Current Plan: <span className={`capitalize font-bold ${getColorClass(themeColor, 'text')}`}>{user.plan}</span></p>
                 <p className="text-xs text-slate-500">Manage your billing and payment methods</p>
              </div>
              <button onClick={() => navigate('/subscription')} className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Manage Plan</button>
           </div>
        </Section>

        <Section title="Appearance" icon={Palette}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => theme === 'dark' && toggleTheme()} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${theme === 'light' ? `border-${themeColor}-500 bg-${themeColor}-50 text-${themeColor}-700` : 'border-slate-200 dark:border-slate-700'}`}>
                  <span className="w-4 h-4 rounded-full border border-slate-400 bg-white"></span> Light
                </button>
                <button onClick={() => theme === 'light' && toggleTheme()} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? `border-${themeColor}-500 bg-slate-800 text-white` : 'border-slate-200 dark:border-slate-700'}`}>
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Accent Color</label>
              <div className="flex flex-wrap gap-4">
                {colors.map(c => (
                  <button key={c} onClick={() => setThemeColor(c)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${c === themeColor ? 'ring-4 ring-offset-2 ring-slate-200 dark:ring-slate-700 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: `var(--color-${c}-500)` }}>
                    <div className={`w-12 h-12 rounded-full bg-${c}-500`}></div> 
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Data & Privacy" icon={Database}>
             <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">Your Data</h4>
                    <p className="text-xs text-slate-500">Download a copy of your personal data.</p>
                 </div>
                 <button onClick={handleExportData} className="px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2">
                    <Download size={16} /> Export Data
                 </button>
             </div>
        </Section>

        <Section title="Account Actions" icon={Shield}>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Sign Out</h4>
                     <p className="text-xs text-slate-500">Securely log out of your account.</p>
                 </div>
                 <button onClick={handleLogout} className="px-6 py-2.5 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
                     <LogOut size={18} /> {isDemo ? 'Exit Demo' : 'Log Out'}
                 </button>
            </div>
        </Section>
      </main>
    </div>
  );
};

export default Settings;
