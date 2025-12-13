import React from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Sparkles, Target, Users, Shield } from 'lucide-react';

const About: React.FC = () => {
  const { themeColor } = useStore();

  const Feature = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center hover:shadow-xl transition-all duration-300 group">
      <div className={`w-16 h-16 mx-auto rounded-2xl ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="About Progress Loop" />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 mt-8">
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
             Empowering students to build <span className={getColorClass(themeColor, 'text')}>better habits</span>
           </h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
             Progress Loop provides the tools and insights needed to transform ambition into accomplishment. We believe every student has the potential to achieve greatness with the right structure.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Feature 
            icon={Target} 
            title="Goal Tracking" 
            desc="Set daily, monthly, and yearly goals. Break them down into manageable habits and track your journey." 
          />
          <Feature 
            icon={Sparkles} 
            title="Smart Insights" 
            desc="Visualize your progress with real-time charts. Identify patterns and optimize your study schedule." 
          />
          <Feature 
            icon={Users} 
            title="Community" 
            desc="Join thousands of students who are improving their grades and building sustainable life skills." 
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden">
           <div className={`absolute top-0 right-0 w-64 h-64 ${getColorClass(themeColor, 'bg')} opacity-5 rounded-full blur-3xl -mr-32 -mt-32`}></div>
           <div className={`absolute bottom-0 left-0 w-64 h-64 ${getColorClass(themeColor, 'bg')} opacity-5 rounded-full blur-3xl -ml-32 -mb-32`}></div>
           
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">Ready to start your journey?</h2>
           <button className={`relative z-10 ${getColorClass(themeColor, 'bg')} text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-${themeColor}-500/30 hover:scale-105 transition-transform`}>
             Get Started for Free
           </button>
        </div>
      </main>
    </div>
  );
};

export default About;