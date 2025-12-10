
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { X, UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const SyllabusUploadModal: React.FC<Props> = ({ onClose }) => {
    const { themeColor, handleSyllabusUpload } = useStore();
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setStatus('uploading');
        setTimeout(async () => {
            setStatus('processing');
            await handleSyllabusUpload(file);
            setStatus('success');
            setTimeout(onClose, 1500);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Syllabus Ingestion</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                
                <div className="p-8 text-center">
                    {status === 'idle' && (
                        <>
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 mb-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                                <input 
                                    type="file" 
                                    accept=".pdf,.jpg,.png" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center`}>
                                        {file ? <FileText size={32} className={getColorClass(themeColor, 'text')} /> : <UploadCloud size={32} />}
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{file ? file.name : "Click to Upload PDF or Image"}</p>
                                    <p className="text-xs text-slate-400">AI will extract units, topics, and deadlines.</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleProcess} 
                                disabled={!file}
                                className={`w-full py-3 rounded-xl font-bold text-white ${file ? getColorClass(themeColor, 'bg') : 'bg-slate-300 cursor-not-allowed'}`}
                            >
                                Process Syllabus
                            </button>
                        </>
                    )}

                    {(status === 'uploading' || status === 'processing') && (
                        <div className="py-8">
                            <Loader2 size={48} className={`animate-spin mx-auto mb-4 ${getColorClass(themeColor, 'text')}`} />
                            <h3 className="font-bold text-lg mb-2">{status === 'uploading' ? 'Uploading...' : 'AI Extracting Structure...'}</h3>
                            <p className="text-slate-500 text-sm">Identifying topics, weightage, and deadlines.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="font-bold text-lg">Syllabus Ingested!</h3>
                            <p className="text-slate-500 text-sm">Study plan created successfully.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SyllabusUploadModal;
