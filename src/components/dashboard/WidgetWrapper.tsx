import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Maximize2, Move, X } from 'lucide-react';
import { useStore, getColorClass } from '../../context/StoreContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface WidgetWrapperProps {
    children: React.ReactNode;
    title?: string;
    icon?: React.ReactNode;
    className?: string;
    onRemove?: () => void;
    isDraggable?: boolean;
    style?: React.CSSProperties;
    // Props passed by react-grid-layout
    classNameFromLayout?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

// Forward ref is crucial for react-grid-layout
const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps>(
    ({ children, title, icon, className, onRemove, isDraggable, style, classNameFromLayout, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref) => {
        const { themeColor } = useStore();

        return (
            <div
                ref={ref}
                style={style}
                className={cn(
                    "relative flex flex-col rounded-[2rem] overflow-hidden transition-all duration-300",
                    "bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 shadow-xl",
                    classNameFromLayout, // react-grid-layout classes
                    className
                )}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
                {...props}
            >
                {/* Header / Drag Handle */}
                <div className={cn(
                    "flex items-center justify-between px-5 py-3 border-b border-white/10 dark:border-slate-800/40",
                    isDraggable ? "cursor-move draggable-handle group" : ""
                )}>
                    <div className="flex items-center gap-3">
                        {icon && <div className={cn("text-slate-400 group-hover:text-white transition-colors", `text-${themeColor}-400`)}>{icon}</div>}
                        {title && <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors">{title}</h3>}
                    </div>
                    {isDraggable && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Move size={14} className="text-slate-500" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 overflow-auto relative z-10 custom-scrollbar">
                    {children}
                </div>

                {/* Background Gradients */}
                <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 pointer-events-none blur-3xl", getColorClass(themeColor, 'bg'))}></div>
                <div className={cn("absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-5 pointer-events-none blur-3xl")}></div>
            </div>
        );
    }
);

WidgetWrapper.displayName = 'WidgetWrapper';

export default WidgetWrapper;
