import { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [needsProfile, setNeedsProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check if user just returned from Google OAuth redirect
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        // Agar pehle se whatsapp number saved hai toh seedha login karwa do
        if (metadata?.whatsapp && metadata?.name) {
          onLoginSuccess(session.user);
        } else {
          // Agar profile adhoori hai toh details mangne ke liye form dikhao
          setCurrentUser(session.user);
          if (metadata?.name) setName(metadata.name);
          setNeedsProfile(true);
        }
      }
    };
    checkUserSession();
  }, [onLoginSuccess]);

  // Step 1: Trigger Google Sign-In
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message || 'Google Login Failed');
      setLoading(false);
    }
  };

  // Step 2: Save Profile (Name & WhatsApp Number) after Google Login
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp || !name) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          role: role,
          name: name,
          whatsapp: whatsapp,
        },
      });

      if (error) throw error;

      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving profile');
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

        {!needsProfile ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400 text-center mb-4">
              Sign in securely with your Google account to access your workspace.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 mb-4 text-center">
              <p className="text-xs text-neutral-400">Logged in as:</p>
              <p className="text-sm font-medium text-yellow-500">{currentUser?.email}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">WhatsApp Number (For Direct Chat)</label>
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
              {loading ? 'Saving...' : 'Finish & Open App'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
