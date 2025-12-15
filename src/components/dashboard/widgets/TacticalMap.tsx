import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { useStore, getColorClass } from '../../../context/StoreContext';

const TacticalMap: React.FC = () => {
    const { themeColor } = useStore();

    const data = [
        { subject: 'Math', A: 120, fullMark: 150 },
        { subject: 'Phys', A: 98, fullMark: 150 },
        { subject: 'Chem', A: 86, fullMark: 150 },
        { subject: 'Bio', A: 99, fullMark: 150 },
        { subject: 'Eng', A: 85, fullMark: 150 },
        { subject: 'Hist', A: 65, fullMark: 150 },
    ];

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="#6366f1"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TacticalMap;
