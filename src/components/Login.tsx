import { useState } from 'react';
import type { UserRole } from '@/types';

interface LoginProps {
  onLogin: (role: UserRole, phone: string, name: string, uniqueId?: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [uniqueId, setUniqueId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    if (role === 'owner' && !name) {
      alert('Please enter your name');
      return;
    }

    if (role === 'member' && !uniqueId) {
      alert('Please enter your Unique ID provided by the owner');
      return;
    }

    onLogin(
      role, 
      phone, 
      role === 'owner' ? name : 'Team Member', 
      role === 'member' ? uniqueId : undefined
    );
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'owner' && (
            <div>
              <label htmlFor="owner-name" className="block text-xs font-medium text-neutral-400 mb-1">Owner Name</label>
              <input
                id="owner-name"
                name="ownerName"
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
            <label htmlFor="whatsapp-phone" className="block text-xs font-medium text-neutral-400 mb-1">WhatsApp Number</label>
            <input
              id="whatsapp-phone"
              name="whatsappPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          {role === 'member' && (
            <div>
              <label htmlFor="unique-id" className="block text-xs font-medium text-neutral-400 mb-1">Unique Member ID</label>
              <input
                id="unique-id"
                name="uniqueId"
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value.toUpperCase())}
                placeholder="e.g. TM-101"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition-all mt-4"
          >
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
