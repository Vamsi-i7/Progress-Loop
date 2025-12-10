
import React from 'react';
import { Menu, Sun, Moon, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { toggleSidebar, theme, toggleTheme, isDemo } = useStore();

  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden text-slate-600 dark:text-slate-300">
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             {title}
             {isDemo && (
                 <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                     <Eye size={12}/> Demo Mode
                 </span>
             )}
          </h2>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400"
        >
          {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Notification Dropdown Component */}
        <NotificationDropdown iconClassName="text-slate-500 dark:text-slate-400" />
        
      </div>
    </header>
  );
};

export default Header;
