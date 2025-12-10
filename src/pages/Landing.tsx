
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore, getColorClass } from '../context/StoreContext';
import NotificationDropdown from '../components/Layout/NotificationDropdown';
import { 
  Sparkles, Target, Zap, Check, ArrowRight, LayoutDashboard, 
  Menu, X, Calendar, Star, Trophy, Crown, Flame, Users, Globe, Activity,
  Sun, Moon, Settings, LogOut
} from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated, themeColor, startDemo, theme, toggleTheme, user, logout } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
        navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup'); 
    }
  };
  
  const handleSignIn = () => {
      navigate('/login');
  }

  const handleViewDemo = () => {
      startDemo();
      navigate('/dashboard');
  };

  const handleLogout = () => {
      logout();
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ... (MockDashboardPreview component code omitted for brevity as it remains unchanged) ...
  const MockDashboardPreview = () => (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 aspect-video relative flex flex-col">
       <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
         <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
         <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
         <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
       </div>
       <div className="flex-1 flex">
          <div className="w-16 border-r border-slate-800 hidden sm:flex flex-col items-center pt-4 gap-4">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/20"></div>
             <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
             <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
          </div>
          <div className="flex-1 p-4 grid grid-cols-3 gap-4">
             <div className="col-span-2 space-y-4">
                <div className="h-24 rounded-lg bg-slate-800/50 flex items-center p-4 gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">85%</div>
                    <div className="space-y-2 flex-1">
                        <div className="h-3 w-1/3 bg-slate-700 rounded"></div>
                        <div className="h-2 w-full bg-slate-700 rounded"></div>
                    </div>
                </div>
                <div className="h-40 rounded-lg bg-slate-800/50 p-4">
                     <div className="flex items-end gap-2 h-full pb-2">
                        {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-500/80 rounded-t" style={{height: `${h}%`}}></div>
                        ))}
                     </div>
                </div>
             </div>
             <div className="col-span-1 space-y-4">
                 <div className="h-full rounded-lg bg-slate-800/50 p-3 space-y-3">
                    <div className="h-8 w-full bg-slate-700 rounded mb-2"></div>
                    <div className="h-10 w-full bg-slate-700/50 rounded flex items-center px-2 gap-2">
                        <div className="w-4 h-4 rounded-full border border-slate-500"></div>
                        <div className="h-2 w-1/2 bg-slate-600 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-slate-700/50 rounded flex items-center px-2 gap-2">
                         <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div className="h-2 w-1/2 bg-slate-600 rounded"></div>
                    </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm py-3 border-slate-200 dark:border-slate-800' : 'bg-transparent py-6 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white shadow-lg`}>
              <Sparkles size={22} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>Progress Loop</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated && ['Features', 'Stats', 'Pricing'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => scrollToSection(item.toLowerCase())} 
                  className={`text-sm font-semibold hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer ${scrolled ? 'text-slate-600 dark:text-slate-300' : 'text-white/90'}`}
                >
                    {item}
                </button>
            ))}

            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${scrolled ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white/90 hover:bg-white/10'}`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {isAuthenticated ? (
                <div className={`flex items-center gap-3 pl-4 border-l ${scrolled ? 'border-slate-200 dark:border-slate-800' : 'border-white/20'}`}>
                    <div className="flex items-center gap-3 mr-2">
                       <div className={`w-8 h-8 rounded-full ${getColorClass(themeColor, 'bg')} text-white flex items-center justify-center text-xs font-bold`}>
                           {user.name.substring(0, 2).toUpperCase()}
                       </div>
                       <span className={`text-sm font-bold ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                           {user.username}
                       </span>
                    </div>
                    
                    <NotificationDropdown iconClassName={`${scrolled ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'}`} />

                    <button 
                      onClick={() => navigate('/dashboard')}
                      className={`p-2 rounded-xl transition-all ${scrolled ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'}`}
                      title="Dashboard"
                    >
                        <LayoutDashboard size={20} />
                    </button>
                    
                     <button 
                      onClick={() => navigate('/settings')}
                      className={`p-2 rounded-xl transition-all ${scrolled ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'}`}
                      title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSignIn}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-all hover:opacity-80 ${scrolled ? 'text-slate-700 dark:text-slate-200' : 'text-white'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={handleGetStarted}
                        className={`text-sm font-bold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 ${scrolled ? `bg-slate-900 dark:bg-white text-white dark:text-slate-900` : 'bg-white text-indigo-600 shadow-xl'}`}
                    >
                        Sign Up
                    </button>
                </div>
            )}
          </div>

          <button className={`md:hidden p-2 ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`} onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* ... Rest of the Landing page content (Hero, Features, Pricing, Footer) remains same ... */}
      {/* --- HERO SECTION --- */}
      <header className="relative w-full min-h-[90vh] flex items-center pt-20 pb-20 md:pt-32 px-6 overflow-hidden">
        {/* Robust Full Screen Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
        
        {/* Soft Glows */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-pink-500 rounded-full blur-[100px] opacity-20 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-indigo-500 rounded-full blur-[100px] opacity-20 mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left text-white space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <Trophy size={14} className="text-yellow-300" />
                    <span className="text-sm font-semibold tracking-wide">The #1 Habit Tracker for Students</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight drop-shadow-sm">
                    Build habits, <br/>
                    track goals, and <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-100">study smarter.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    Stop procrastination in its tracks. Plan your exams, visualize your progress, and gamify your academic journey with Progress Loop.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                    <button 
                        onClick={handleGetStarted}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold bg-white text-indigo-700 shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        {isAuthenticated ? 'Go to Dashboard' : 'Start Tracking Now'} <ArrowRight size={20} />
                    </button>
                    {!isAuthenticated && (
                        <button 
                            onClick={handleViewDemo}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                        >
                            View Demo
                        </button>
                    )}
                </div>
                
                <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-indigo-200">
                    <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white/20 backdrop-blur flex items-center justify-center text-xs font-bold text-white">
                            {String.fromCharCode(64+i)}
                            </div>
                        ))}
                    </div>
                    <p>Join <span className="text-white font-bold">10,000+</span> successful students</p>
                </div>
            </div>

            {/* Hero Visual - Laptop/App Mockup */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none mt-10 lg:mt-0">
                {/* Clean Tilt Effect */}
                <div className="relative z-10 transform transition-transform hover:scale-[1.02] duration-500">
                    <div className="bg-slate-900 p-2 md:p-3 rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-700/50 ring-1 ring-white/10">
                        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                             {/* Header of App */}
                             <div className="h-8 md:h-10 bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-700">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="ml-4 px-3 py-1 bg-slate-900 rounded-md text-[10px] text-slate-500 w-32 md:w-48 opacity-50">progressloop.app</div>
                             </div>
                             
                             {/* App Content Preview */}
                             <div className="bg-slate-900 p-4 h-[280px] md:h-[380px] overflow-hidden relative">
                                 <div className="flex gap-4 h-full">
                                    {/* Sidebar Mockup */}
                                    <div className="w-16 hidden md:flex flex-col gap-3 border-r border-slate-800 pr-3 opacity-50">
                                        {[1,2,3,4].map(i => <div key={i} className="h-8 w-full bg-slate-800 rounded-lg"></div>)}
                                    </div>
                                    {/* Dashboard Mockup */}
                                    <div className="flex-1 space-y-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="h-6 w-32 bg-slate-800 rounded"></div>
                                            <div className="h-8 w-8 bg-indigo-500 rounded-full"></div>
                                        </div>
                                        {/* Big Card */}
                                        <div className="h-32 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20 p-4 flex items-center justify-between">
                                             <div className="space-y-2">
                                                <div className="h-4 w-24 bg-white/10 rounded"></div>
                                                <div className="h-6 w-16 bg-white/20 rounded"></div>
                                             </div>
                                             <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">75%</div>
                                        </div>
                                        {/* Row of Cards */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-800"></div>
                                            <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-800 flex items-end justify-center p-2 gap-1">
                                                 {[20, 40, 30, 60, 40].map((h, i) => (
                                                     <div key={i} className="w-3 bg-indigo-500/40 rounded-t-sm" style={{height: `${h}%`}}></div>
                                                 ))}
                                            </div>
                                        </div>
                                    </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* ... (Keeping rest of the file exactly as provided in input to avoid unnecessary truncation) ... */}
        {/* STATS BAR */}
        <section id="stats" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                  <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">Our Impact</h3>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Trusted by students worldwide</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                  {[{ label: "Active Students", value: "+10k", color: "text-indigo-500", icon: Users }, { label: "Habits Tracked", value: "+500k", color: "text-purple-500", icon: Activity }, { label: "Goals Reached", value: "+50k", color: "text-pink-500", icon: Target }, { label: "Countries", value: "100+", color: "text-amber-500", icon: Globe }].map((stat, i) => (
                      <div key={i} className="flex flex-col items-center group">
                          <div className={`w-12 h-12 rounded-2xl mb-4 bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                              <stat.icon size={24} />
                          </div>
                          <h3 className={`text-4xl md:text-5xl font-black ${stat.color} tracking-tighter mb-1`}>{stat.value}</h3>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">{stat.label}</p>
                      </div>
                  ))}
              </div>
          </div>
        </section>
        
        {/* FEATURES SECTION */}
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900 scroll-mt-20">
            {/* ... Content from input file ... */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">Everything you need to succeed</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Powerful tools designed specifically for the student workflow.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-100 dark:border-slate-800 group">
                        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                            <MockDashboardPreview />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg">
                                    <LayoutDashboard size={32} className="text-indigo-500" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Customizable Dashboard</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Create your very own study universe. Track goals, visualize progress, and keep your daily tasks front and center.</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-100 dark:border-slate-800 group">
                        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                            <Flame className="absolute top-8 left-8 text-slate-300 dark:text-slate-700 opacity-50 rotate-12" size={40} />
                            <Star className="absolute bottom-8 right-8 text-slate-300 dark:text-slate-700 opacity-50 -rotate-12" size={40} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg">
                                    <Trophy size={32} className="text-amber-500" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Gamified Progress</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Earn XP, maintain streaks, and level up as you complete tasks. Turn studying into a game you actually want to play.</p>
                    </div>
                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-slate-100 dark:border-slate-800 group">
                        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors"></div>
                            <div className="w-32 h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-2">
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                <div className="flex gap-1">
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg">
                                    <Calendar size={32} className="text-pink-500" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Exam Planner</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Never miss a deadline. Structure your study sessions, set priorities, and ace your upcoming exams with ease.</p>
                    </div>
                </div>
            </div>
        </section>

      {/* --- ALTERNATING FEATURE SECTIONS --- */}
      <section className="py-20 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 space-y-32">
             <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                 <div className="flex-1 order-2 md:order-1 relative">
                     <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-20 blur-3xl rounded-full"></div>
                     <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                         <div className="space-y-4">
                             {[1,2,3].map(i => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                     <div className="flex items-center gap-4">
                                         <div className={`w-6 h-6 rounded-full border-2 ${i===1 ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}></div>
                                         <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                     </div>
                                     <Zap size={16} className="text-amber-500" />
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
                 <div className="flex-1 order-1 md:order-2 text-center md:text-left">
                     <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">Build Habits</h3>
                     <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">Consistency <br/>is key.</h2>
                     <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                         Balance is crucial. Our habit tracker helps you build sustainable routines. Check off your daily reading, practice, or study goals to keep your momentum going.
                     </p>
                     <button onClick={handleGetStarted} className="px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                         Start Tracking
                     </button>
                 </div>
             </div>
             <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                 <div className="flex-1 text-center md:text-left">
                     <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-2">Study Stats</h3>
                     <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">Visualise your <br/>growth.</h2>
                     <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                         See your progress every day in your Stats dashboard. Track your productivity trends, earn XP, and watch your skills improve over time.
                     </p>
                     <button onClick={handleGetStarted} className="px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                         View My Stats
                     </button>
                 </div>
                 <div className="flex-1 relative">
                     <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-3xl rounded-full"></div>
                     <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                         <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
                             {[30, 50, 45, 80, 60, 90, 75].map((h, i) => (
                                 <div key={i} className="w-full bg-indigo-500 rounded-t-lg opacity-80" style={{height: `${h}%`}}></div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black mb-6">Invest in your future</h2>
                  <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                      Choose the plan that fits your academic journey. Cancel anytime.
                  </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* FREE PLAN */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-slate-700 flex flex-col">
                      <div className="mb-6">
                          <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                              <Star className="text-slate-300" />
                          </div>
                          <h3 className="text-2xl font-bold">Starter</h3>
                          <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-4xl font-black">Free</span>
                          </div>
                          <p className="text-slate-400 mt-2 text-sm">Forever free for basic tracking.</p>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                          {['3 Active Goals', 'Basic Habit Tracking', '7-Day History', 'Community Support'].map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                  <Check size={16} className="text-slate-500" /> {f}
                              </li>
                          ))}
                      </ul>
                      <button onClick={handleGetStarted} className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold transition-colors">
                          Get Started
                      </button>
                  </div>
                  {/* PRO PLAN */}
                  <div className="bg-gradient-to-b from-indigo-900/80 to-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-indigo-500/50 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/20">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          Most Popular
                      </div>
                      <div className="mb-6">
                          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 text-white">
                              <Zap />
                          </div>
                          <h3 className="text-2xl font-bold">Pro Student</h3>
                          <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-4xl font-black">₹199</span>
                              <span className="text-slate-400">/mo</span>
                          </div>
                          <p className="text-indigo-200 mt-2 text-sm">Everything you need to excel.</p>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                          {['Unlimited Goals', 'Advanced Analytics', 'Exam Planner', 'Priority Support', 'Custom Themes'].map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                  <div className="bg-green-500/20 p-1 rounded-full text-green-400"><Check size={12} strokeWidth={3} /></div> {f}
                              </li>
                          ))}
                      </ul>
                      <button onClick={handleGetStarted} className="w-full py-4 rounded-xl bg-white text-indigo-900 font-black hover:bg-indigo-50 transition-colors">
                          Go Pro
                      </button>
                  </div>
                  {/* PREMIUM PLAN */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-slate-700 flex flex-col">
                      <div className="mb-6">
                          <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                              <Crown className="text-amber-400" />
                          </div>
                          <h3 className="text-2xl font-bold">Ultimate</h3>
                          <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-4xl font-black">₹499</span>
                              <span className="text-slate-400">/mo</span>
                          </div>
                          <p className="text-slate-400 mt-2 text-sm">Maximum power & collaboration.</p>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                          {['Everything in Pro', 'Team/Group Features', 'API Access', 'Dedicated Mentor Chat', 'Early Access Features'].map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                  <Check size={16} className="text-amber-500" /> {f}
                              </li>
                          ))}
                      </ul>
                      <button onClick={handleGetStarted} className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold transition-colors">
                          Get Ultimate
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 text-center px-6">
           <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">
               Find your focus. Set Goals.<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Achieve Them.</span> Get rewarded.
           </h2>
           <button onClick={handleGetStarted} className={`px-10 py-5 rounded-full text-xl font-bold text-white shadow-xl hover:scale-105 transition-transform ${getColorClass(themeColor, 'bg')}`}>
               {isAuthenticated ? 'Go to Dashboard' : 'Join Progress Loop Today'}
           </button>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${getColorClass(themeColor, 'bg')} flex items-center justify-center text-white`}>
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Progress Loop</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
              <Link to="/about" className="hover:text-slate-900 dark:hover:text-white">Privacy</Link>
              <Link to="/about" className="hover:text-slate-900 dark:hover:text-white">Terms</Link>
              <Link to="/support" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
          </div>
          <p className="text-slate-400 text-sm">© 2024 Progress Loop.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
