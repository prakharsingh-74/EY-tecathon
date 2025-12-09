import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { LoadingScreen } from './components/LoadingScreen';
import { OnboardingTour } from './components/OnboardingTour';
import { Toast } from './components/Toast';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Agents } from './components/Agents';
import { RFPDetails } from './components/RFPDetails';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';

interface User {
  name: string;
  email: string;
  role: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rfp_user');
    const hasSeenOnboarding = localStorage.getItem('rfp_onboarding_completed');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Show onboarding for first-time users
        if (!hasSeenOnboarding) {
          setTimeout(() => setShowOnboarding(true), 1000);
        }
      } catch (error) {
        console.error('Failed to parse saved user data');
        localStorage.removeItem('rfp_user');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (userData: User) => {
    setIsLoading(true);
    // Simulate initialization delay
    setTimeout(() => {
      setUser(userData);
      localStorage.setItem('rfp_user', JSON.stringify(userData));
      setIsLoading(false);
      
      // Show onboarding for new users
      const hasSeenOnboarding = localStorage.getItem('rfp_onboarding_completed');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1000);
      } else {
        setToast({ message: 'Welcome back! All agents are active.', type: 'success', show: true });
      }
    }, 2000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rfp_user');
    setCurrentPage('dashboard');
    setToast({ message: 'Logged out successfully', type: 'info', show: true });
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('rfp_onboarding_completed', 'true');
    setToast({ message: 'Welcome! Your dashboard is ready.', type: 'success', show: true });
  };

  const renderPage = () => {
    if (!user) return null;
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'agents':
        return <Agents />;
      case 'rfps':
        return <RFPDetails />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Show loading screen during initialization or login
  if (isLoading || isInitializing) {
    return <LoadingScreen />;
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Show main app if logged in
  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={handleLogout}>
        {renderPage()}
      </Layout>
      
      {/* Onboarding Tour */}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
      
      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}