
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import Header from '../components/Layout/Header';
import { Check, Star, Zap, Building2, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import { initiateCheckout } from '../services/stripe';

const PRICING_CONFIG = {
  currency: '₹',
  pro: {
    monthly: 199,
    yearly: 1999,
  },
  premium: {
    monthly: 499,
    yearly: 4999,
  }
};

const Subscription: React.FC = () => {
  const { themeColor, user, refreshData } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();

  // Payment Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);

  const handleSubscribeClick = async (plan: 'pro' | 'premium') => {
    setSelectedPlan(plan);
    // Use the new Stripe Service
    const result = await initiateCheckout(plan, user.id);
    if (result.success && result.url) {
        // Redirect logic would go here
        // For demo, we just refresh data as MockBackend is updated synchronously in our mock
        refreshData();
        setShowPayment(false); 
        alert(`Successfully upgraded to ${plan}!`);
    } else {
        alert("Checkout failed. Please try again.");
    }
  };

  const handleManageSubscription = () => {
    window.location.href = `mailto:support@progressloop.app?subject=Manage Subscription for ${user.email}`;
  };

  const PlanCard = ({ title, price, features, recommended, icon: Icon, planKey }: any) => {
    const isCurrentPlan = user.plan === planKey || (title === 'Free' && user.plan === 'free');

    return (
      <div className={`relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col ${recommended 
        ? `bg-white dark:bg-slate-900 border-${themeColor}-500 shadow-2xl shadow-${themeColor}-500/10 scale-105 z-10` 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}>
        {recommended && (
          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${getColorClass(themeColor, 'bg')} text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
            Most Popular
          </div>
        )}
        
        <div className="mb-6">
          <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${recommended ? `${getColorClass(themeColor, 'bg')} text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Icon size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              {title === 'Free' ? 'Free' : `${PRICING_CONFIG.currency}${price}`}
            </span>
            {title !== 'Free' && <span className="text-slate-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
          </div>
          <p className="text-sm text-slate-500 mt-2">Perfect for {title === 'Free' ? 'getting started' : title === 'Pro' ? 'serious students' : 'maximum productivity'}</p>
        </div>

        <button 
          onClick={() => isCurrentPlan ? handleManageSubscription() : (title !== 'Free' && handleSubscribeClick(planKey))}
          disabled={title === 'Free'}
          className={`w-full py-3 rounded-xl font-bold mb-8 transition-all ${
            isCurrentPlan
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
              : recommended 
                ? `${getColorClass(themeColor, 'bg')} ${getColorClass(themeColor, 'hover')} text-white shadow-lg shadow-${themeColor}-500/30` 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : title === 'Free' ? 'Forever Free' : 'Subscribe with Stripe'}
        </button>

        <div className="space-y-4 flex-1">
          {features.map((feature: string, i: number) => (
            <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className={`mt-0.5 p-0.5 rounded-full ${recommended ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                <Check size={12} strokeWidth={3} />
              </div>
              {feature}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Header title="Subscription" subtitle="Upgrade to unlock premium features" />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Choose Your Plan</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Select the perfect plan to supercharge your productivity and achieve your academic goals.</p>
          
          <div className="inline-flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}
            >
              Annual <span className="text-green-500 text-[10px] ml-1">(Save ~17%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <PlanCard 
            title="Free" 
            price="0" 
            icon={Star}
            features={['Up to 3 goals', 'Basic habit tracking', '7-day progress history', 'Simple study planner']} 
          />
          <PlanCard 
            title="Pro" 
            price={billingCycle === 'monthly' ? PRICING_CONFIG.pro.monthly : PRICING_CONFIG.pro.yearly} 
            recommended={true}
            icon={Zap}
            planKey="pro"
            features={['Unlimited goals', 'Advanced habit tracking', 'Full progress history', 'Advanced study planner', 'Advanced analytics', 'Data export (CSV, PDF)']} 
          />
          <PlanCard 
            title="Premium" 
            price={billingCycle === 'monthly' ? PRICING_CONFIG.premium.monthly : PRICING_CONFIG.premium.yearly} 
            icon={Star}
            planKey="premium"
            features={['Everything in Pro', 'Custom themes', 'Priority support', 'API access', 'Team collaboration', 'Advanced reporting', 'Dedicated account manager']} 
          />
        </div>

        <div className="text-center mt-12">
           <button onClick={handleManageSubscription} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1 mx-auto transition-colors">
              Already subscribed? Manage your subscription <ExternalLink size={14} />
           </button>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
