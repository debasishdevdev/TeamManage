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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthAndSession = async () => {
      try {
        // 1. Pehle Supabase session check karo
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
          
          if (metadata?.whatsapp && metadata?.name) {
            setStep(loggedInUser.role === 'owner' ? 'owner_dash' : 'member_dash');
            setLoading(false);
            return;
          }
        }

        // 2. Agar Supabase session nahi hai toh sessionStorage check karo
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          try {
            const savedUser: CurrentUser = JSON.parse(saved);
            setUser(savedUser);
            setStep(savedUser.role === 'owner' ? 'owner_dash' : 'member_dash');
            setLoading(false);
            return;
          } catch {
            sessionStorage.removeItem(SESSION_KEY);
          }
        }

        // Agar koi session nahi mila toh login par bhej do
        setStep('login');
      } catch (err) {
        console.error('Auth check error:', err);
        setStep('login');
      } finally {
        setLoading(false);
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

  // Jab tak session check ho raha hai, tab tak ek loading indicator dikhao taaki white screen na aaye
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#ffffff', color: '#333', fontFamily: 'sans-serif' }}>
        <h3>Loading TeamManage...</h3>
      </div>
    );
  }

  if (step === 'splash') {
    return <Splash onDone={handleSplashDone} />;
  }

  if (step === 'login') {
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
