
import React from 'react';
import { PeerGroup } from '../types';
import { X, Shield, Crown, UserMinus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MockBackend } from '../services/MockBackend';

interface Props {
    group: PeerGroup;
    onClose: () => void;
}

const GroupMembersPanel: React.FC<Props> = ({ group, onClose }) => {
    const { user, refreshData } = useStore();
    const isAdmin = group.members.find(m => m.userId === user.id)?.role === 'admin' || group.members.find(m => m.userId === user.id)?.role === 'owner';

    const handleRemove = (userId: string) => {
        if (window.confirm('Remove this member?')) {
            MockBackend.removeGroupMember(group.id, userId);
            refreshData();
        }
    };

    return (
        <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Members ({group.members.length})</h3>
                <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {group.members.map(member => (
                    <div key={member.userId} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {member.name ? member.name[0] : '?'}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                    member.status === 'online' ? 'bg-green-500' : 
                                    member.status === 'studying' ? 'bg-indigo-500' : 'bg-slate-400'
                                }`}></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                                    {member.role === 'owner' && <Crown size={10} className="text-amber-500"/>}
                                    {member.role === 'admin' && <Shield size={10} className="text-blue-500"/>}
                                    {member.role}
                                </p>
                            </div>
                        </div>
                        {isAdmin && member.userId !== user.id && (
                            <button onClick={() => handleRemove(member.userId)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <UserMinus size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupMembersPanel;
