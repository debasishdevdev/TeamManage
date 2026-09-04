import { useState, useEffect } from 'react';
import type { AppStep, UserRole, CurrentUser } from '@/types';
import { Splash } from '@/components/Splash';
import { Login } from '@/components/Login';
import { OtpVerify } from '@/components/OtpVerify';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { MemberDashboard } from '@/components/MemberDashboard';

const SESSION_KEY = 'crewbook_session';

function App() {
  const [step, setStep] = useState<AppStep>('splash');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [loginPhone, setLoginPhone] = useState('');

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

  const handleLogin = (role: UserRole, phone: string) => {
    setLoginRole(role);
    setLoginPhone(phone);
    setStep('otp_verify');
  };

  const handleOtpVerified = () => {
    if (!loginRole) return;
    const newUser: CurrentUser = {
      name: loginRole === 'owner' ? 'Studio Owner' : 'Amit Sharma',
      role: loginRole,
      whatsapp: loginPhone,
    };
    setUser(newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setStep(loginRole === 'owner' ? 'owner_dash' : 'member_dash');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  // Helper function to trigger WhatsApp from the logged-in user's number
  const handleOpenWhatsApp = (customMessage = "Hello, managing team tasks.") => {
    const phone = user?.whatsapp || loginPhone || "";
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(customMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  if (step === 'splash') {
    return <Splash onDone={handleSplashDone} />;
  }

  if (step === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (step === 'otp_verify' && loginRole) {
    return <OtpVerify role={loginRole} phone={loginPhone} onVerify={handleOtpVerified} />;
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
