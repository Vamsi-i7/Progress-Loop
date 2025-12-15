import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { CheckCircle2, Circle } from 'lucide-react';

const MissionLog: React.FC = () => {
    const { goals, toggleHabit } = useStore();

    // Flatten habits and filter for priority
    const tasks = goals.flatMap(g => g.habits.map(h => ({ ...h, goalId: g.id, goalTitle: g.title })));
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

    return (
        <div className="h-full flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
            {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => (
                    <div
                        key={`${task.goalId}-${task.id}`}
                        onClick={() => toggleHabit(task.goalId, task.id)}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                        <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
                            <Circle size={20} />
                        </div>
                        <div className="min-w-0">
                            <h5 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</h5>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{task.goalTitle}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <CheckCircle2 size={32} className="mb-2 opacity-50" />
                    <p className="text-xs font-bold">All Systems Nominal</p>
                    <p className="text-[10px]">No pending missions</p>
                </div>
            )}
        </div>
    );
};

export default MissionLog;
