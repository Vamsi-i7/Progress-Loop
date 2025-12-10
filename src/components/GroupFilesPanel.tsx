
import React, { useRef } from 'react';
import { PeerGroup } from '../types';
import { X, UploadCloud, FileText, Download } from 'lucide-react';
import { MockBackend } from '../services/MockBackend';
import { useStore } from '../context/StoreContext';

interface Props {
    group: PeerGroup;
    onClose: () => void;
}

const GroupFilesPanel: React.FC<Props> = ({ group, onClose }) => {
    const { refreshData } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            await MockBackend.uploadGroupAttachment(group.id, file);
            refreshData();
        }
    };

    return (
        <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Files</h3>
                <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
            </div>
            
            <div className="p-4">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                >
                    <UploadCloud size={20}/> Upload File
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {group.attachments && group.attachments.length > 0 ? (
                    group.attachments.map(att => (
                        <div key={att.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <FileText size={16}/>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{att.name}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(att.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-indigo-500 p-1"><Download size={16}/></button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-400 text-sm py-10">No files shared yet.</p>
                )}
            </div>
        </div>
    );
};

export default GroupFilesPanel;
