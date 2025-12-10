
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { X, UploadCloud, FileText, Loader2, CheckCircle, BookOpen, AlertCircle, FileType } from 'lucide-react';
import { readFileAsText } from '../services/syllabusParser';

const UploadNotesModal: React.FC = () => {
    const { themeColor, uploadNotes, closeUploadModal } = useStore();
    const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'embedding' | 'success'>('idle');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const ALLOWED_TYPES = ['text/plain', 'text/markdown', 'application/json', 'text/csv', 'application/pdf'];
    const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.pdf'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const fileType = selectedFile.type;
            const fileName = selectedFile.name.toLowerCase();

            const isValidType = ALLOWED_TYPES.includes(fileType) || 
                                ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

            if (!isValidType) {
                setError("Unsupported file format. Please upload text-based files.");
                setFile(null);
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) { 
                setError("File size too large. Max limit is 5MB.");
                setFile(null);
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setStatus('uploading');
        
        try {
            if (file.name.toLowerCase().endsWith('.pdf')) {
                // Check if PDF.js is available globally (e.g. from CDN in index.html)
                // Since we cannot verify if it's there in this environment, 
                // we'll assume standard text processing or throw error.
                // NOTE: Real implementation requires pdfjs-dist.
                // For this demo, we error out if not present or just treat as text.
                if (!(window as any).pdfjsLib) {
                    throw new Error("PDF processing library (pdf.js) is missing. Please add it or upload a TXT file.");
                }
                // Mocking PDF text extraction or implementing if lib exists...
                // await extractPdfText(file);
            }

            setStatus('parsing');
            await uploadNotes(file);
            setStatus('success');
            setTimeout(closeUploadModal, 2000);
        } catch (error: any) {
            console.error(error);
            setStatus('idle');
            setError(error.message || 'Failed to process notes.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen size={20} className={getColorClass(themeColor, 'text')}/> AI Study Assistant
                    </h3>
                    <button onClick={closeUploadModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20}/></button>
                </div>
                
                <div className="p-8">
                    {status === 'idle' && (
                        <>
                            <div className={`border-2 border-dashed rounded-2xl p-8 mb-6 transition-colors relative group ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                <input 
                                    type="file" 
                                    accept=".txt,.md,.json,.csv,.pdf" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3 transition-transform group-hover:scale-105">
                                    <div className={`w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center`}>
                                        {file ? <FileText size={32} className={getColorClass(themeColor, 'text')} /> : <UploadCloud size={32} />}
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{file ? file.name : "Click to Upload Notes"}</p>
                                    <p className="text-xs text-slate-400">Max size: 5MB</p>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <FileType size={12} /> Supported Formats
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> .TXT / .MD
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> .PDF (Requires Lib)
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleProcess} 
                                disabled={!file}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${file ? `${getColorClass(themeColor, 'bg')} shadow-lg hover:opacity-90` : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}`}
                            >
                                Generate Study Plan
                            </button>
                        </>
                    )}

                    {(status !== 'idle' && status !== 'success') && (
                        <div className="py-8">
                            <Loader2 size={48} className={`animate-spin mx-auto mb-4 ${getColorClass(themeColor, 'text')}`} />
                            <h3 className="font-bold text-lg mb-2 capitalize text-slate-900 dark:text-white">{status}...</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Processing your content...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Complete!</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Your roadmap is ready.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadNotesModal;
