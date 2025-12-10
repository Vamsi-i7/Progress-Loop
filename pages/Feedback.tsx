
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { MessageSquare, Star, Send } from 'lucide-react';

const Feedback: React.FC = () => {
  const { themeColor } = useStore();
  const [rating, setRating] = useState(0);

  // IMPORTANT: Replace this ID with your actual Formspree form ID
  // e.g., https://formspree.io/f/mqkvyqpw
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Share Your Feedback" subtitle="Help us improve Progress Loop" />

      <main className="p-6 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-10">
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4`}>
              <MessageSquare size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">We value your opinion</h2>
            <p className="text-slate-500 mt-2">Let us know what you think about Progress Loop or suggest features.</p>
          </div>

          <form action={FORMSPREE_ENDPOINT} method="POST" className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Topic</label>
               <select 
                 name="topic"
                 className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
               >
                 <option>General Feedback</option>
                 <option>Bug Report</option>
                 <option>Feature Request</option>
                 <option>Billing Question</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Message</label>
               <textarea 
                 name="message"
                 rows={6} 
                 placeholder="Tell us about your experience..." 
                 className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white resize-none"
                 required
               ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">How would you rate us?</label>
              {/* Hidden input to store rating value for form submission */}
              <input type="hidden" name="rating" value={rating} />
              
              <div className="flex gap-4 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className={`${rating >= star ? 'text-amber-400' : 'text-slate-300'} hover:text-amber-400 transition-colors`}
                  >
                    <Star size={32} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className={`w-full py-4 rounded-xl ${getColorClass(themeColor, 'bg')} text-white font-bold text-lg shadow-lg shadow-${themeColor}-500/30 hover:opacity-90 transition-all mt-4 flex items-center justify-center gap-2`}>
              <Send size={20} /> Submit Feedback
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
