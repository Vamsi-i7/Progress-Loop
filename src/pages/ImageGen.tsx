
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { generateImage } from '../services/ai';
import { Image as ImageIcon, Download, Sparkles, Loader2 } from 'lucide-react';

const ImageGen: React.FC = () => {
    const { themeColor } = useStore();
    const [prompt, setPrompt] = useState('');
    const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [generating, setGenerating] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;
        
        setGenerating(true);
        setResultUrl(null);
        
        try {
            const url = await generateImage(prompt, size);
            if (url) setResultUrl(url);
            else alert("Failed to generate image. Please try again.");
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Header title="Studio" subtitle="Generate visual study aids" />
            
            <main className="p-6 max-w-4xl mx-auto w-full flex-1">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Prompt</label>
                            <textarea 
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white resize-none h-32"
                                placeholder="Describe the image... (e.g., A diagram of the human heart, neon style)"
                            />
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                {['1K', '2K', '4K'].map((s) => (
                                    <button 
                                        key={s}
                                        type="button"
                                        onClick={() => setSize(s as any)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${size === s ? `${getColorClass(themeColor, 'bg')} text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button 
                                type="submit" 
                                disabled={generating || !prompt}
                                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 ${getColorClass(themeColor, 'bg')}`}
                            >
                                {generating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                Generate
                            </button>
                        </div>
                    </form>

                    <div className="mt-12">
                        {generating ? (
                            <div className="aspect-square w-full max-w-lg mx-auto rounded-3xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center animate-pulse">
                                <ImageIcon size={48} className="text-slate-300 mb-4" />
                                <p className="text-slate-400 text-sm">Creating masterpiece...</p>
                            </div>
                        ) : resultUrl ? (
                            <div className="relative group w-full max-w-lg mx-auto">
                                <img src={resultUrl} alt="Generated" className="w-full h-auto rounded-3xl shadow-2xl border border-white/20" />
                                <a 
                                    href={resultUrl} 
                                    download="generated-study-aid.png"
                                    className="absolute bottom-4 right-4 p-3 bg-white text-slate-900 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-50">
                                <ImageIcon size={64} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500">Enter a prompt to visualize concepts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImageGen;
