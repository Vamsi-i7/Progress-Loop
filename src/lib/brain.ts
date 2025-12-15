import {
    isSameDay,
    subDays,
    parseISO,
    differenceInCalendarDays,
    addDays,
    isAfter,
    isBefore,
    startOfDay
} from 'date-fns';
import { Task, Habit, HabitLog } from '../types';

/**
 * A. The "Weighted Efficiency" Algorithm
 * DailyScore = (Sum of Completed Habits * HabitWeight) + (Sum of Completed Tasks * PriorityMultiplier)
 */
export const calculateDailyScore = (
    tasks: Task[],
    habits: Habit[],
    habitLogs: HabitLog[],
    date: Date = new Date()
): number => {
    // 1. Habit Score
    let habitScore = 0;
    habits.forEach(habit => {
        const log = habitLogs.find(l =>
            l.habit_id === habit.id &&
            isSameDay(parseISO(l.date), date) &&
            l.status
        );
        if (log) {
            habitScore += (habit.weight || 1);
        }
    });

    // 2. Task Score (Tasks completed today)
    // Note: In a real app we'd look for a 'completedAt' timestamp. 
    // Here we use 'status' === 'Done'. If we want "Daily" score, we must know WHEN it was done.
    // For this heuristic, we'll assume if it's done and do_date/due_date is today, it counts.
    let taskScore = 0;
    const tasksDoneToday = tasks.filter(t =>
        t.status === 'Done' &&
        (
            (t.do_date && isSameDay(parseISO(t.do_date), date)) ||
            (t.due_date && isSameDay(parseISO(t.due_date), date))
        )
    );

    tasksDoneToday.forEach(t => {
        const multiplier = t.priority === 'High' ? 3 : t.priority === 'Medium' ? 2 : 1;
        taskScore += multiplier;
    });

    return habitScore + taskScore;
};

/**
 * B. The "Iron Streak" Calculator
 * Distinct count of consecutive days with at least one completed habit.
 */
export const calculateStreak = (logs: HabitLog[]): number => {
    if (!logs || logs.length === 0) return 0;

    // Get unique dates where at least one habit was completed
    const completedDates = Array.from(new Set(
        logs
            .filter(l => l.status)
            .map(l => startOfDay(parseISO(l.date)).getTime())
    )).sort((a, b) => b - a); // Descending

    if (completedDates.length === 0) return 0;

    const today = startOfDay(new Date()).getTime();
    const yesterday = startOfDay(subDays(new Date(), 1)).getTime();
    const latestLogDate = completedDates[0];

    // If no log today OR yesterday, streak is broken -> 0
    if (latestLogDate !== today && latestLogDate !== yesterday) {
        return 0;
    }

    let currentStreak = 1;
    let currentDate = latestLogDate;

    for (let i = 1; i < completedDates.length; i++) {
        const prevDate = completedDates[i];
        const diff = differenceInCalendarDays(currentDate, prevDate);

        if (diff === 1) {
            currentStreak++;
            currentDate = prevDate;
        } else {
            break; // Streak broken
        }
    }

    return currentStreak;
};

/**
 * C. The "Auto-Reschedule" Heuristic
 * Identify missed tasks and move them to next viable slot (< 180 mins load).
 */
export const autoReschedule = (tasks: Task[]): { taskId: string, newDate: string }[] => {
    const now = new Date();
    const proposals: { taskId: string, newDate: string }[] = [];

    // 1. Find Missed Tasks
    const missedTasks = tasks.filter(t =>
        t.status !== 'Done' &&
        isBefore(parseISO(t.due_date), startOfDay(now))
    );

    if (missedTasks.length === 0) return [];

    // 2. Simulate Schedule Load per Day
    // Map: 'YYYY-MM-DD' -> totalMinutes
    const scheduleLoad = new Map<string, number>();

    // Populate existing load
    tasks.forEach(t => {
        if (t.status !== 'Done' && !isBefore(parseISO(t.due_date), startOfDay(now))) {
            const dateKey = startOfDay(parseISO(t.due_date)).toISOString();
            scheduleLoad.set(dateKey, (scheduleLoad.get(dateKey) || 0) + (t.estimated_minutes || 0));
        }
    });

    // 3. Find slots
    let searchDate = addDays(now, 1); // Start looking from tomorrow

    missedTasks.forEach(task => {
        let found = false;
        let attempts = 0;

        while (!found && attempts < 30) { // Look ahead 30 days max
            const dateKey = startOfDay(searchDate).toISOString();
            const currentLoad = scheduleLoad.get(dateKey) || 0;
            const taskLoad = task.estimated_minutes || 30;

            if (currentLoad + taskLoad <= 180) {
                // Viable Slot
                proposals.push({
                    taskId: task.id,
                    newDate: searchDate.toISOString()
                });
                // Update load map
                scheduleLoad.set(dateKey, currentLoad + taskLoad);
                found = true;
            } else {
                // Next day
                searchDate = addDays(searchDate, 1);
            }
            attempts++;
        }
    });

    return proposals;
};

/**
 * D. The XP/Leveling System
 * Total XP = (Total Tasks Done * 50) + (Total Habits Done * 10)
 * Level = Floor(Total XP / 1000) + 1
 */
export const calculateGamification = (tasks: Task[], habitLogs: HabitLog[]): { xp: number, level: number } => {
    const tasksDoneCount = tasks.filter(t => t.status === 'Done').length;
    const habitsDoneCount = habitLogs.filter(l => l.status).length; // Total individual habit completions

    const xp = (tasksDoneCount * 50) + (habitsDoneCount * 10);
    const level = Math.floor(xp / 1000) + 1;

    return { xp, level };
};

// --- Test Case (Commented) ---
/*
 * Test for Streak Logic:
 * Logs: [Today (True), Yesterday (True), 2 Days Ago (True), 4 Days Ago (True)]
 * Expected: 3 (Day 4 breaks it)
 * 
 * Logs: [Yesterday (True), 2 Days Ago (True)] -> User inactive today.
 * Expected: 2 (Streak maintained because yesterday was active)
 * 
 * Logs: [2 Days Ago (True)] -> User inactive today and yesterday.
 * Expected: 0 (Reset)
 */
