import React, { useEffect, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';
import { Task, Habit } from '../../types';
import ConsistencyGraph from './ConsistencyGraph';
import SubjectRadar from './SubjectRadar';
import StudyHeatmap from './StudyHeatmap';

const Dashboard: React.FC = () => {
    const { tasks, isLoading: isLoadingTasks } = useTasks();
    const { habits, isLoading: isLoadingHabits } = useHabits();

    const loading = isLoadingTasks || isLoadingHabits;

    /*
    // Legacy useEffect fetching
    const [tasks, setTasks] = useState<Task[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ...
    }, []);
    */

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-6 p-6">
            <div className="col-span-12">
                <ConsistencyGraph tasks={tasks} />
            </div>

            <div className="col-span-12 md:col-span-8">
                <StudyHeatmap tasks={tasks} />
            </div>

            <div className="col-span-12 md:col-span-4">
                <SubjectRadar tasks={tasks} />
            </div>
        </div>
    );
};

export default Dashboard;
