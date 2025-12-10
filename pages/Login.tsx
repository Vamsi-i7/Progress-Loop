
import React, { useState } from 'react';
import { useStore, getColorClass } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const { login, themeColor } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const success = await login(email, password);
    if (success) {
        navigate('/dashboard');
    } else {
        setError('Invalid credentials. Try demo@example.com / password');
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        
        <div className={`absolute -top-24 -right-24 w-48 h-48 ${getColorClass(themeColor, 'bg')} opacity-10 rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${getColorClass(themeColor, 'bg')} opacity-10 rounded-full blur-3xl`}></div>

        <div className="absolute top-6 left-6 z-20">
             <Link 
               to="/" 
               className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 text-sm font-medium"
             >
                <ArrowLeft size={18} /> <span className="hidden sm:inline">Back to Home</span>
             </Link>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8 mt-4">
            <div className={`w-16 h-16 rounded-2xl ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white shadow-lg shadow-${themeColor}-500/30`}>
              <Sparkles size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-center mb-8">Sign in to continue your progress</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="email" 
                    placeholder="Email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
            </div>

            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

            <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 ${getColorClass(themeColor, 'bg')}`}
            >
                {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={20} />
            </button>
          </form>
          
          <p className="text-center mt-6 text-sm text-slate-400">
              Don't have an account? <Link to="/signup" className={`font-bold cursor-pointer ${getColorClass(themeColor, 'text')}`}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
