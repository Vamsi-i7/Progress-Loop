
import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Flame, Trophy, TrendingUp, Target } from 'lucide-react';

const Progress: React.FC = () => {
  const { themeColor, goals, activityLogs, user } = useStore();
  
  // 1. Generate Real Weekly Data for Area Chart
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      
      data.push({
        name: days[d.getDay()],
        completed: activityLogs[dateKey] || 0
      });
    }
    return data;
  };

  const weeklyData = getWeeklyData();

  // 2. Mock Completion Rate Data (Since we only have logs for counts, not rates, we'll map counts to a visual scale for now)
  // In a real DB you would calculate percentage per day.
  const completionData = weeklyData.map(d => ({
      name: d.name,
      rate: Math.min(100, d.completed * 20) // Simulated: 5 tasks = 100%
  }));

  // Calculate Weekly Average
  const totalTasksLast7Days = weeklyData.reduce((acc, curr) => acc + curr.completed, 0);
  const weeklyAverage = Math.round(totalTasksLast7Days / 7);

  // Dynamic colors for charts
  const colors = {
    blue: '#2563eb',
    violet: '#7c3aed',
    emerald: '#059669',
    rose: '#e11d48',
    amber: '#d97706',
  };

  const chartColor = colors[themeColor];

  const StatCard = ({ icon: Icon, title, value, sub, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        <p className="text-emerald-500 text-xs font-bold mt-2">{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Progress" subtitle="Track your overall progress and achievements" />

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Target} 
            title="Goals Completed" 
            value={goals.filter(g => g.progress === 100).length} 
            sub="Keep going!" 
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
          />
          <StatCard 
            icon={Flame} 
            title="Current Streak" 
            value={user.streak} 
            sub="Don't break the chain!" 
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
          />
          <StatCard 
            icon={TrendingUp} 
            title="Weekly Average" 
            value={weeklyAverage} 
            sub="Tasks / day" 
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
          />
          <StatCard 
            icon={Trophy} 
            title="XP Earned" 
            value={user.xp} 
            sub={`Level ${user.level}`} 
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Activity</h3>
              <div className="flex gap-2">
                {['Weekly', 'Monthly', 'Yearly'].map(t => (
                   <button key={t} className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors">{t}</button>
                ))}
              </div>
            </div>
            {/* Fixed dimensions container */}
            <div className="w-full" style={{ height: 250, minHeight: 250, minWidth: 300 }}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: chartColor, strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="completed" stroke={chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorSplit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Daily Completion Rate (Est.)</h3>
             {/* Fixed dimensions container */}
             <div className="w-full" style={{ height: 250, minHeight: 250, minWidth: 300 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                     cursor={{fill: '#f1f5f9'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="rate" fill={chartColor} radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Progress;
