
import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Clock, Trash2, ArrowRight, FileText, Layers, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
    const { history, themeColor, loadHistoryItem, deleteHistoryItem, clearHistory } = useStore();
    const navigate = useNavigate();

    const handleLoad = (id: string) => {
        loadHistoryItem(id);
        navigate('/study/roadmap');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Header title="Study History" subtitle="Your past uploads and generated plans" />
            
            <main className="p-6 max-w-5xl mx-auto">
                {history.length > 0 && (
                     <div className="flex justify-end mb-6">
                        <button onClick={() => { if(window.confirm('Clear all history?')) clearHistory(); }} className="text-red-500 text-sm font-bold hover:underline">Clear All History</button>
                    </div>
                )}
                
                {history.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Clock size={64} className="mx-auto mb-4 text-slate-300"/>
                        <h3 className="text-xl font-bold text-slate-400">No History Yet</h3>
                        <p className="text-slate-400">Upload notes to create a study entry.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 h-14">{item.title}</h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this history?')) deleteHistoryItem(item.id); }}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div className="text-xs text-slate-500 mb-6 flex items-center gap-2">
                                    <Clock size={12} /> {new Date(item.uploadedAt).toLocaleDateString()}
                                </div>

                                <div className="flex gap-2 mb-6">
                                    <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <FileText size={10} /> {item.nodes.length}
                                    </span>
                                    <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <Layers size={10} /> {item.flashcards.length}
                                    </span>
                                     <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <BrainCircuit size={10} /> {item.embeddings.length}
                                    </span>
                                </div>

                                <button 
                                    onClick={() => handleLoad(item.id)}
                                    className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${getColorClass(themeColor, 'bg')} opacity-90 hover:opacity-100 transition-opacity`}
                                >
                                    Load Session <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;
