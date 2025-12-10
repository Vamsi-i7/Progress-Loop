
import React from 'react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full w-fit">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
        </div>
    );
};

export default TypingIndicator;
