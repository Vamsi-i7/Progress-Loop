
import { PlanTask, StudyPlan, BusySlot, ScheduledBlock } from '../types';
import { addMinutes, buildFreeSlots, diffMinutes, splitSlot } from '../utils/dateMath';

// Intermediate type for internal use
interface SchedulableTask extends PlanTask {
    planId: string;
    deadline: Date;
    effortsRemaining: number;
    urgencyScore: number;
}

/**
 * Schedules tasks into free slots using a deterministic greedy approach based on urgency.
 * Urgency Score = (Time Until Deadline) / Estimated Effort. Lower is more urgent.
 */
export function scheduleTasks(
    plans: StudyPlan[],
    busySlots: BusySlot[],
    now: Date,
    horizonEnd: Date
): ScheduledBlock[] {
    // 1. Flatten tasks and filter eligible ones
    const tasks: SchedulableTask[] = [];
    
    plans.forEach(plan => {
        plan.tasks.forEach(task => {
            if (!task.isCompleted && task.estimatedMinutes && task.dueDate) {
                const deadline = new Date(task.dueDate);
                if (deadline > now) {
                    const timeUntilDeadline = diffMinutes(deadline, now);
                    // Avoid division by zero
                    const effort = Math.max(task.estimatedMinutes, 1);
                    const urgencyScore = timeUntilDeadline / effort;
                    
                    tasks.push({
                        ...task,
                        planId: plan.id,
                        deadline,
                        effortsRemaining: effort,
                        urgencyScore
                    });
                }
            }
        });
    });

    // 2. Sort by Urgency (Ascending)
    // Deterministic tie-breaking using ID
    tasks.sort((a, b) => {
        if (Math.abs(a.urgencyScore - b.urgencyScore) > 0.1) {
            return a.urgencyScore - b.urgencyScore;
        }
        return a.id.localeCompare(b.id);
    });

    // 3. Initialize Free Slots
    let freeSlots = buildFreeSlots(busySlots, now, horizonEnd);
    const scheduledBlocks: ScheduledBlock[] = [];

    // 4. Allocation Loop
    for (const task of tasks) {
        let needed = task.effortsRemaining;

        // Try to fit needed time into free slots
        // We look for the EARLIEST slot that fits or partial fit
        // For simplicity in this demo, we do contiguous allocation if possible, 
        // or split if the task is large (not implemented here for simplicity, assuming atomic tasks for demo)
        
        // Find best slot: First slot that can hold the task entirely or substantial part
        // Heuristic: Just take the first available slot that fits.
        
        for (let i = 0; i < freeSlots.length; i++) {
            const slot = freeSlots[i];
            const slotDuration = diffMinutes(slot.end, slot.start);
            
            if (slotDuration >= needed) {
                // Perfect fit or room to spare
                const start = slot.start;
                const end = addMinutes(start, needed);
                
                // Check if this allocation is before deadline
                if (end <= task.deadline) {
                    scheduledBlocks.push({
                        id: `blk_${task.id}_${Date.now()}_${Math.random()}`,
                        taskId: task.id,
                        planId: task.planId,
                        start,
                        end,
                        assignedDay: start.toISOString().split('T')[0]
                    });

                    // Update slots: Remove used portion
                    const newSlots = splitSlot(slot, start, end);
                    freeSlots.splice(i, 1, ...newSlots); // Replace used slot with fragments
                    needed = 0;
                    break; 
                }
            }
        }
        
        // If needed > 0 here, we failed to schedule this task fully before horizon or due to fragmentation
    }

    return scheduledBlocks;
}
