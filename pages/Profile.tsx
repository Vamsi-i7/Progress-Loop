
import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Mail, Calendar, Edit2, BadgeCheck, Receipt, Download } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, themeColor, recentTransactions } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Header title="Profile" subtitle="Manage your profile and view your stats" />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-32 ${getColorClass(themeColor, 'bg')} opacity-10`}></div>
               
               <div className="relative z-10">
                 <div className={`w-32 h-32 mx-auto rounded-full ${getColorClass(themeColor, 'bg')} p-1 mb-6`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-700 dark:text-white">
                       {user.name.substring(0, 2).toUpperCase()}
                    </div>
                 </div>
                 
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
                 <p className={`text-sm font-medium ${getColorClass(themeColor, 'text')} mb-6`}>@{user.username}</p>
                 
                 <div className="flex justify-center gap-3 mb-8">
                   <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">{user.plan} Plan</span>
                   <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1"><BadgeCheck size={14}/> Verified</span>
                 </div>

                 <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <Mail size={18} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.email}</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <Calendar size={18} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Joined</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.joinedDate}</p>
                      </div>
                    </div>
                 </div>
                 
                 <button className="mt-8 w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                   <Edit2 size={16} /> Edit Profile
                 </button>
               </div>
            </div>
          </div>

          {/* Details & History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" defaultValue={user.name} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                  <input type="text" defaultValue={user.username} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" />
                </div>
              </div>

               <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input type="email" defaultValue={user.email} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white" />
               </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                  <textarea rows={4} defaultValue="Student majoring in Computer Science. Focused on improving productivity and learning new languages." className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white resize-none"></textarea>
               </div>

               <div className="flex justify-end gap-4">
                 <button className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                 <button className={`${getColorClass(themeColor, 'bg')} ${getColorClass(themeColor, 'hover')} text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all`}>Save Changes</button>
               </div>
            </div>

            {/* Transaction History - Strict Data Accounting Display */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt size={24} className="text-slate-400"/> Billing History
                  </h3>
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">View All</button>
               </div>
               
               {recentTransactions.length > 0 ? (
                   <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                   <th className="py-4 px-2">Date</th>
                                   <th className="py-4 px-2">Description</th>
                                   <th className="py-4 px-2">Amount</th>
                                   <th className="py-4 px-2">Status</th>
                                   <th className="py-4 px-2 text-right">Invoice</th>
                               </tr>
                           </thead>
                           <tbody className="text-sm">
                               {recentTransactions.map((tx) => (
                                   <tr key={tx.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                       <td className="py-4 px-2 text-slate-500">{tx.date}</td>
                                       <td className="py-4 px-2 font-medium text-slate-900 dark:text-white capitalize">{tx.plan} Plan Subscription</td>
                                       <td className="py-4 px-2 font-bold text-slate-900 dark:text-white">{tx.currency} {tx.amount}</td>
                                       <td className="py-4 px-2">
                                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                               tx.status === 'success' ? 'bg-green-100 text-green-600' : 
                                               tx.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                                           }`}>
                                               {tx.status}
                                           </span>
                                       </td>
                                       <td className="py-4 px-2 text-right">
                                           <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                               <Download size={16} />
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               ) : (
                   <div className="text-center py-8 text-slate-400 italic">No transactions found.</div>
               )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
