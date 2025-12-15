import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Task } from '../../types';

interface SubjectRadarProps {
    tasks: Task[];
}

const SubjectRadar: React.FC<SubjectRadarProps> = ({ tasks }) => {
    // Aggregation Logic
    const dataMap = new Map<string, number>();

    tasks.forEach(task => {
        if (task.status === 'Done') {
            const tag = task.subject_tag || 'General';
            dataMap.set(tag, (dataMap.get(tag) || 0) + 1);
        }
    });

    const data = Array.from(dataMap.entries()).map(([subject, count]) => ({
        subject,
        count,
        fullMark: Math.max(...Array.from(dataMap.values())) || 10
    }));

    // Ensure at least 3 points for a nice polygon, or handle empty state
    if (data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data available</div>;
    }

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Subject Focus Balance</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                            name="Tasks Completed"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SubjectRadar;
