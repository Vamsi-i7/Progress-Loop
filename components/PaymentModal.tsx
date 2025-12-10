
import React, { useState } from 'react';
import { X, CreditCard, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore, getColorClass } from '../context/StoreContext';
import { PaymentGateway } from '../services/PaymentGateway';

interface PaymentModalProps {
  plan: 'pro' | 'premium';
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, amount, onClose, onSuccess }) => {
  const { themeColor, user } = useStore();
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [cardName, setCardName] = useState(user.name);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setErrorMsg('');

    try {
        const response = await PaymentGateway.processPayment({
            cardNumber,
            expiry,
            cvc,
            amount,
            plan
        });

        if (response.success) {
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } else {
            setStep('error');
            setErrorMsg(response.error || 'Transaction failed');
        }
    } catch (err) {
        setStep('error');
        setErrorMsg('Network error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
           <div className="flex items-center gap-2">
               <Lock size={16} className="text-emerald-500" />
               <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Secure Checkout</span>
           </div>
           <button onClick={onClose} disabled={step === 'processing'} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
               <X size={20} />
           </button>
        </div>

        <div className="p-8">
            {step === 'form' && (
                <form onSubmit={handlePay} className="space-y-5">
                    <div className="text-center mb-6">
                        <p className="text-slate-500 text-sm uppercase font-bold tracking-wider">Upgrade to {plan}</p>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">₹{amount}</h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
                        <input 
                            type="text" 
                            required 
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required 
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                             <input type="text" required placeholder="MM/YY" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-center" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVC</label>
                             <input type="password" required placeholder="123" maxLength={3} value={cvc} onChange={e => setCvc(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-center" />
                        </div>
                    </div>

                    <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-${themeColor}-500/30 flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] transition-transform ${getColorClass(themeColor, 'bg')}`}>
                        Pay ₹{amount}
                    </button>
                    
                    <div className="flex justify-center gap-4 mt-4 opacity-50 grayscale">
                         {/* Mock Payment Logos */}
                         <div className="h-6 w-10 bg-slate-200 rounded"></div>
                         <div className="h-6 w-10 bg-slate-200 rounded"></div>
                         <div className="h-6 w-10 bg-slate-200 rounded"></div>
                    </div>
                </form>
            )}

            {step === 'processing' && (
                <div className="text-center py-12">
                    <Loader2 size={48} className={`animate-spin mx-auto mb-4 ${getColorClass(themeColor, 'text')}`} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processing Payment</h3>
                    <p className="text-slate-500 mt-2">Please do not close this window...</p>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
                    <p className="text-slate-500 mt-2">Upgrading your account...</p>
                </div>
            )}

            {step === 'error' && (
                <div className="text-center py-8">
                     <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Failed</h3>
                    <p className="text-red-500 font-medium mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{errorMsg}</p>
                    <button onClick={() => setStep('form')} className="mt-6 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline">Try Again</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal