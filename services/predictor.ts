
import { RiskReport, PlanTask, ScheduledBlock, User } from '../types';
import { diffMinutes } from '../utils/dateMath';

// Simulated weights for Logistic Regression
// z = w0 + w1*urgency + w2*streak + w3*complexity
const W0 = -2.0;
const W_URGENCY = 2.5; 
const W_SLACK = -0.8;
const W_STREAK = -0.1; 
const W_EFFORT = 0.01; 

/**
 * Computes risk metrics for tasks based on user history and current schedule.
 */
export function computeRiskMetrics(
    user: User,
    tasks: PlanTask[],
    schedule: ScheduledBlock[],
    now: Date
): Record<string, RiskReport> {
    const report: Record<string, RiskReport> = {};

    tasks.forEach(task => {
        if (task.isCompleted || !task.estimatedMinutes || !task.dueDate) return;

        const deadline = new Date(task.dueDate);
        const effort = task.estimatedMinutes;
        
        // Feature 1: Slack Ratio
        const minutesToDeadline = Math.max(1, diffMinutes(deadline, now));
        const slackRatio = minutesToDeadline / effort;

        // Feature 2: Streak
        const streak = user.streak;

        // Feature 3: Is Scheduled?
        const isScheduled = schedule.some(b => b.taskId === task.id);
        const schedulePenalty = isScheduled ? 0 : 2.0; // Big penalty if not scheduled

        // Logit calculation
        const z = W0 + (W_SLACK * slackRatio) + (W_STREAK * streak) + (W_EFFORT * effort) + schedulePenalty;

        // Sigmoid function
        const pMiss = 1 / (1 + Math.exp(-z));

        // Determine Level
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (pMiss > 0.7) riskLevel = 'high';
        else if (pMiss > 0.4) riskLevel = 'medium';

        // Gen reasons
        const reasons: string[] = [];
        if (!isScheduled) reasons.push("No time slot found");
        if (slackRatio < 2.0) reasons.push("Tight deadline");
        if (streak < 3) reasons.push("Low activity streak");
        if (effort > 120) reasons.push("High effort task");

        report[task.id] = {
            taskId: task.id,
            pMiss,
            riskLevel,
            reasons
        };
    });

    return report;
}

// Feature 6: Learning Outcome Prediction
export function predictLearningOutcome(user: User, tasks: PlanTask[], completedTasks: number): { score: number, gap: number } {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return { score: 100, gap: 0 };
    
    // Heuristic: Base score on completion rate + consistency (streak) + difficulty factor
    const completionRate = completedTasks / totalTasks;
    const streakFactor = Math.min(1.2, 1 + (user.streak / 30)); // Max 20% boost for streak
    
    let rawScore = (completionRate * 100) * streakFactor;
    
    // Adjust for difficulty of remaining tasks
    const remainingTasks = tasks.filter(t => !t.isCompleted);
    const hardRemaining = remainingTasks.filter(t => t.difficulty === 'hard').length;
    rawScore -= (hardRemaining * 2); // Penalty for hard pending tasks

    const predictedScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    
    // Effort gap: how many hours needed to reach 95%
    const desiredScore = 95;
    const gapScore = Math.max(0, desiredScore - predictedScore);
    const gapHours = Math.ceil(gapScore * 0.5); // Assume 1 score point ~= 0.5 hours study

    return { score: predictedScore, gap: gapHours };
}
