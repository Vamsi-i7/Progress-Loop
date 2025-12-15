import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Habit, HabitLog } from '../types';

export const useHabits = () => {
    const queryClient = useQueryClient();

    const { data: habits = [], isLoading: isLoadingHabits, error: habitsError } = useQuery({
        queryKey: ['habits'],
        queryFn: () => api.getHabits(),
    });

    const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
        queryKey: ['habitLogs'],
        queryFn: () => api.getHabitLogs(),
    });

    const createHabitMutation = useMutation({
        mutationFn: (newHabit: Partial<Habit>) => api.createHabit(newHabit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        },
    });

    const logHabitMutation = useMutation({
        mutationFn: ({ habitId, date, status }: { habitId: string, date: string, status: boolean }) =>
            api.logHabit(habitId, date, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habitLogs'] });
            // Optionally invalidate 'habits' if streaks are returned there, but usually they are calculated
        },
    });

    return {
        habits,
        logs,
        isLoading: isLoadingHabits || isLoadingLogs,
        error: habitsError,
        createHabit: createHabitMutation.mutate,
        logHabit: logHabitMutation.mutate,
    };
};
