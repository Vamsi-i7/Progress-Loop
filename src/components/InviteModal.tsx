
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { X, Mail, Link as LinkIcon, Check, Search, UserPlus } from 'lucide-react';
import { MockBackend } from '../services/MockBackend';

interface Props {
    groupId: string;
    onClose: () => void;
}

const InviteModal: React.FC<Props> = ({ groupId, onClose }) => {
    const { themeColor } = useStore();
    const [mode, setMode] = useState<'email' | 'search'>('email');
    const [email, setEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [inviteLink, setInviteLink] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const token = await MockBackend.inviteToGroup(groupId, email);
            setInviteLink(`${window.location.origin}/#/study/group?invite=${token}`);
            setStatus('sent');
        } catch (e) {
            console.error(e);
            setStatus('idle');
        }
    };

    const handleSearch = (q: string) => {
        setSearchQuery(q);
        if (q.length > 1) {
            setSearchResults(MockBackend.searchUsers(q));
        } else {
            setSearchResults([]);
        }
    };

    const handleAddUser = async (userId: string) => {
        await MockBackend.inviteToGroup(groupId, userId, true);
        alert("User added directly!");
        onClose();
    };

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert('Copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Invite Friends</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>

                <div className="flex gap-2 mb-6">
                    <button onClick={() => setMode('email')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${mode === 'email' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>By Email</button>
                    <button onClick={() => setMode('search')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${mode === 'search' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>Find User</button>
                </div>

                {mode === 'email' && (
                    status === 'sent' ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Invite Sent!</h4>
                            <p className="text-slate-500 text-sm mb-6">We've sent an email to {email}.</p>
                            
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700">
                                <span className="text-xs text-slate-500 truncate flex-1">{inviteLink}</span>
                                <button onClick={copyLink} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"><LinkIcon size={16}/></button>
                            </div>
                            
                            <button onClick={onClose} className="mt-6 text-sm font-bold text-slate-500 hover:underline">Close</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-4">
                            <p className="text-sm text-slate-500 mb-2">Enter an email address to send an invitation.</p>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white" 
                                    placeholder="friend@example.com" 
                                />
                            </div>
                            <button disabled={status === 'sending'} type="submit" className={`w-full py-3 rounded-xl font-bold text-white ${getColorClass(themeColor, 'bg')}`}>
                                {status === 'sending' ? 'Sending...' : 'Send Invite'}
                            </button>
                        </form>
                    )
                )}

                {mode === 'search' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={e => handleSearch(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white" 
                                placeholder="Search by username..." 
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {searchResults.length === 0 && searchQuery.length > 1 && (
                                <p className="text-center text-slate-400 text-sm py-4">No users found.</p>
                            )}
                            {searchResults.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{u.name[0]}</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-xs text-slate-500">@{u.username}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleAddUser(u.id)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg">
                                        <UserPlus size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InviteModal;
