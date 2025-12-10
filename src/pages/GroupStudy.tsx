
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Users, Send, Plus, MoreVertical, MessageSquare, Bot, UserPlus, X, Paperclip, Clock, Share2 } from 'lucide-react';
import { MockBackend } from '../services/MockBackend';
import { PeerGroup } from '../types';
import ChatMessageItem from '../components/ChatMessage';
import GroupCreateModal from '../components/GroupCreateModal';
import InviteModal from '../components/InviteModal';
import GroupMembersPanel from '../components/GroupMembersPanel';
import GroupFilesPanel from '../components/GroupFilesPanel';
import TypingIndicator from '../components/GroupStudy/TypingIndicator';

const GroupStudy: React.FC = () => {
    const { peerGroups, themeColor, user, refreshData } = useStore();
    const [selectedGroup, setSelectedGroup] = useState<PeerGroup | null>(null);
    const [message, setMessage] = useState('');
    
    // Modals & Panels State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const [showFilesPanel, setShowFilesPanel] = useState(false);
    
    const [isTyping, setIsTyping] = useState(false); // Mock typing
    const scrollRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Handle Invite Link
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const inviteToken = params.get('invite');
        if (inviteToken) {
            try {
                // Attempt to accept invite
                MockBackend.acceptInvite(inviteToken);
                refreshData(); // Refresh to see the new group
                alert("Successfully joined the group!");
                // Clear the invite param
                navigate('/group', { replace: true });
                
                // Auto-select the joined group (heuristic: last one or find via backend if it returned ID)
                // For now, refreshData happens async effectively in React state terms, 
                // so we rely on the user seeing it in the list.
            } catch (e: any) {
                console.error("Join Error:", e);
                // If error is "User already in group", that's fine, just navigate
                if (e.message !== "Invite expired" && e.message !== "Invalid or expired invite") {
                     navigate('/group', { replace: true });
                } else {
                    alert(e.message || "Failed to join group");
                }
            }
        }
    }, [location.search, navigate, refreshData]);

    // Auto-refresh logic for chat (polling mock)
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        
        if (selectedGroup) {
            unsubscribe = MockBackend.subscribeToGroup(selectedGroup.id, (updatedGroup) => {
                setSelectedGroup(updatedGroup);
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [selectedGroup?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedGroup?.messages, isTyping]);

    const handleCreateSuccess = (groupId: string) => {
        const group = peerGroups.find(g => g.id === groupId);
        // We need to fetch freshly because peerGroups prop might not be updated yet
        // But since we called refreshData in Modal, it triggers re-render of this component
        // Ideally we set it after a timeout or rely on finding it in the next render cycle.
        // For mock, we can fetch directly.
        const freshGroups = MockBackend.getGroups();
        const newGroup = freshGroups.find(g => g.id === groupId);
        if (newGroup) setSelectedGroup(newGroup);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedGroup) return;
        
        MockBackend.sendGroupMessage(selectedGroup.id, message);
        setMessage('');
        
        // Mock AI typing if mentioned
        if (message.toLowerCase().includes('@ai')) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000); // AI "types" for 2 sec
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col h-screen">
            <Header title="Group Study" subtitle="Collaborate with peers" />
            
            <div className="flex flex-1 overflow-hidden p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full relative">
                
                {/* Sidebar: Group List */}
                <div className={`w-full md:w-80 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Your Groups</h3>
                        <button onClick={() => setShowCreateModal(true)} className={`p-2 rounded-xl text-white shadow-lg ${getColorClass(themeColor, 'bg')} hover:opacity-90`}>
                            <Plus size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {peerGroups.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Users size={48} className="mx-auto mb-2 opacity-20"/>
                                <p className="text-sm">No groups yet.</p>
                                <button onClick={() => setShowCreateModal(true)} className={`text-sm font-bold mt-2 hover:underline ${getColorClass(themeColor, 'text')}`}>Create One</button>
                            </div>
                        ) : (
                            peerGroups.map(group => (
                                <div 
                                    key={group.id}
                                    onClick={() => { setSelectedGroup(group); setShowMembersPanel(false); setShowFilesPanel(false); }}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border border-transparent ${selectedGroup?.id === group.id ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{group.name}</h4>
                                        <span className="text-[10px] text-slate-400">{group.members.length} peers</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{group.description || 'No description'}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                {selectedGroup ? (
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative">
                        {/* Chat Header */}
                        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowMembersPanel(!showMembersPanel)}>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedGroup(null); }} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X size={20} className="text-slate-500"/>
                                </button>
                                <div className={`w-12 h-12 rounded-2xl ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white`}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{selectedGroup.name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        {selectedGroup.members.length} members <span className="w-1 h-1 rounded-full bg-slate-300"></span> Tap for info
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowInviteModal(true)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Invite">
                                    <UserPlus size={20} />
                                </button>
                                <button onClick={() => setShowFilesPanel(!showFilesPanel)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Files">
                                    <Paperclip size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50" ref={scrollRef}>
                            <div className="text-center py-6">
                                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">Group created {new Date(selectedGroup.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            {(!selectedGroup.messages || selectedGroup.messages.length === 0) && (
                                <div className="text-center py-10 text-slate-400">
                                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No messages yet. Start the conversation!</p>
                                    <p className="text-xs mt-2">Tip: Tag @AI to ask for help.</p>
                                </div>
                            )}

                            {selectedGroup.messages?.map((msg) => (
                                <ChatMessageItem key={msg.id} msg={msg} isMe={msg.senderId === user.id} />
                            ))}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 ml-4 animate-pulse">
                                    <Bot size={14} /> AI is thinking...
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                            <button type="button" onClick={() => setShowFilesPanel(true)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" title="Attach File">
                                <Paperclip size={20}/>
                            </button>
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message... (Tag @AI for help)"
                                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-4 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
                                    <MessageSquare size={18} className="text-slate-400" />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={!message.trim()}
                                className={`p-3.5 rounded-xl text-white transition-all ${message.trim() ? `${getColorClass(themeColor, 'bg')} shadow-lg hover:scale-105` : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}`}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="text-center max-w-sm">
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                <Users size={32} className="text-indigo-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Group</h3>
                            <p className="text-slate-500 mb-8">Choose a study group from the sidebar or create a new one to start collaborating.</p>
                            <button onClick={() => setShowCreateModal(true)} className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg ${getColorClass(themeColor, 'bg')}`}>
                                Create New Group
                            </button>
                        </div>
                    </div>
                )}

                {/* Right Panels */}
                {selectedGroup && showMembersPanel && (
                    <GroupMembersPanel group={selectedGroup} onClose={() => setShowMembersPanel(false)} />
                )}
                {selectedGroup && showFilesPanel && (
                    <GroupFilesPanel group={selectedGroup} onClose={() => setShowFilesPanel(false)} />
                )}

            </div>

            {/* Modals */}
            {showCreateModal && (
                <GroupCreateModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
            )}
            {showInviteModal && selectedGroup && (
                <InviteModal groupId={selectedGroup.id} onClose={() => setShowInviteModal(false)} />
            )}
        </div>
    );
};

export default GroupStudy;
