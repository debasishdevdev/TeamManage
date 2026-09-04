import { useState, useEffect } from 'react';
import type { AppStep, UserRole, CurrentUser } from '@/types';
import { Splash } from '@/components/Splash';
import { Login } from '@/components/Login';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { MemberDashboard } from '@/components/MemberDashboard';
import { supabase } from '@/lib/supabase';

const SESSION_KEY = 'crewbook_session';

function App() {
  const [step, setStep] = useState<AppStep>('splash');
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const checkAuthAndSession = async () => {
      // 1. Pehle Supabase session check karo (Google OAuth return hone par yahi milega)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const metadata = session.user.user_metadata;
        const loggedInUser: CurrentUser = {
          name: metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: metadata?.role || 'owner',
          whatsapp: metadata?.whatsapp || '',
        };
        
        setUser(loggedInUser);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
        
        // Agar profile complete hai toh seedha dashboard bhejo
        if (metadata?.whatsapp && metadata?.name) {
          setStep(loggedInUser.role === 'owner' ? 'owner_dash' : 'member_dash');
          return;
        }
      }

      // 2. Agar Supabase session nahi hai toh sessionStorage check karo
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const savedUser: CurrentUser = JSON.parse(saved);
          setUser(savedUser);
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    };

    checkAuthAndSession();
  }, []);

  const handleSplashDone = () => {
    if (user && user.whatsapp) {
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
    };
    setUser(newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setStep(role === 'owner' ? 'owner_dash' : 'member_dash');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    setStep('login');
  };

  if (step === 'splash') {
    return <Splash onDone={handleSplashDone} />;
  }

  if (step === 'login') {
    return <Login onLoginSuccess={(supabaseUser) => {
      // Login component se success aane par
      const metadata = supabaseUser.user_metadata;
      const loggedInUser: CurrentUser = {
        name: metadata?.name || 'User',
        role: metadata?.role || 'owner',
        whatsapp: metadata?.whatsapp || '',
      };
      setUser(loggedInUser);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
      setStep(loggedInUser.role === 'owner' ? 'owner_dash' : 'member_dash');
    }} />;
  }

  if (step === 'owner_dash' && user) {
    return <OwnerDashboard user={user} onLogout={handleLogout} setStep={setStep} />;
  }

  if (step === 'member_dash' && user) {
    return <MemberDashboard user={user} onLogout={handleLogout} setStep={setStep} />;
  }

  return <Login onLoginSuccess={(supabaseUser) => {
    const metadata = supabaseUser.user_metadata;
    const loggedInUser: CurrentUser = {
      name: metadata?.name || 'User',
      role: metadata?.role || 'owner',
      whatsapp: metadata?.whatsapp || '',
    };
    setUser(loggedInUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
    setStep(loggedInUser.role === 'owner' ? 'owner_dash' : 'member_dash');
  }} />;
}

export default App;
