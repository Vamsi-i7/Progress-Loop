
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Sidebar from './components/Layout/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Planner from './pages/Planner';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Support from './pages/Support';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GroupStudy from './pages/GroupStudy';
import Roadmap from './pages/Roadmap';
import Flashcards from './pages/Flashcards';
import MindMap from './pages/MindMap';
import History from './pages/History';

// Layout for Authenticated Users (Shows Sidebar)
const AppLayout: React.FC = () => {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Outlet /> 
      </div>
    </div>
  );
};

// Route Protection Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <AppLayout /> : <Navigate to="/" replace />;
};

// Public Route Component
const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
    const { isAuthenticated } = useStore();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/group" element={<GroupStudy />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/mindmap" element={<MindMap />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/about" element={<About />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/support" element={<Support />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;