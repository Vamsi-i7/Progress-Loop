
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { ChevronRight, ChevronDown, BookOpen, Clock, BarChart, Zap, FileText, Calendar, Plus } from 'lucide-react';

const Roadmap: React.FC = () => {
    const { roadmaps, themeColor, createNodeFlashcards, createNodeSummary, openUploadModal, generateRoadmapTimetable } = useStore();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleGenCards = async (node: any) => {
        await createNodeFlashcards(node);
        alert('Flashcards Generated!');
    };

    const handleSummary = async (node: any) => {
        await createNodeSummary(node);
        alert('Summary Generated! Click node to view.');
    };
    
    const handleTimetable = () => {
        if (roadmaps.length > 0) {
            generateRoadmapTimetable(roadmaps[0].id);
            alert("Timetable Generated! Check 'Planner' tab.");
        }
    };

    const renderNode = (node: any, depth = 0) => {
        const hasChildren = roadmaps[0].nodes.some(n => n.parentId === node.id);
        const isExpanded = expanded[node.id];

        return (
            <div key={node.id} className="mb-2">
                <div 
                    className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow cursor-pointer ${selectedNode === node.id ? `ring-2 ring-${themeColor}-500` : ''}`}
                    style={{ marginLeft: `${depth * 24}px` }}
                    onClick={() => setSelectedNode(node.id)}
                >
                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${hasChildren ? 'visible' : 'invisible'}`}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{node.title}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                node.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                                node.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                            }`}>{node.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={12}/> {node.estimatedMinutes}m</span>
                            <span className="flex items-center gap-1"><BarChart size={12}/> W: {node.weight}</span>
                        </div>
                        {node.summaryOverview && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border-l-2 border-indigo-500">
                                {node.summaryOverview}
                            </p>
                        )}
                        {node.summaryDetailed && selectedNode === node.id && (
                             <div className="text-xs text-slate-500 mt-2 whitespace-pre-wrap border-t border-slate-100 dark:border-slate-800 pt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                {node.summaryDetailed}
                             </div>
                        )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={(e) => {e.stopPropagation(); handleGenCards(node);}} title="Gen Cards" className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Zap size={16}/></button>
                        <button onClick={(e) => {e.stopPropagation(); handleSummary(node);}} title="Summarize" className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><FileText size={16}/></button>
                    </div>
                </div>
                {isExpanded && (
                    <div className="mt-2">
                        {roadmaps[0].nodes.filter(n => n.parentId === node.id).map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header title="Course Roadmap" subtitle="AI Generated Structure" />
            <main className="p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={openUploadModal} className={`px-6 py-2 rounded-xl font-bold text-white shadow-lg ${getColorClass(themeColor, 'bg')} flex items-center gap-2`}>
                        <Plus size={18}/> Upload Notes
                    </button>
                    {roadmaps.length > 0 && (
                        <button onClick={handleTimetable} className="px-6 py-2 rounded-xl font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Calendar size={18}/> Generate Timetable
                        </button>
                    )}
                </div>

                {roadmaps.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <BookOpen size={64} className="mx-auto text-slate-300 mb-6"/>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Roadmap Found</h2>
                        <p className="text-slate-500 mb-8">Upload your course notes to generate a study tree.</p>
                        <button onClick={openUploadModal} className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg ${getColorClass(themeColor, 'bg')}`}>
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">{roadmaps[0].title}</h3>
                        </div>
                        <div className="space-y-1">
                            {roadmaps[0].nodes.filter(n => !n.parentId).map(root => renderNode(root))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Roadmap;
