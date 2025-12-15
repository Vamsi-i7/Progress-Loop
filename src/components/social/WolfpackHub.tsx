import React from 'react';
import { clsx } from 'clsx';
import { useFriends } from '../../hooks/useFriends';
import { useStore } from '../../context/StoreContext';

const WolfpackHub: React.FC = () => {
    const { friends, isLoading } = useFriends();
    const { user } = useStore();

    // Transform backend friends to leaderboard format
    // backend friend object structure needs to be known. 
    // Assuming api.getFriends() returns array of User objects with xp_points.
    // If endpoints return simple list, we might need to map it.
    // Let's assume friends is User[].

    // Add "Me" to the list for comparison
    const allUsers = [...friends];
    if (user && !allUsers.find(u => u.id === user.id)) {
        // Only if user object has gamification fields
        allUsers.push(user);
    }

    const sortedUsers = allUsers.sort((a: any, b: any) => (b.xp_points || 0) - (a.xp_points || 0));

    const isOnline = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        return diff < 15 * 60 * 1000; // 15 mins
    };

    if (isLoading) return <div className="p-6 text-center text-slate-500">Loading Wolfpack...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Wolfpack Leaderboard</h3>
            <div className="space-y-3">
                {sortedUsers.map((friend: any, index) => {
                    const rank = index + 1;
                    const online = isOnline(friend.lastActiveDate);
                    const isMe = friend.id === user?.id;

                    return (
                        <div
                            key={friend.id}
                            className={clsx(
                                "flex items-center justify-between p-3 rounded-xl border transition-all",
                                isMe
                                    ? "bg-yellow-50 border-yellow-200 shadow-sm"
                                    : "bg-white border-slate-100 hover:bg-slate-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                    rank === 1 ? "bg-yellow-100 text-yellow-700" :
                                        rank === 2 ? "bg-gray-100 text-gray-700" :
                                            rank === 3 ? "bg-orange-100 text-orange-700" : "text-slate-400"
                                )}>
                                    {rank}
                                </div>

                                <div className="relative">
                                    <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                                        {friend.avatar ? <img src={friend.avatar} alt={friend.name} /> : <span className="text-xs font-bold text-slate-500">{friend.name?.[0]}</span>}
                                    </div>
                                    {online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                        {friend.name}
                                        {isMe && <span className="text-[10px] text-slate-400 font-normal">(Me)</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Level {friend.level || 1}
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm font-bold text-indigo-600">
                                {friend.xp_points || friend.xp || 0} XP
                            </div>
                        </div>
                    );
                })}

                {sortedUsers.length === 0 && (
                    <div className="text-center text-sm text-slate-400 py-4">
                        No friends yet. Invite your pack!
                    </div>
                )}
            </div>
        </div>
    );
};

export default WolfpackHub;
