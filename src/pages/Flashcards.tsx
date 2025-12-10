
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { RefreshCw, ArrowRight, ArrowLeft, Download, Layers, UploadCloud } from 'lucide-react';

const Flashcards: React.FC = () => {
    const { flashcards, themeColor, openUploadModal } = useStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const exportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flashcards));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "flashcards.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Header title="Flashcards" />
                <main className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        <Layers size={64} className="mx-auto text-slate-300 mb-4"/>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">No flashcards generated yet</h3>
                        <p className="text-slate-500 mb-8">Upload notes to generate flashcards.</p>
                        <button onClick={openUploadModal} className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg ${getColorClass(themeColor, 'bg')} flex items-center gap-2 mx-auto`}>
                            <UploadCloud size={20} /> Upload Notes
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    const nextCard = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header title="Flashcards" subtitle={`${currentIndex + 1} / ${flashcards.length}`} />
            
            <main className="p-6 max-w-2xl mx-auto flex flex-col items-center">
                <div className="flex w-full justify-between items-center mb-6">
                    <button onClick={openUploadModal} className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <UploadCloud size={16}/> Upload Notes
                    </button>
                    <button onClick={exportJSON} className={`flex items-center gap-2 text-sm font-bold ${getColorClass(themeColor, 'text')} hover:underline`}>
                        <Download size={16}/> Export Deck
                    </button>
                </div>

                <div className="w-full aspect-[3/2] perspective-1000 mb-8 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
                            <span className="absolute top-6 left-6 text-xs font-bold uppercase text-slate-400 tracking-widest">{currentCard.type}</span>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                                {currentCard.question}
                            </h3>
                            <p className="mt-8 text-sm text-slate-400 flex items-center gap-2 absolute bottom-6">Tap to flip <RefreshCw size={12}/></p>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden bg-indigo-600 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center" style={{ transform: 'rotateY(180deg)' }}>
                            <span className="absolute top-6 left-6 text-xs font-bold uppercase text-indigo-200 tracking-widest">Answer</span>
                            <p className="text-xl font-medium leading-relaxed">
                                {currentCard.answer}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={prevCard} className="p-4 rounded-full bg-white dark:bg-slate-900 shadow-lg hover:scale-110 transition-transform">
                        <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300"/>
                    </button>
                    <button onClick={nextCard} className={`px-8 py-4 rounded-2xl font-bold text-white shadow-lg shadow-${themeColor}-500/30 hover:scale-105 transition-transform ${getColorClass(themeColor, 'bg')}`}>
                        Next Card
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Flashcards;
