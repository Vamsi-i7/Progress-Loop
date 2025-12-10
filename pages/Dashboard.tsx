
import React, { useState } from 'react';
import { useStore, getColorClass, getLightColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { CheckCircle2, Circle, Flame, Heart, Zap, TrendingUp, Plus, Bot, AlertTriangle, RefreshCcw, Brain, Target, ShieldAlert, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import RescheduleModal from '../components/RescheduleModal';
import MentorChat from '../components/MentorChat';

const Dashboard: React.FC = () => {
  const { goals, toggleHabit, themeColor, user, activityLogs, enableAIPlanner, enableAdvancedAI, riskReports, aiMetrics, runAIDemo } = useStore();
  const navigate = useNavigate();
  const [showReschedule, setShowReschedule] = useState(false);

  // Aggregate all habits
  const allHabits = goals.flatMap(g => g.habits.map(h => ({ ...h, goalId: g.id, goalTitle: g.title })));
  const completedHabits = allHabits.filter(h => h.completed).length;
  const progress = allHabits.length > 0 ? Math.round((completedHabits / allHabits.length) * 100) : 0;

  // Real Data Generator for Weekly Activity Chart
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; 
      data.push({
        day: days[d.getDay()],
        count: activityLogs[dateKey] || 0
      });
    }
    return data;
  };
  const weeklyActivity = getWeeklyData();

  const handleRunDemo = async () => {
      await runAIDemo();
      setShowReschedule(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <Header title={`Hi, ${user.name.split(' ')[0]} 👋`} subtitle="Ready to start your loop?" />
      
      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* GAMIFICATION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`col-span-1 md:col-span-2 relative overflow-hidden rounded-[2rem] p-8 text-white shadow-lg transition-transform hover:scale-[1.01] ${getColorClass(themeColor, 'bg')}`}>
                <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 p-24 bg-black opacity-5 rounded-full -ml-12 -mb-12 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 text-2xl font-black shadow-inner">
                            {user.level}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Level {user.level}</h3>
                            <p className="text-white/80 text-sm font-medium">Start completing tasks to gain XP!</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-md">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 opacity-90">
                            <span>Experience</span>
                            <span>{user.xp} / {user.maxXp} XP</span>
                        </div>
                        <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-700 ease-out rounded-full" style={{ width: `${(user.xp / user.maxXp) * 100}%` }}></div>
                        </div>
                        <p className="text-right text-xs mt-2 opacity-70">{user.maxXp - user.xp} XP to next level</p>
                    </div>
                </div>
            </div>
            <div className="col-span-1 grid grid-rows-2 gap-4">
                 <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Lives Remaining</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{user.hearts}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
                        <Heart size={24} fill="currentColor" />
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Day Streak</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{user.streak} <span className="text-lg text-slate-400 font-normal">days</span></h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center">
                        <Flame size={24} fill="currentColor" />
                    </div>
                 </div>
            </div>
        </div>

        {/* AI PLANNER METRICS (Basic & Advanced) */}
        {(enableAIPlanner || enableAdvancedAI) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-500">
                <div className="col-span-1 md:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Bot className="text-indigo-500" size={20} /> AI Planner Metrics
                        </h3>
                        <button onClick={handleRunDemo} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                            <RefreshCcw size={12}/> Run Demo
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 relative z-10">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Scheduled</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{aiMetrics.plannedTasks}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Failure Risk</p>
                            <p className={`text-2xl font-black ${aiMetrics.predictedFailures > 0 ? 'text-red-500' : 'text-green-500'}`}>{aiMetrics.predictedFailures}</p>
                        </div>
                        {enableAdvancedAI ? (
                            <>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Prediction</p>
                                    <p className="text-2xl font-black text-emerald-500">{aiMetrics.predictedScore || 0}%</p>
                                    <p className="text-[10px] text-slate-400">Outcome Score</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Gap</p>
                                    <p className="text-2xl font-black text-amber-500">{aiMetrics.requiredEffortGap || 0}h</p>
                                    <p className="text-[10px] text-slate-400">To reach 95%</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Rescheduled</p>
                                    <p className="text-2xl font-black text-amber-500">{aiMetrics.reschedules}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Effort Score</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">8.5</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Advanced AI: Cognitive Load */}
                {enableAdvancedAI ? (
                    <div className="col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
                        <h3 className="font-bold text-lg relative z-10 flex items-center gap-2"><Brain size={18}/> Cognitive Load</h3>
                        <div className="relative z-10 mt-2">
                             <div className="text-4xl font-black">{user.cognitiveLoadScore}%</div>
                             <p className="text-xs opacity-80 mt-1">
                                 {user.cognitiveLoadScore && user.cognitiveLoadScore > 80 ? "High load. AI inserted break." : "Optimal focus level."}
                             </p>
                        </div>
                        <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
                             <div className={`h-full ${user.cognitiveLoadScore && user.cognitiveLoadScore > 80 ? 'bg-red-400' : 'bg-green-400'}`} style={{width: `${user.cognitiveLoadScore}%`}}></div>
                        </div>
                    </div>
                ) : (
                    <div className="col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-white opacity-10 mix-blend-overlay"></div>
                        <h3 className="font-bold text-lg relative z-10">Predictive<br/>Insights</h3>
                        <p className="text-xs opacity-80 relative z-10">AI analyzed your recent performance.</p>
                        <div className="mt-4 relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <span className="text-xs font-medium">92% Completion Rate</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Productivity Trend</h3>
                        <p className="text-sm text-slate-500">Real-time activity for the last 7 days</p>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <TrendingUp size={20} className="text-slate-400"/>
                    </div>
                </div>
                {/* Fixed height container for Recharts */}
                <div className="w-full" style={{ height: 250, minHeight: 250 }}>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                            <Tooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="count" stroke="currentColor" strokeWidth={4} className={`${getColorClass(themeColor, 'text')}`} dot={{ r: 6, strokeWidth: 3, stroke: 'white', fill: 'currentColor' }} activeDot={{ r: 8, strokeWidth: 0, fill: 'currentColor' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Goal Proof / Daily Goal */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 w-full text-left">Daily Goal</h3>
                 <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * progress) / 100} strokeLinecap="round" className={`${getColorClass(themeColor, 'text')} transition-all duration-1000 ease-out`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{progress}%</span>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Done</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500">You've completed <strong className="text-slate-900 dark:text-white">{completedHabits}</strong> out of <strong className="text-slate-900 dark:text-white">{allHabits.length}</strong> tasks today.</p>
            </div>
        </div>

        {/* TODAY'S HABITS */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Today's Focus</h3>
                <button onClick={() => navigate('/goals')} className={`text-sm font-medium ${getColorClass(themeColor, 'text')} hover:opacity-80`}>
                    View All Goals
                </button>
            </div>
            {allHabits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allHabits.map((habit) => (
                        <div key={`${habit.goalId}-${habit.id}`} onClick={() => toggleHabit(habit.goalId, habit.id)} className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${habit.completed ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`transition-all duration-300 ${habit.completed ? 'text-green-500 scale-110' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                    {habit.completed ? <CheckCircle2 size={28} className="fill-current bg-white rounded-full" /> : <Circle size={28} />}
                                </div>
                                <div>
                                    <h4 className={`font-semibold text-base transition-all ${habit.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{habit.title}</h4>
                                    <p className="text-xs text-slate-500">{habit.goalTitle}</p>
                                </div>
                            </div>
                            {!habit.completed && <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 flex items-center gap-1 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors"><Zap size={12} fill="currentColor" /> +20 XP</div>}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Flame size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start your journey</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">You don't have any active habits yet. Create your first goal to start tracking progress.</p>
                    <button onClick={() => navigate('/goals')} className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 ${getColorClass(themeColor, 'bg')}`}><Plus size={20} /> Create First Goal</button>
                </div>
            )}
        </div>
      </main>

      {showReschedule && <RescheduleModal onClose={() => setShowReschedule(false)} />}
      <MentorChat />
    </div>
  );
};

export default Dashboard;
