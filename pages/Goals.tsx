
import React, { useState } from 'react';
import { useStore, getColorClass, getLightColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Plus, Target, Calendar, CheckCircle2, Circle, MoreVertical, Trash2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Goals: React.FC = () => {
  const { goals, toggleHabit, themeColor, deleteGoal, addGoal, user } = useStore();
  const [filter, setFilter] = useState<'all' | 'short-term' | 'long-term'>('all');
  const navigate = useNavigate();

  const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.category === filter);

  // New Goal Modal State (Mock implementation for UI)
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleAddGoalClick = () => {
    // Check if user is free and already has 3 goals
    if (user.plan === 'free' && goals.length >= 3) {
      setShowLimitModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Header title="Your Goals" subtitle="Manage and track your long-term ambitions" />

      <main className="p-6 max-w-5xl mx-auto">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {['all', 'short-term', 'long-term'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f 
                            ? `${getColorClass(themeColor, 'bg')} text-white shadow-md` 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {f.replace('-', ' ')}
                    </button>
                ))}
            </div>
            
            <button 
                onClick={handleAddGoalClick}
                className={`${getColorClass(themeColor, 'bg')} ${getColorClass(themeColor, 'hover')} text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-${themeColor}-500/20 transition-all active:scale-95`}
            >
                <Plus size={20} /> Add New Goal
            </button>
        </div>

        {/* Goals List */}
        <div className="space-y-6">
            {filteredGoals.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <Target size={64} className="mx-auto mb-4 text-slate-300"/>
                    <h3 className="text-xl font-bold text-slate-400">No goals found</h3>
                    <p className="text-slate-400">Create a new goal to get started!</p>
                </div>
            )}

            {filteredGoals.map((goal) => (
                <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative group">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-3 rounded-2xl ${getLightColorClass(themeColor)}`}>
                                <Target size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{goal.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">{goal.type}</span>
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">{goal.category}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                           onClick={() => {
                             if(window.confirm('Are you sure you want to delete this goal?')) {
                               deleteGoal(goal.id);
                             }
                           }}
                           className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-semibold text-slate-500">Progress</span>
                            <span className={`text-2xl font-bold ${getColorClass(themeColor, 'text')}`}>{goal.progress}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${getColorClass(themeColor, 'bg')} relative overflow-hidden transition-all duration-700 ease-out`} 
                                style={{ width: `${goal.progress}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Habits List */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1">
                        {goal.habits.map((habit, idx) => (
                            <div 
                                key={habit.id}
                                onClick={() => toggleHabit(goal.id, habit.id)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${habit.completed ? 'opacity-50' : 'hover:bg-white dark:hover:bg-slate-800'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`${habit.completed ? 'text-green-500' : 'text-slate-300'}`}>
                                        {habit.completed ? <CheckCircle2 size={22} className="fill-current bg-white dark:bg-transparent rounded-full" /> : <Circle size={22} />}
                                    </div>
                                    <span className={`text-sm font-medium ${habit.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{habit.title}</span>
                                </div>
                                {habit.streak > 0 && !habit.completed && (
                                    <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {habit.streak} day streak
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

      </main>

      {/* New Goal Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Add New Goal</h3>
                  <p className="text-slate-500 mb-8">Create a new goal to track your progress.</p>
                  
                  {/* Mock Form Field */}
                  <div className="mb-4">
                     <label className="block text-sm font-medium mb-1">Goal Title</label>
                     <input type="text" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800" placeholder="e.g., Read 10 Books" />
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                      <button onClick={() => {
                        // Mock adding a goal for demo
                        addGoal({
                           id: `g${Date.now()}`,
                           title: 'New Demo Goal',
                           type: 'daily',
                           category: 'short-term',
                           progress: 0,
                           habits: [{ id: 'h_new', title: 'New Habit', completed: false, streak: 0 }]
                        });
                        setShowModal(false);
                      }} className={`flex-1 py-3 rounded-xl font-bold text-white ${getColorClass(themeColor, 'bg')}`}>Create Goal</button>
                  </div>
              </div>
          </div>
      )}

      {/* Limit Reached Modal */}
      {showLimitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center">
                  <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
                      <Lock size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Limit Reached</h3>
                  <p className="text-slate-500 mb-8">You've reached the limit of 3 goals on the Free plan. Upgrade to Pro for unlimited goals and advanced features.</p>
                  
                  <div className="flex flex-col gap-3">
                      <button onClick={() => {
                        setShowLimitModal(false);
                        navigate('/subscription');
                      }} className={`w-full py-3.5 rounded-xl font-bold text-white ${getColorClass(themeColor, 'bg')} shadow-lg shadow-${themeColor}-500/30`}>
                        Upgrade Now
                      </button>
                      <button onClick={() => setShowLimitModal(false)} className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        Maybe Later
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Goals;
