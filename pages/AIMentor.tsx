
import React, { useState, useRef, useEffect } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Bot, Send, User, Sparkles, BookOpen } from 'lucide-react';

const AIMentor: React.FC = () => {
    const { chatHistory, sendChatMessage, themeColor, user } = useStore();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendChatMessage(input);
            setInput('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col h-screen">
            <Header title="AI Academic Mentor" subtitle="Your personal study assistant" />
            
            <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-6 overflow-hidden">
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden relative">
                    
                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {chatHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <div className={`w-20 h-20 rounded-3xl ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white mb-6 shadow-xl`}>
                                    <Bot size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How can I help you study?</h3>
                                <p className="text-slate-500 max-w-md">I can answer questions from your notes, create study plans, or just help you stay motivated.</p>
                            </div>
                        ) : (
                            chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : `bg-gradient-to-br from-indigo-500 to-purple-600 text-white`}`}>
                                        {msg.sender === 'user' ? user.name[0] : <Bot size={20} />}
                                    </div>
                                    <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-2xl text-sm md:text-base shadow-sm ${
                                            msg.sender === 'user' 
                                                ? `${getColorClass(themeColor, 'bg')} text-white rounded-tr-none` 
                                                : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {msg.sources.map((source, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                                                        <BookOpen size={10} /> Source Ref
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="relative flex gap-3">
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={input} 
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..." 
                                    className="w-full pl-5 pr-12 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white transition-all shadow-inner"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Sparkles size={18} className="text-indigo-400" />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!input.trim()}
                                className={`p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${getColorClass(themeColor, 'bg')}`}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIMentor;
