
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Target, Calendar, TrendingUp, User, Settings, 
  CreditCard, HelpCircle, MessageSquare, Info, Sparkles, Users
} from 'lucide-react';
import { useStore, getColorClass } from '../../context/StoreContext';

const Sidebar: React.FC = () => {
  const { sidebarOpen, user, themeColor, toggleSidebar, enableAdvancedAI } = useStore();

  const navClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium
    ${isActive 
      ? `${getColorClass(themeColor, 'bg')} text-white shadow-lg shadow-${themeColor}-500/30` 
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 
        flex flex-col overflow-y-auto shadow-2xl md:shadow-none
        transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:z-0 md:h-screen md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className={`w-10 h-10 rounded-xl ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white shadow-lg shadow-${themeColor}-500/30`}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Progress Loop</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Habit Tracker</p>
            </div>
          </Link>

          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Main</p>
            <NavLink to="/dashboard" className={navClass}><LayoutDashboard size={20} /> Dashboard</NavLink>
            <NavLink to="/goals" className={navClass}><Target size={20} /> Goals</NavLink>
            <NavLink to="/planner" className={navClass}><Calendar size={20} /> Planner</NavLink>
            <NavLink to="/progress" className={navClass}><TrendingUp size={20} /> Progress</NavLink>
            {enableAdvancedAI && <NavLink to="/group" className={navClass}><Users size={20} /> Group Study</NavLink>}

            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Account</p>
            <NavLink to="/profile" className={navClass}><User size={20} /> Profile</NavLink>
            <NavLink to="/settings" className={navClass}><Settings size={20} /> Settings</NavLink>
            <NavLink to="/subscription" className={navClass}><CreditCard size={20} /> Subscription</NavLink>

            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Help</p>
            <NavLink to="/about" className={navClass}><Info size={20} /> About</NavLink>
            <NavLink to="/feedback" className={navClass}><MessageSquare size={20} /> Feedback</NavLink>
            <NavLink to="/support" className={navClass}><HelpCircle size={20} /> Support</NavLink>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className={`w-10 h-10 rounded-full ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white text-sm font-bold`}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
