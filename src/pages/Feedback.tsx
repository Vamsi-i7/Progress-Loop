
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { MessageSquare, Star, Send } from 'lucide-react';
import { MockBackend } from '../services/MockBackend';
import { sendFeedbackEmail } from '../api/feedback';

const Feedback: React.FC = () => {
  const { themeColor, user } = useStore();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('General Feedback');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const submission = {
        id: `fb_${Date.now()}`,
        userId: user.id,
        page: topic,
        message,
        rating,
        createdAt: new Date().toISOString()
    };

    // Save to DB
    MockBackend.submitFeedback(submission);

    // Send Email
    await sendFeedbackEmail(submission);

    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header title="Feedback" />
          <main className="p-6 max-w-3xl mx-auto text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
              <p className="text-slate-500">Your feedback has been received.</p>
              <button onClick={() => setSubmitted(false)} className="mt-8 text-blue-500">Submit another</button>
          </main>
        </div>
      );
  }

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Topic</label>
               <select 
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
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
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 rows={6} 
                 placeholder="Tell us about your experience..." 
                 className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white resize-none"
                 required
               ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">How would you rate us?</label>
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

            <button disabled={sending} type="submit" className={`w-full py-4 rounded-xl ${getColorClass(themeColor, 'bg')} text-white font-bold text-lg shadow-lg shadow-${themeColor}-500/30 hover:opacity-90 transition-all mt-4 flex items-center justify-center gap-2`}>
              <Send size={20} /> {sending ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
