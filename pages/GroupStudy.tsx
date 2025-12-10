
import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Users, Share2, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';

const GroupStudy: React.FC = () => {
    const { peerGroups, themeColor } = useStore();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header title="Group Study" subtitle="Collaborate with peers" />
            
            <main className="p-6 max-w-7xl mx-auto space-y-8">
                {peerGroups.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={64} className="mx-auto text-slate-300 mb-4"/>
                        <h3 className="text-xl font-bold text-slate-400">No Groups Yet</h3>
                        <p className="text-slate-500">Create a group to start planning together.</p>
                    </div>
                ) : (
                    peerGroups.map(group => (
                        <div key={group.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${getColorClass(themeColor, 'bg')} text-white flex items-center justify-center`}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{group.name}</h3>
                                        <p className="text-sm text-slate-500">{group.members.length} members • {group.sharedPlans.length} shared plans</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><MoreHorizontal size={20}/></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Members Status */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Live Status</h4>
                                    <div className="space-y-3">
                                        {group.members.map((m, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {m.name[0]}
                                                    </div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                                    m.status === 'online' ? 'bg-green-100 text-green-600' : 
                                                    m.status === 'studying' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                    {m.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shared Deadlines */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Upcoming Deadlines</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                            <Clock size={16} className="text-amber-500" />
                                            <span className="text-sm font-medium flex-1">Calculus Review</span>
                                            <span className="text-xs font-bold text-slate-400">Tomorrow</span>
                                        </div>
                                         <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                            <Clock size={16} className="text-amber-500" />
                                            <span className="text-sm font-medium flex-1">Physics Lab</span>
                                            <span className="text-xs font-bold text-slate-400">2 Days</span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Share2 size={16} /> Share New Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default GroupStudy;
