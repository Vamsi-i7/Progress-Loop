import React, { useState } from 'react';
import { useStore, getColorClass } from '../../../context/StoreContext';
import { Send, Bot, Sparkles } from 'lucide-react';

const NeuralLink: React.FC = () => {
    const { sendChatMessage, chatHistory, themeColor } = useStore();
    const [input, setInput] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        await sendChatMessage(input);
        setInput('');
    };

    const lastAiMessage = chatHistory.filter(m => m.sender === 'ai').pop();

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto mb-3 custom-scrollbar">
                {lastAiMessage ? (
                    <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
                        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-400 uppercase">
                            <Bot size={12} /> Neural Link
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">"{lastAiMessage.text.slice(0, 80)}{lastAiMessage.text.length > 80 ? '...' : ''}"</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                        <Sparkles size={24} className="mb-2 opacity-50" />
                        <p className="text-xs font-bold uppercase">System Online</p>
                        <p className="text-[10px] mt-1">Awaiting input command...</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Mentor..."
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                />
                <button type="submit" className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white hover:opacity-80 transition-opacity ${getColorClass(themeColor, 'bg')}`}>
                    <Send size={12} />
                </button>
            </form>
        </div>
    );
};

export default NeuralLink;
