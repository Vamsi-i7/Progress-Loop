import React from 'react';
import { useStore, getColorClass } from '../../../context/StoreContext';
import { Heart, Flame, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const BioStats: React.FC = () => {
    const { user, themeColor } = useStore();
    const xpPercentage = Math.min(100, (user.xp / user.maxXp) * 100);

    return (
        <div className="h-full flex flex-col justify-between gap-4">
            {/* Level & XP */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <svg className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                        <circle
                            cx="40" cy="40" r="36"
                            stroke="currentColor" strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={226}
                            strokeDashoffset={226 - (226 * xpPercentage) / 100}
                            strokeLinecap="round"
                            className={getColorClass(themeColor, 'text')}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase">Lvl</span>
                        <span className="text-2xl font-black text-white">{user.level}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-bold text-lg mb-1">{user.username || user.name.split(' ')[0]}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Zap size={12} className="text-amber-400" fill="currentColor" />
                        <span>{user.xp} / {user.maxXp} XP</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                        <Heart size={18} fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white leading-none">{user.hearts}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Lives</div>
                    </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                        <Flame size={18} fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white leading-none">{user.streak}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Day Streak</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BioStats;
