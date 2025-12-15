import React from 'react';
import { clsx } from 'clsx';
import { eachDayOfInterval, subDays, format, isSameDay, getDay } from 'date-fns';
import { Task } from '../../types';

interface StudyHeatmapProps {
    tasks: Task[];
}

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ tasks }) => {
    // Generate last 364 days (approx 52 weeks)
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 364),
        end: today
    });

    const getIntensityClass = (minutes: number) => {
        if (minutes === 0) return 'bg-gray-100';
        if (minutes < 60) return 'bg-green-200';
        if (minutes < 120) return 'bg-green-400';
        if (minutes < 240) return 'bg-green-600';
        return 'bg-green-800';
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700">Study Intensity (Last Year)</h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-200 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-800 rounded-sm"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2">
                {/* 
                   Rendering logic:
                   GitHub graph is columns of weeks (Sun-Sat).
                   We need to group days by week.
                */}
                {Array.from({ length: 53 }).map((_, weekIndex) => {
                    const weekDays = days.slice(weekIndex * 7, (weekIndex * 7) + 7);
                    if (weekDays.length === 0) return null;

                    return (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {weekDays.map((day) => {
                                // Calculate minutes spent on incomplete or complete tasks for this day?
                                // "Visualizing actual_minutes from the tasks table" - implies log of work done.
                                // We'll sum actual_minutes for tasks where `do_date` or `due_date` matches this day.
                                // Or better, just check if any task was updated/done today.
                                // Given simple schema, let's look at `actual_minutes` for tasks due/logged today.

                                const minutes = tasks.reduce((acc, t) => {
                                    // Complex logic: tasks don't have a daily log table yet in this schema, just 'actual_minutes' total.
                                    // Simplification: If task due date is same day, count it.
                                    // Or if we had an ActivityLog table.
                                    // For this exact request: "visualizing actual_minutes from the tasks table".
                                    if (isSameDay(new Date(t.due_date), day)) {
                                        return acc + (t.actual_minutes || 0);
                                    }
                                    return acc;
                                }, 0);

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={clsx(
                                            "w-2.5 h-2.5 rounded-sm transition-all hover:ring-2 hover:ring-slate-300 cursor-pointer",
                                            getIntensityClass(minutes)
                                        )}
                                        title={`${format(day, 'MMM d, yyyy')}: ${minutes} mins`}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudyHeatmap;
