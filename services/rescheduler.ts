
import { RescheduleProposal, ScheduledBlock, BusySlot } from '../types';
import { addMinutes, buildFreeSlots } from '../utils/dateMath';

export function proposeReschedule(
    taskId: string,
    taskDuration: number,
    taskDeadline: Date,
    currentSchedule: ScheduledBlock[],
    busySlots: BusySlot[],
    now: Date
): RescheduleProposal | null {
    
    // Find current block if any
    const originalBlock = currentSchedule.find(b => b.taskId === taskId);

    // Build free slots ignoring the current block for this task (if we are moving it)
    // effectively we treat the current block's time as free for the move
    // BUT we also have to respect other scheduled blocks as "busy"
    
    // 1. Create effective busy list = External Busy + Other Tasks
    const otherTasksBlocks = currentSchedule
        .filter(b => b.taskId !== taskId)
        .map(b => ({ start: b.start, end: b.end }));
    
    const effectiveBusy = [...busySlots, ...otherTasksBlocks];

    // 2. Find slots in next 7 days
    const horizon = addMinutes(now, 7 * 24 * 60);
    const freeSlots = buildFreeSlots(effectiveBusy, now, horizon);

    // 3. Find first slot that fits
    for (const slot of freeSlots) {
        // Simple heuristic: First fit
        // In real AI, we would optimize for preference, energy levels, etc.
        const diff = (slot.end.getTime() - slot.start.getTime()) / (60 * 1000);
        
        if (diff >= taskDuration) {
            const start = slot.start;
            const end = addMinutes(start, taskDuration);
            
            // Must be before deadline
            if (end <= taskDeadline) {
                // If it's the same start time, skip (not a move)
                if (originalBlock && originalBlock.start.getTime() === start.getTime()) {
                    continue;
                }

                return {
                    taskId,
                    originalSlot: originalBlock,
                    proposedSlot: {
                        id: `prop_${taskId}`,
                        taskId,
                        planId: 'rescheduled', // dummy
                        start,
                        end,
                        assignedDay: start.toISOString().split('T')[0]
                    },
                    reason: "Found earlier available slot to reduce failure risk."
                };
            }
        }
    }

    return null;
}
