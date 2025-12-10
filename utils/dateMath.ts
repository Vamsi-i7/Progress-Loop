
import { BusySlot, ScheduledBlock } from '../types';

export const MILLIS_IN_MIN = 60 * 1000;

export function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * MILLIS_IN_MIN);
}

export function diffMinutes(end: Date, start: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / MILLIS_IN_MIN);
}

export function isOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && bStart < aEnd;
}

// Build free slots by subtracting busy slots from the main window
export function buildFreeSlots(busySlots: BusySlot[], windowStart: Date, windowEnd: Date): BusySlot[] {
    // Sort busy slots by start time
    const sortedBusy = [...busySlots]
        .filter(s => s.end > windowStart && s.start < windowEnd)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    const freeSlots: BusySlot[] = [];
    let currentStart = windowStart;

    for (const busy of sortedBusy) {
        // Gap before this busy slot
        if (currentStart < busy.start) {
            freeSlots.push({ start: currentStart, end: busy.start });
        }
        // Move currentStart past this busy slot if it extends further
        if (busy.end > currentStart) {
            currentStart = busy.end;
        }
    }

    // Gap after last busy slot
    if (currentStart < windowEnd) {
        freeSlots.push({ start: currentStart, end: windowEnd });
    }

    return freeSlots;
}

// Splits a time slot if we take a chunk out of it. 
// Returns remaining slots (could be 0, 1, or 2).
// Assuming we allocate a block [allocStart, allocEnd] strictly inside [slotStart, slotEnd]
export function splitSlot(slot: BusySlot, allocStart: Date, allocEnd: Date): BusySlot[] {
    const result: BusySlot[] = [];
    if (slot.start < allocStart) {
        result.push({ start: slot.start, end: allocStart });
    }
    if (allocEnd < slot.end) {
        result.push({ start: allocEnd, end: slot.end });
    }
    return result;
}
