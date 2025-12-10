
import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { X, RefreshCw, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const RescheduleModal: React.FC<Props> = ({ onClose }) => {
    const { themeColor, riskReports, applyAIReschedule } = useStore();
    
    // Find high risk tasks
    const atRiskIds = Object.keys(riskReports).filter(id => riskReports[id].riskLevel === 'high' || riskReports[id].riskLevel === 'medium');
    const riskCount = atRiskIds.length;

    const handleApply = () => {
        applyAIReschedule();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
                            <AlertTriangle size={18} />
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Conflicts Detected</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Our AI predictor identified <strong className="text-slate-900 dark:text-white">{riskCount} tasks</strong> at risk of missing their deadlines based on your current schedule and habit streaks.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Proposed Action</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-center">
                                <span className="text-xs text-slate-400 uppercase font-bold">Current</span>
                                <div className="text-slate-500 text-sm mt-1 line-through decoration-red-400">Math Review</div>
                                <div className="text-xs text-red-500 font-medium">Risk: High</div>
                            </div>
                            <ArrowRight size={20} className="text-slate-400" />
                            <div className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-green-500/20 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                                <span className="text-xs text-slate-400 uppercase font-bold">New Slot</span>
                                <div className="text-slate-900 dark:text-white font-bold text-sm mt-1">Tomorrow 10 AM</div>
                                <div className="text-xs text-green-500 font-medium">Risk: Low</div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleApply}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-${themeColor}-500/30 flex items-center justify-center gap-2 ${getColorClass(themeColor, 'bg')} hover:opacity-90 transition-opacity`}
                    >
                        <RefreshCw size={18} /> Apply Reschedule
                    </button>
                    <button onClick={onClose} className="w-full mt-3 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Ignore
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;
