import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Search, ChevronDown, ChevronUp, Mail, MessageCircle, HelpCircle, FileText } from 'lucide-react';

const Support: React.FC = () => {
  const { themeColor } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I reset my stats?",
      a: "Currently, you can manually delete goals to remove them. To completely reset your account level and XP, please contact our support team."
    },
    {
      q: "Can I sync across devices?",
      a: "Yes! As long as you log in with the same email address, your progress, goals, and plans are synced automatically to the cloud."
    },
    {
      q: "How does the streak system work?",
      a: "Your streak increases every day you complete at least one habit. If you miss a day, your streak will reset to zero unless you have a 'Streak Freeze' active."
    },
    {
      q: "Is the Premium plan refundable?",
      a: "We offer a 14-day money-back guarantee. If you're not satisfied with the Premium features, contact us within 14 days of purchase for a full refund."
    },
    {
      q: "How do I add a widget to my home screen?",
      a: "Mobile widgets are coming soon! We are currently developing native apps for iOS and Android which will support home screen widgets."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Support Center" subtitle="Find answers and get help" />

      <main className="p-6 max-w-5xl mx-auto">
        
        {/* Search Banner */}
        <div className={`rounded-[2.5rem] p-8 md:p-12 mb-10 text-center relative overflow-hidden ${getColorClass(themeColor, 'bg')} shadow-xl shadow-${themeColor}-500/20`}>
            <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">How can we help you today?</h2>
                <div className="max-w-xl mx-auto relative">
                    <input 
                        type="text" 
                        placeholder="Search for articles, guides, or questions..." 
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/95 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg transition-shadow"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQs Column */}
            <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <HelpCircle size={24} className={getColorClass(themeColor, 'text')} /> Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <button 
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                {faq.q}
                                <span className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} className="text-slate-400" />
                                </span>
                            </button>
                            <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-5 pt-0 text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 mt-2">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Side Column */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Us</h3>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="w-14 h-14 mx-auto bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Mail size={28} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email Support</h4>
                    <p className="text-xs text-slate-500 mb-6">For billing, account, and technical issues.</p>
                    <a href="mailto:help@progressloop.app" className={`block w-full py-3 rounded-xl text-sm font-bold ${getColorClass(themeColor, 'text')} bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}>
                        help@progressloop.app
                    </a>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="w-14 h-14 mx-auto bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Live Chat</h4>
                    <p className="text-xs text-slate-500 mb-6">Available Mon-Fri, 9am - 5pm EST</p>
                    <button className="block w-full py-3 rounded-xl text-sm font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 cursor-not-allowed border border-dashed border-slate-300 dark:border-slate-700">
                        Currently Offline
                    </button>
                </div>
                
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="w-14 h-14 mx-auto bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={28} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Documentation</h4>
                    <p className="text-xs text-slate-500 mb-6">Detailed guides on how to use features.</p>
                     <button className={`block w-full py-3 rounded-xl text-sm font-bold ${getColorClass(themeColor, 'text')} bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}>
                        Browse Docs
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Support;