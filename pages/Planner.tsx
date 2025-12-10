
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Plus, Calendar as CalIcon, Clock, CheckSquare, Square, Bot, Zap, Upload, ShieldAlert, LayoutTemplate, X } from 'lucide-react';
import SyllabusUploadModal from '../components/SyllabusUploadModal';

const Planner: React.FC = () => {
  const { plans, togglePlanTask, themeColor, enableAIPlanner, scheduledBlocks, enableAdvancedAI, toggleSurvivalMode, user, smartTemplates, applySmartTemplate, addPlan } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Create Plan State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanSubject, setNewPlanSubject] = useState('');

  const handleCreatePlan = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPlanTitle || !newPlanSubject) return;
      
      addPlan({
          id: `p_${Date.now()}`,
          title: newPlanTitle,
          subject: newPlanSubject,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
          priority: 'medium',
          tasks: [
              { id: `t_${Date.now()}_1`, title: 'Week 1 Goals', isCompleted: false, estimatedMinutes: 60, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          ]
      });
      setShowCreateModal(false);
      setNewPlanTitle('');
      setNewPlanSubject('');
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff}d` : 'Ended';
  };

  const blocksByDay = scheduledBlocks.reduce((acc, block) => {
      if (!acc[block.assignedDay]) acc[block.assignedDay] = [];
      acc[block.assignedDay].push(block);
      return acc;
  }, {} as Record<string, typeof scheduledBlocks>);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Study Planner" subtitle="Organize your study schedules and exam prep" />

      <main className="p-6 max-w-7xl mx-auto">
        
        {/* Advanced AI Controls */}
        {enableAdvancedAI && (
            <div className="mb-8 flex flex-wrap gap-4">
                <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Upload size={16} className="text-indigo-500"/> Upload Syllabus
                </button>
                <div className="relative">
                    <button onClick={() => setShowTemplates(!showTemplates)} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <LayoutTemplate size={16} className="text-pink-500"/> Smart Templates
                    </button>
                    {showTemplates && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden animate-in fade-in zoom-in-95">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase">Select Template</div>
                            {smartTemplates.map(t => (
                                <button key={t.id} onClick={() => { applySmartTemplate(t.id); setShowTemplates(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                    <div className="text-slate-900 dark:text-white">{t.name}</div>
                                    <div className="text-xs text-slate-500">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={toggleSurvivalMode} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${user.survivalMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    <ShieldAlert size={16} /> Exam Survival Mode {user.survivalMode ? 'ON' : 'OFF'}
                </button>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Active Study Plans
              {enableAIPlanner && <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 font-bold border border-indigo-200">AI Active</span>}
          </h3>
          <button 
            onClick={() => setShowCreateModal(true)}
            className={`${getColorClass(themeColor, 'bg')} hover:opacity-90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-${themeColor}-500/20`}
          >
            <Plus size={16} /> New Study Plan
          </button>
        </div>

        {/* AI PLANNER VIEW */}
        {enableAIPlanner && scheduledBlocks.length > 0 && (
            <div className="mb-10 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                    <Bot className="text-slate-100 dark:text-slate-800 w-24 h-24 rotate-12" />
                </div>
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10"><Zap size={18} className="text-amber-500" /> AI Suggested Schedule</h4>
                <div className="flex gap-4 overflow-x-auto pb-4 relative z-10">
                    {Object.keys(blocksByDay).sort().map(day => (
                        <div key={day} className="min-w-[200px] bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                             <div className="text-xs font-bold text-slate-400 uppercase mb-3">{day}</div>
                             <div className="space-y-2">
                                 {blocksByDay[day].map(block => {
                                     const task = plans.flatMap(p => p.tasks).find(t => t.id === block.taskId);
                                     return (
                                         <div key={block.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-sm border-l-4 border-indigo-500">
                                             <div className="font-bold text-slate-800 dark:text-white truncate">{task?.title || 'Unknown Task'}</div>
                                             <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                 <Clock size={10} /> 
                                                 {new Date(block.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                                 {new Date(block.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PLANS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {plans.map(plan => {
               const completedTasks = plan.tasks.filter(t => t.isCompleted).length;
               const totalTasks = plan.tasks.length;
               const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
               return (
                <div key={plan.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.title}</h4>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1">
                           <CalIcon size={12} /> {plan.subject}
                        </span>
                        <span className={`px-3 py-1 rounded-lg ${plan.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600'} text-xs font-semibold`}>
                          {plan.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getColorClass(themeColor, 'text')}`}>{getDaysRemaining(plan.endDate)}</p>
                      <p className="text-xs text-slate-400">Remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><CalIcon size={14} /> {plan.startDate} - {plan.endDate}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {getDaysRemaining(plan.endDate) === 'Ended' ? 'Completed' : 'Ongoing'}</span>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Overall Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getColorClass(themeColor, 'bg')} rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4">
                    <div className="space-y-2">
                      {plan.tasks.map(task => (
                        <div key={task.id} onClick={() => togglePlanTask(plan.id, task.id)} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                          <div className={`${task.isCompleted ? getColorClass(themeColor, 'text') : 'text-slate-300'}`}>
                            {task.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <span className={`text-sm flex-1 ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                              {task.title} {task.isRevision && <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-1.5 rounded font-bold">REVISION</span>}
                          </span>
                          {task.estimatedMinutes && <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{task.estimatedMinutes}m</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
          <div className="space-y-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><CalIcon size={18} className="text-slate-400"/> Upcoming Deadlines</h4>
                {plans.map(p => (
                  <div key={p.id} className="p-4 rounded-2xl mb-3 bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{p.title}</span>
                      <span className="text-xs font-bold">{getDaysRemaining(p.endDate)}</span>
                    </div>
                    <p className="text-xs opacity-80">{p.endDate}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
      
      {showUpload && <SyllabusUploadModal onClose={() => setShowUpload(false)} />}

      {/* New Plan Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Study Plan</h3>
                      <button onClick={() => setShowCreateModal(false)}><X size={20} className="text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleCreatePlan} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Title</label>
                          <input 
                              type="text" 
                              required 
                              value={newPlanTitle} 
                              onChange={e => setNewPlanTitle(e.target.value)} 
                              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white" 
                              placeholder="e.g. Finals Prep" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                          <input 
                              type="text" 
                              required 
                              value={newPlanSubject} 
                              onChange={e => setNewPlanSubject(e.target.value)} 
                              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white" 
                              placeholder="e.g. Mathematics" 
                          />
                      </div>
                      <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white mt-4 ${getColorClass(themeColor, 'bg')}`}>
                          Create Plan
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Planner;
