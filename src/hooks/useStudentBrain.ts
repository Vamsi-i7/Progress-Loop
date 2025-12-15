import { useMemo } from 'react';
import { Task, Habit, HabitLog } from '../types';
import { calculateDailyScore, calculateStreak, calculateGamification, autoReschedule } from '../lib/brain';

export const useStudentBrain = (tasks: Task[], habits: Habit[], logs: HabitLog[]) => {
    // Returns memoized calculations so we don't re-run math on every render
    const dailyScore = useMemo(() => calculateDailyScore(tasks, habits, logs), [tasks, habits, logs]);

    const streak = useMemo(() => calculateStreak(logs), [logs]);

    const gamification = useMemo(() => calculateGamification(tasks, logs), [tasks, logs]);

    const rescheduleProposals = useMemo(() => autoReschedule(tasks), [tasks]);

    return {
        dailyScore,
        streak,
        level: gamification.level,
        xp: gamification.xp,
        rescheduleProposals
    };
};
