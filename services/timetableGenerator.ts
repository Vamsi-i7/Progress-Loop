
import { Node, ScheduledBlock, BusySlot } from '../types';
import { addMinutes, buildFreeSlots, diffMinutes, splitSlot } from '../utils/dateMath';

export const generateTimetable = (
    nodes: Node[], 
    busySlots: BusySlot[], 
    startDate: Date = new Date()
): ScheduledBlock[] => {
    const horizon = addMinutes(startDate, 30 * 24 * 60); // Plan for 30 days
    let freeSlots = buildFreeSlots(busySlots, startDate, horizon);
    const schedule: ScheduledBlock[] = [];

    // Filter only leaf nodes or topics that need studying
    const studyNodes = nodes.filter(n => n.estimatedMinutes && n.estimatedMinutes > 0);

    for (const node of studyNodes) {
        let remainingMinutes = node.estimatedMinutes || 60;
        
        while (remainingMinutes > 0) {
            const chunkDuration = Math.min(remainingMinutes, 60);
            
            // Find slot
            let scheduled = false;
            for (let i = 0; i < freeSlots.length; i++) {
                const slot = freeSlots[i];
                const slotDuration = diffMinutes(slot.end, slot.start);
                
                if (slotDuration >= chunkDuration) {
                    const start = slot.start;
                    const end = addMinutes(start, chunkDuration);
                    
                    // Simple Daily Cognitive Load Cap check
                    const dayStr = start.toISOString().split('T')[0];
                    const dailyHours = schedule
                        .filter(b => b.assignedDay === dayStr)
                        .reduce((acc, curr) => acc + (diffMinutes(curr.end, curr.start)/60), 0);
                    
                    if (dailyHours > 6) {
                        continue; 
                    }

                    schedule.push({
                        id: `block_${node.id}_${Date.now()}_${Math.random()}`,
                        nodeId: node.id,
                        taskId: node.id, 
                        planId: 'roadmap',
                        start,
                        end,
                        assignedDay: dayStr
                    });

                    const newSlots = splitSlot(slot, start, end);
                    freeSlots.splice(i, 1, ...newSlots);
                    remainingMinutes -= chunkDuration;
                    scheduled = true;
                    break;
                }
            }

            if (!scheduled) break; 
        }
    }

    return schedule;
};
