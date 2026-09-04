import { useState, useEffect } from 'react';
import type { AppStep, UserRole, CurrentUser } from '@/types';
import { Splash } from '@/components/Splash';
import { Login } from '@/components/Login';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { MemberDashboard } from '@/components/MemberDashboard';

const SESSION_KEY = 'crewbook_session';

function App() {
  const [step, setStep] = useState<AppStep>('splash');
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const savedUser: CurrentUser = JSON.parse(saved);
        setUser(savedUser);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleSplashDone = () => {
    if (user) {
      setStep(user.role === 'owner' ? 'owner_dash' : 'member_dash');
    } else {
      setStep('login');
    }
  };

  const handleLogin = (role: UserRole, phone: string, name: string, uniqueId?: string) => {
    const newUser: CurrentUser = {
      name: role === 'owner' ? name : `Member (${uniqueId})`,
      role: role,
      whatsapp: phone,
      // uniqueId agar type mein support karna ho toh yahan bhi pass kar sakte hain
    };
    setUser(newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setStep(role === 'owner' ? 'owner_dash' : 'member_dash');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    setStep('login');
  };

  if (step === 'splash') {
    return <Splash onDone={handleSplashDone} />;
  }

  if (step === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (step === 'owner_dash' && user) {
    return <OwnerDashboard user={user} onLogout={handleLogout} setStep={setStep} />;
  }

  if (step === 'member_dash' && user) {
    return <MemberDashboard user={user} onLogout={handleLogout} setStep={setStep} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default App;
