import React, { useState, useRef, useEffect } from 'react';
import { useStudentBrain } from '../../hooks/useStudentBrain';
import { api } from '../../services/api';
import { Task, Habit, HabitLog } from '../../types';
import { Bot, X, Send, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface AIMentorChatProps {
    tasks: Task[];
    habits: Habit[];
    logs: HabitLog[];
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const AIMentorChat: React.FC<AIMentorChatProps> = ({ tasks, habits, logs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your academic mentor. I have analyzed your current task list and habits. How can I help you improve today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { dailyScore, streak, level } = useStudentBrain(tasks, habits, logs);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Context Logic: Inject stats into the prompt context if needed
            // Ideally, we send this context to the backend, and the backend prepends it to the system prompt.
            // For now, let's append a silent context summary to the history array sent to backend.

            const contextSummary = `
                Current State:
                - Daily Efficiency Score: ${dailyScore}
                - Current Streak: ${streak} days
                - Level: ${level}
                - Overdue Tasks: ${tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Done').length}
            `;

            const historyPayload = messages.map(m => ({
                role: m.role as 'user' | 'model',
                parts: [{ text: m.content }]
            }));

            // Add current context
            historyPayload.push({
                role: 'user',
                parts: [{ text: `[System Context: ${contextSummary}] ${input}` }]
            });

            const response = await api.chatWithAI(input, historyPayload);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer || "I'm thinking..."
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center hover:scale-105 z-50"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200 z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">AI Study Coach</h3>
                            <p className="text-xs text-indigo-200">Online • Level {level} Context</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1",
                                    msg.role === 'user' ? "bg-slate-200" : "bg-indigo-100 text-indigo-600"
                                )}>
                                    {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-slate-500" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={clsx(
                                    "p-3 text-sm rounded-2xl shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 mr-auto">
                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mt-1"><Bot className="w-4 h-4" /></div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your study plan..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIMentorChat;
