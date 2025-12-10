
import React, { useMemo, useCallback, useState } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    useReactFlow, 
    ReactFlowProvider,
    Node as RFNode,
    Edge as RFEdge,
    Handle,
    Position,
    BackgroundVariant
} from 'reactflow';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Focus, UploadCloud, Clock, BarChart2, BookOpen, Layers } from 'lucide-react';
// Local type import renaming to avoid conflict
import { Node as StudyNode } from '../types';

// --- CUSTOM NODE COMPONENT ---
const CustomMindMapNode = ({ data }: { data: any }) => {
    // Difficulty color coding
    const difficultyColors = {
        easy: 'border-green-400 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300',
        medium: 'border-amber-400 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300',
        hard: 'border-red-400 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300'
    };

    const diffClass = difficultyColors[data.difficulty as keyof typeof difficultyColors] || difficultyColors.medium;

    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
            
            <div className={`
                w-64 rounded-2xl bg-white dark:bg-slate-900 
                shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.15)] 
                border-2 border-slate-100 dark:border-slate-800 
                transition-all duration-300 overflow-hidden
            `}>
                {/* Header Strip */}
                <div className={`h-1.5 w-full ${diffClass.split(' ')[0].replace('border', 'bg')}`}></div>
                
                <div className="p-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 leading-snug">{data.label}</h3>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-3">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            <Clock size={10} /> {data.time}m
                        </div>
                        <div className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider ${diffClass.replace('border-', '')}`}>
                            {data.difficulty}
                        </div>
                    </div>

                    {data.weight > 0 && (
                        <div className="mt-2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 opacity-50" style={{ width: `${Math.min(100, data.weight)}%` }}></div>
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
        </div>
    );
};

const MindMapContent: React.FC = () => {
    const { roadmaps, themeColor, openUploadModal } = useStore();
    const { fitView } = useReactFlow();
    const [nodes, setNodes] = useState<RFNode[]>([]);
    const [edges, setEdges] = useState<RFEdge[]>([]);

    // Register Custom Node Type
    const nodeTypes = useMemo(() => ({ custom: CustomMindMapNode }), []);

    // Recalculate layout when roadmaps change
    useMemo(() => {
        if (roadmaps.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }
        
        const rNodes: RFNode[] = [];
        const rEdges: RFEdge[] = [];
        
        // Improved Tree Layout
        const levelY: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        // Increase offsets for the custom node size
        const X_OFFSET = 350; 
        const Y_SPACING = 180;

        roadmaps[0].nodes.forEach((n: StudyNode) => {
            const level = n.level || 0;
            const x = level * X_OFFSET;
            // Add some jitter to Y to make it look less robotic if multiple nodes share parent
            const y = (levelY[level] || 0) * Y_SPACING;
            
            levelY[level] = (levelY[level] || 0) + 1;
            
            rNodes.push({
                id: n.id,
                type: 'custom', // Use our custom component
                data: { 
                    label: n.title, 
                    difficulty: n.difficulty || 'medium',
                    time: n.estimatedMinutes || 30,
                    weight: n.weight || 0
                },
                position: { x, y },
            });

            if (n.parentId) {
                rEdges.push({
                    id: `e-${n.parentId}-${n.id}`,
                    source: n.parentId,
                    target: n.id,
                    type: 'default', // Bezier
                    style: { stroke: '#94a3b8', strokeWidth: 2, opacity: 0.5 },
                    animated: false
                });
            }
        });

        setNodes(rNodes);
        setEdges(rEdges);
        
        // Fit view after small delay to allow render
        setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);

    }, [roadmaps, fitView]);

    const handleCenter = useCallback(() => {
        fitView({ duration: 800, padding: 0.2 });
    }, [fitView]);

    return (
        <div className="flex-1 w-full h-[calc(100vh-100px)] relative bg-slate-50 dark:bg-slate-950">
            {/* Control Bar */}
            <div className="absolute top-6 right-6 z-10 flex gap-3">
                 <button onClick={openUploadModal} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold shadow-xl shadow-${themeColor}-500/20 ${getColorClass(themeColor, 'bg')} hover:scale-105 transition-all`}>
                    <UploadCloud size={18}/> New Map
                </button>
                <button onClick={handleCenter} title="Center Graph" className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Focus size={20}/>
                </button>
            </div>

            {nodes.length > 0 ? (
                <div className="w-full h-full">
                    <ReactFlow 
                        nodes={nodes} 
                        edges={edges} 
                        nodeTypes={nodeTypes}
                        fitView 
                        minZoom={0.1}
                        maxZoom={1.5}
                        defaultEdgeOptions={{ type: 'smoothstep' }}
                        proOptions={{ hideAttribution: true }}
                        onInit={(instance) => {
                            setTimeout(() => instance.fitView(), 100);
                        }}
                    >
                        <Background 
                            color="#94a3b8" 
                            variant={BackgroundVariant.Dots} 
                            gap={24} 
                            size={1} 
                            className="opacity-20"
                        />
                        <Controls 
                            className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 !shadow-xl !rounded-xl overflow-hidden [&>button]:!border-slate-100 dark:[&>button]:!border-slate-700 [&>button]:!text-slate-600 dark:[&>button]:!text-slate-300 hover:[&>button]:!bg-slate-50 dark:hover:[&>button]:!bg-slate-700" 
                        />
                    </ReactFlow>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full flex-col gap-6 animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2 animate-bounce">
                        <Layers size={48} className="text-indigo-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your mind map is empty</h2>
                        <p className="text-slate-500 dark:text-slate-400">Upload your course notes to visualize concepts.</p>
                    </div>
                    <button onClick={openUploadModal} className={`px-8 py-4 rounded-2xl font-bold text-white shadow-xl shadow-${themeColor}-500/30 ${getColorClass(themeColor, 'bg')} flex items-center gap-2 hover:scale-105 transition-transform`}>
                        <UploadCloud size={20}/> Upload Notes
                    </button>
                </div>
            )}
        </div>
    );
};

const MindMap: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Header title="Mind Map" subtitle="Visual Learning Structure" />
            <ReactFlowProvider>
                <MindMapContent />
            </ReactFlowProvider>
        </div>
    );
};

export default MindMap;
