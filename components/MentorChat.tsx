
import React, { useState, useRef, useEffect } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { Bot, X, Send, User, ChevronDown } from 'lucide-react';

const MentorChat: React.FC = () => {
    const { enableAdvancedAI, chatHistory, sendChatMessage, themeColor, user } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

    if (!enableAdvancedAI) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className={`p-4 rounded-full shadow-2xl text-white ${getColorClass(themeColor, 'bg')} hover:scale-105 transition-transform flex items-center gap-2`}
                >
                    <Bot size={24} />
                    <span className="font-bold pr-2 hidden md:inline">AI Mentor</span>
                    {user.survivalMode && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></span>}
                </button>
            )}

            {isOpen && (
                <div className="w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                    {/* Header */}
                    <div className={`p-4 ${getColorClass(themeColor, 'bg')} text-white flex justify-between items-center`}>
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <div>
                                <h3 className="font-bold text-sm">Academic Mentor</h3>
                                {user.survivalMode && <span className="text-[10px] bg-red-500/80 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wider">Survival Mode On</span>}
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1"><ChevronDown size={20}/></button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {chatHistory.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' 
                                    ? `${getColorClass(themeColor, 'bg')} text-white rounded-tr-none` 
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <form 
                        onSubmit={(e) => { e.preventDefault(); if(input.trim()) { sendChatMessage(input); setInput(''); } }}
                        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2"
                    >
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your schedule..."
                            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button type="submit" disabled={!input.trim()} className={`p-2 rounded-xl text-white ${input.trim() ? getColorClass(themeColor, 'bg') : 'bg-slate-300'}`}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MentorChat;
