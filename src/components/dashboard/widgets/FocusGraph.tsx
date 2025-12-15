import React from 'react';
import { useStore, getColorClass } from '../../../context/StoreContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FocusGraph: React.FC = () => {
    const { activityLogs, themeColor } = useStore();

    const data = Object.keys(activityLogs).slice(-7).map(date => ({
        date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        value: activityLogs[date] || 0
    }));

    // Fallback data if empty
    const chartData = data.length > 0 ? data : [
        { date: 'Mon', value: 2 }, { date: 'Tue', value: 5 }, { date: 'Wed', value: 3 },
        { date: 'Thu', value: 8 }, { date: 'Fri', value: 4 }, { date: 'Sat', value: 6 }, { date: 'Sun', value: 4 }
    ];

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: 'white' }}
                            itemStyle={{ color: '#818cf8' }}
                            mapper={() => []}
                            labelStyle={{ display: 'none' }}
                            formatter={(value: number) => [`${value} Tasks`, 'Completed']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between px-2 pt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                {chartData.map((d, i) => (
                    <span key={i}>{d.date[0]}</span>
                ))}
            </div>
        </div>
    );
};

export default FocusGraph;
