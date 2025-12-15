import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Task } from '../../types';
import { eachDayOfInterval, subDays, format, isSameDay } from 'date-fns';

interface ConsistencyGraphProps {
    tasks: Task[];
}

const ConsistencyGraph: React.FC<ConsistencyGraphProps> = ({ tasks }) => {
    // Last 30 Days
    const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date()
    });

    const data = last30Days.map(date => {
        // Find tasks for this day (by due date or do date? Logic says "Completion %", usually implies tasks due that day)
        // Let's look at tasks due on this date.
        const tasksForDay = tasks.filter(t => isSameDay(new Date(t.due_date), date));
        const total = tasksForDay.length;
        const completed = tasksForDay.filter(t => t.status === 'Done').length;

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            dateStr: format(date, 'MMM d'),
            percentage,
            rawDate: date
        };
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">30-Day Consistency Trend</h3>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +12% vs last month
                </span>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="dateStr"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            interval={6}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ConsistencyGraph;
