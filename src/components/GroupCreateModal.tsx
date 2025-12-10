
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { X, Users } from 'lucide-react';
import { MockBackend } from '../services/MockBackend';

interface Props {
    onClose: () => void;
    onSuccess: (groupId: string) => void;
}

const GroupCreateModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const { themeColor, refreshData } = useStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allowInvites, setAllowInvites] = useState(true);
    const [requireApproval, setRequireApproval] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const group = MockBackend.createGroup(name, description, { allowInvites, requireApproval });
        refreshData();
        onSuccess(group.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users size={20} className={getColorClass(themeColor, 'text')} /> Create Group
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Group Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white" placeholder="e.g. Physics Squad" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white resize-none h-24" placeholder="What's this group about?" />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={allowInvites} onChange={e => setAllowInvites(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Allow members to invite others</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={requireApproval} onChange={e => setRequireApproval(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Require admin approval to join</span>
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                        <button type="submit" className={`flex-1 py-3 rounded-xl font-bold text-white ${getColorClass(themeColor, 'bg')}`}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroupCreateModal;
