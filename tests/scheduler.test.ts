
import { scheduleTasks } from '../services/scheduler';
import { StudyPlan, BusySlot } from '../types';
import { addMinutes } from '../utils/dateMath';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;

// Mock Test Suite
describe('Scheduler', () => {
    it('should schedule a single task in a free slot', () => {
        const now = new Date('2023-10-01T08:00:00Z');
        const horizon = addMinutes(now, 24*60);
        
        const plans: StudyPlan[] = [{
            id: 'p1', title: 'Test Plan', subject: 'Test', startDate: '2023-10-01', endDate: '2023-10-02', priority: 'high',
            tasks: [{
                id: 't1', title: 'Task 1', isCompleted: false, estimatedMinutes: 60, dueDate: addMinutes(now, 120).toISOString()
            }]
        }];
        
        const busySlots: BusySlot[] = []; // No busy slots
        
        const schedule = scheduleTasks(plans, busySlots, now, horizon);
        
        // Should find slot at 08:00
        if (schedule.length !== 1) throw new Error("Scheduled length mismatch");
        if (schedule[0].start.getTime() !== now.getTime()) throw new Error("Start time mismatch");
    });

    it('should respect busy slots', () => {
        const now = new Date('2023-10-01T08:00:00Z');
        const horizon = addMinutes(now, 24*60);
        
        // Busy from 08:00 to 09:00
        const busySlots: BusySlot[] = [{
            start: now,
            end: addMinutes(now, 60),
            title: 'Busy'
        }];
        
        const plans: StudyPlan[] = [{
            id: 'p1', title: 'Test Plan', subject: 'Test', startDate: '2023-10-01', endDate: '2023-10-02', priority: 'high',
            tasks: [{
                id: 't1', title: 'Task 1', isCompleted: false, estimatedMinutes: 60, dueDate: addMinutes(now, 300).toISOString()
            }]
        }];
        
        const schedule = scheduleTasks(plans, busySlots, now, horizon);
        
        // Should find slot at 09:00 (after busy)
        if (schedule.length !== 1) throw new Error("Scheduled length mismatch");
        if (schedule[0].start.getTime() !== addMinutes(now, 60).getTime()) throw new Error("Start time mismatch, ignored busy slot");
    });
});
