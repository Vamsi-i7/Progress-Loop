// @ts-ignore
import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Activity, Brain, Target, ListTodo, MessageSquare, Layout, Lock, Unlock } from 'lucide-react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';

// Widgets
import WidgetWrapper from '../components/dashboard/WidgetWrapper';
import BioStats from '../components/dashboard/widgets/BioStats';
import FocusGraph from '../components/dashboard/widgets/FocusGraph';
import MissionLog from '../components/dashboard/widgets/MissionLog';
import NeuralLink from '../components/dashboard/widgets/NeuralLink';
import TacticalMap from '../components/dashboard/widgets/TacticalMap';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard: React.FC = () => {
    const { user, themeColor } = useStore();
    const [isDraggable, setIsDraggable] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Default Layouts
    const defaultLayouts = {
        lg: [
            { i: 'biostats', x: 0, y: 0, w: 4, h: 6, minW: 2, minH: 4 },
            { i: 'focusgraph', x: 4, y: 0, w: 5, h: 6, minW: 4, minH: 4 },
            { i: 'neurallink', x: 9, y: 0, w: 3, h: 6, minW: 2, minH: 4 },
            { i: 'tacticalmap', x: 0, y: 6, w: 4, h: 6, minW: 3, minH: 5 },
            { i: 'missionlog', x: 4, y: 6, w: 4, h: 6, minW: 3, minH: 4 },
            // Add more placeholder or future widgets here
        ],
        md: [
            { i: 'biostats', x: 0, y: 0, w: 5, h: 6 },
            { i: 'focusgraph', x: 5, y: 0, w: 5, h: 6 },
            { i: 'missionlog', x: 0, y: 6, w: 5, h: 6 },
            { i: 'tacticalmap', x: 5, y: 6, w: 5, h: 6 },
            { i: 'neurallink', x: 0, y: 12, w: 10, h: 4 },
        ],
        sm: [
            { i: 'biostats', x: 0, y: 0, w: 6, h: 7 },
            { i: 'focusgraph', x: 0, y: 7, w: 6, h: 6 },
            { i: 'missionlog', x: 0, y: 13, w: 6, h: 6 },
            { i: 'neurallink', x: 0, y: 19, w: 6, h: 5 },
            { i: 'tacticalmap', x: 0, y: 24, w: 6, h: 6 },
        ]
    };

    const [layouts, setLayouts] = useState(defaultLayouts);

    const onLayoutChange = (layout: any, layouts: any) => {
        setLayouts(layouts);
        // Optionally save to local storage or backend
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20 overflow-x-hidden selection:bg-indigo-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-50"></div>
            <div className="fixed top-0 left-0 w-full h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-40"></div>

            <Header title="Control Center" subtitle="Operating System Online" />

            <div className="px-6 pb-4 flex justify-end">
                <button
                    onClick={() => setIsDraggable(!isDraggable)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md border transition-all ${isDraggable ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                >
                    {isDraggable ? <Unlock size={14} /> : <Lock size={14} />}
                    {isDraggable ? 'Edit Mode Unlocked' : 'Edit Mode Locked'}
                </button>
            </div>

            <ResponsiveGridLayout
                className="layout px-4 md:px-6"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                draggableHandle=".draggable-handle"
                isDraggable={isDraggable}
                isResizable={isDraggable}
                onLayoutChange={onLayoutChange}
                margin={[20, 20]}
            >
                <WidgetWrapper key="biostats" title="Bio-Metrics" icon={<Activity size={18} />} isDraggable={isDraggable}>
                    <BioStats />
                </WidgetWrapper>

                <WidgetWrapper key="focusgraph" title="Focus Output" icon={<Layout size={18} />} isDraggable={isDraggable}>
                    <FocusGraph />
                </WidgetWrapper>

                <WidgetWrapper key="missionlog" title="Mission Log" icon={<ListTodo size={18} />} isDraggable={isDraggable}>
                    <MissionLog />
                </WidgetWrapper>

                <WidgetWrapper key="tacticalmap" title="Tactical Map" icon={<Target size={18} />} isDraggable={isDraggable}>
                    <TacticalMap />
                </WidgetWrapper>

                <WidgetWrapper key="neurallink" title="Neural Link" icon={<Brain size={18} />} isDraggable={isDraggable}>
                    <NeuralLink />
                </WidgetWrapper>

            </ResponsiveGridLayout>
        </div>
    );
};

export default Dashboard;
