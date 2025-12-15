import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Task } from '../types';

export const useTasks = () => {
    const queryClient = useQueryClient();

    const { data: tasks = [], isLoading, error } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => api.getTasks(),
    });

    const createTaskMutation = useMutation({
        mutationFn: (newTask: Partial<Task>) => api.createTask(newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
            api.updateTask(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => api.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    return {
        tasks,
        isLoading,
        error,
        createTask: createTaskMutation.mutate,
        updateTask: updateTaskMutation.mutate,
        deleteTask: deleteTaskMutation.mutate,
        isCreating: createTaskMutation.isPending,
        isUpdating: updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending
    };
};
