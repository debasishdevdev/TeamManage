import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import type { UserRole } from '@/types';

interface OtpVerifyProps {
  role: UserRole;
  phone: string;
  onVerify: () => void;
}

export function OtpVerify({ role, phone, onVerify }: OtpVerifyProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''));
      setOtp(newOtp);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const otpString = otp.join('');

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-950 text-white p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-amber-400">Verify OTP</h2>
          <p className="text-xs text-neutral-500 mt-2">Enter code sent to {phone}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-center text-xl font-bold focus:outline-none focus:border-amber-400 transition-colors"
              />
            ))}
          </div>

          <button
            onClick={onVerify}
            disabled={otpString.length !== 6}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
          >
            Verify & Enter App
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <p className="text-center text-[10px] text-neutral-600 mt-4">
            {role === 'owner' ? 'Owner access' : 'Team Member access'} • Demo OTP (enter any 6 digits)
          </p>
        </div>
      </div>
    </div>
  );
}
