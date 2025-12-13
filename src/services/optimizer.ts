
import { PlanTask, User, StudyPlan, ScheduledBlock } from '../types';
import { addMinutes, diffMinutes } from '../utils/dateMath';

// Feature 3: Cognitive Load Detection
export const calculateCognitiveLoad = (tasks: PlanTask[], scheduledToday: ScheduledBlock[]): number => {
    // Heuristic: Sum of (duration * difficulty_multiplier) for tasks today
    let load = 0;
    scheduledToday.forEach(block => {
        const task = tasks.find(t => t.id === block.taskId);
        if (task) {
            let multiplier = 1;
            if (task.difficulty === 'hard') multiplier = 1.5;
            if (task.difficulty === 'easy') multiplier = 0.8;
            // Add penalty for tight deadlines
            const isUrgent = task.dueDate && new Date(task.dueDate).getTime() - block.end.getTime() < 24 * 60 * 60 * 1000;
            if (isUrgent) multiplier *= 1.2;
            
            load += (diffMinutes(block.end, block.start) * multiplier);
        }
    });
    // Normalize: Assuming 480 mins (8 hours) is 100% load for a high-schooler/uni student
    return Math.min(100, Math.round((load / 480) * 100));
};

// Feature 5: Cross-Subject Priority Optimizer
export const prioritizeTasks = (tasks: PlanTask[], now: Date): PlanTask[] => {
    return [...tasks].sort((a, b) => {
        // Score = Weightage + Urgency + Difficulty
        // Urgency: closer deadline = higher score
        const getUrgency = (t: PlanTask) => {
            if (!t.dueDate) return 0;
            const hoursLeft = (new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
            return Math.max(0, 100 - hoursLeft); // Cap at 100
        };

        const scoreA = (a.subjectWeightage || 0) * 0.5 + getUrgency(a) + (a.difficulty === 'hard' ? 20 : 0);
        const scoreB = (b.subjectWeightage || 0) * 0.5 + getUrgency(b) + (b.difficulty === 'hard' ? 20 : 0);
        return scoreB - scoreA;
    });
};

// Feature 9 & 14: Task Compression (Survival Mode)
export const compressTasks = (tasks: PlanTask[]): PlanTask[] => {
    return tasks.map(t => ({
        ...t,
        // Compress estimated time by 30% for survival mode, minimum 20 mins
        estimatedMinutes: Math.max(20, Math.floor((t.estimatedMinutes || 60) * 0.7))
    }));
};

// Feature 7: AI-powered Revision Generator
export const generateRevisionTasks = (completedTasks: PlanTask[]): PlanTask[] => {
    // Simple Spaced Repetition: If completed > 3 days ago, add revision
    const revisions: PlanTask[] = [];
    const now = new Date();
    
    completedTasks.forEach(t => {
        // In a real system, we'd check completion timestamp.
        // For demo, we randomly select a few tasks to revise.
        if (Math.random() > 0.8 && !t.isRevision) {
            revisions.push({
                id: `${t.id}_rev_${Date.now()}`,
                title: `Revision: ${t.title}`,
                isCompleted: false,
                estimatedMinutes: 20, // Micro-revision
                dueDate: addMinutes(now, 24 * 60).toISOString(),
                isRevision: true,
                difficulty: t.difficulty,
                subjectWeightage: t.subjectWeightage
            });
        }
    });
    return revisions;
};

// Feature 2: Adaptive Difficulty Planner
export const adjustDifficulty = (tasks: PlanTask[], userHistory: { failedSubjects: string[] }): PlanTask[] => {
    return tasks.map(t => {
        // If user frequently fails this subject, break it down or increase time
        // Since we don't have subject explicit on task, we infer from title or parent plan (passed in context usually)
        // Here we simulate: increase time for hard tasks
        if (t.difficulty === 'hard') {
            return { ...t, estimatedMinutes: Math.floor((t.estimatedMinutes || 60) * 1.1) };
        }
        return t;
    });
};

// Feature 8: Focus Mode & Distraction Prediction
export const applyFocusMode = (tasks: PlanTask[]): PlanTask[] => {
    // If a task is > 90 mins, break it into chunks
    const result: PlanTask[] = [];
    tasks.forEach(t => {
        if ((t.estimatedMinutes || 0) > 90) {
            const chunks = Math.ceil((t.estimatedMinutes || 90) / 45);
            for (let i = 0; i < chunks; i++) {
                result.push({
                    ...t,
                    id: `${t.id}_chunk_${i}`,
                    title: `${t.title} (Part ${i + 1})`,
                    estimatedMinutes: 45
                });
            }
        } else {
            result.push(t);
        }
    });
    return result;
};
