
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useStore, getColorClass } from '../../context/StoreContext';

interface Props {
  className?: string;
  iconClassName?: string;
}

const NotificationDropdown: React.FC<Props> = ({ className = "", iconClassName = "" }) => {
  const { notifications, markNotificationsAsRead, themeColor } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark as read when opening (optional, or button based)
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className={`relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${iconClassName}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={`absolute top-2 right-2 w-2.5 h-2.5 ${getColorClass(themeColor, 'bg')} rounded-full border-2 border-white dark:border-slate-900`}></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markNotificationsAsRead}
                className={`text-xs font-bold ${getColorClass(themeColor, 'text')} hover:underline`}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((note) => (
                  <div key={note.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!note.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!note.read ? getColorClass(themeColor, 'bg') : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                             <h4 className={`text-sm font-semibold ${!note.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{note.title}</h4>
                             <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{note.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{note.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
