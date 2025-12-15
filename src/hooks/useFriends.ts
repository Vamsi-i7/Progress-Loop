import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useFriends = () => {
    const queryClient = useQueryClient();

    const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
        queryKey: ['friends'],
        queryFn: () => api.getFriends(),
    });

    const sendRequestMutation = useMutation({
        mutationFn: (userId: string) => api.sendFriendRequest(userId),
        onSuccess: () => {
            // Invalidate sent requests if we had a query for that
        },
    });

    return {
        friends,
        isLoading: isLoadingFriends,
        sendFriendRequest: sendRequestMutation.mutate
    };
};
