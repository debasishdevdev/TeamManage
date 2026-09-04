import { useState } from 'react';
import type { UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [role, setRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP to Email & save WhatsApp number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !whatsapp) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          data: {
            role: role,
            name: role === 'owner' ? name : 'Team Member',
            whatsapp: whatsapp, // WhatsApp number ko auth metadata mein save kar rahe hain
          },
        },
      });

      if (error) throw error;
      alert('OTP has been sent to your email! Please check your inbox.');
      setStep('verify');
    } catch (err: any) {
      alert(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      alert(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-yellow-500">Team Manage</h2>
        
        {/* Role Selector Tabs */}
        <div className="flex bg-neutral-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              role === 'owner' ? 'bg-yellow-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Owner Login
          </button>
          <button
            type="button"
            onClick={() => setRole('member')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              role === 'member' ? 'bg-yellow-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Team Member
          </button>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {role === 'owner' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address (For OTP)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition-all mt-4"
            >
              {loading ? 'Sending OTP...' : 'Send OTP via Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-neutral-400 text-center mb-2">
              Enter the OTP sent to <span className="text-white font-medium">{email}</span>
            </p>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Verification OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center tracking-widest text-lg focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition-all mt-4"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-xs text-neutral-400 hover:text-white mt-2 text-center block"
            >
              Change Details / Re-enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
