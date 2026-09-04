import { useState } from 'react';
import { Film, Crown, Video, Phone, ArrowRight } from 'lucide-react';
import type { UserRole } from '@/types';

interface LoginProps {
  onLogin: (role: UserRole, phone: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (!selectedRole) return alert('Please select Owner or Team Member!');
    if (!phone.trim()) return alert('WhatsApp number is required!');
    onLogin(selectedRole, phone.trim());
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-950 text-white p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-xl shadow-amber-500/20">
            <Film className="w-8 h-8 text-neutral-950" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-amber-400">CrewBook</h2>
          <p className="text-xs text-neutral-500 mt-1">Powered by Darsik Films</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <p className="text-sm text-neutral-400 mb-4 text-center">Select Login Type</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSelectedRole('owner')}
              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                selectedRole === 'owner'
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300 scale-[1.02]'
                  : 'border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Crown className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xs font-bold">Owner Login</div>
            </button>
            <button
              onClick={() => setSelectedRole('member')}
              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                selectedRole === 'member'
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300 scale-[1.02]'
                  : 'border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Video className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xs font-bold">Team Member</div>
            </button>
          </div>

          <label className="text-xs text-neutral-400 mb-1.5 block">WhatsApp Number</label>
          <div className="relative mb-4">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group"
          >
            Get OTP via WhatsApp
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
