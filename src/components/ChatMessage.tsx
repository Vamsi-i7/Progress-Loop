
import React from 'react';
import { GroupMessage } from '../types';
import { useStore, getColorClass } from '../context/StoreContext';
import { Bot, Paperclip } from 'lucide-react';

interface Props {
    msg: GroupMessage;
    isMe: boolean;
}

const ChatMessageItem: React.FC<Props> = ({ msg, isMe }) => {
    const { themeColor } = useStore();
    
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${msg.isAi ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {msg.isAi ? <Bot size={16}/> : msg.senderName ? msg.senderName[0] : '?'}
                </div>
                <div className="min-w-0">
                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div className={`p-3 md:p-4 rounded-2xl text-sm shadow-sm relative group ${
                        isMe 
                            ? `${getColorClass(themeColor, 'bg')} text-white rounded-tr-none` 
                            : msg.isAi 
                                ? 'bg-white dark:bg-slate-800 border-l-4 border-indigo-500 text-slate-700 dark:text-slate-200' 
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none text-slate-800 dark:text-slate-200'
                    }`}>
                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                        
                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {msg.attachments.map(att => (
                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-xs hover:bg-black/20 transition-colors">
                                        <Paperclip size={12}/> {att.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                    {msg.isAi && <p className="text-[10px] text-slate-400 mt-1 pl-1 flex items-center gap-1"><Bot size={10}/> AI Assistant</p>}
                </div>
            </div>
        </div>
    );
};

export default ChatMessageItem;
