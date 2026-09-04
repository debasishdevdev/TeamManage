import { useState } from 'react';
import { Users, LogOut, CheckCircle2, Clock } from 'lucide-react';
import type { AppStep, CurrentUser } from '@/types';
import { useCrewBook } from '@/hooks/useCrewBook';
import { CalendarView } from '@/components/CalendarView';

interface MemberDashboardProps {
  user: CurrentUser;
  onLogout: () => void;
  setStep: (step: AppStep) => void;
}

export function MemberDashboard({ user, onLogout, setStep }: MemberDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const crew = useCrewBook();

  if (crew.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 mb-3 animate-pulse">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-xs text-neutral-500">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  const memberName = user?.name || '';
  // Safe case-insensitive and trimmed matching for team member info
  const teamMemberInfo = crew.data?.team?.find(
    (t) => t.name?.trim().toLowerCase() === memberName.trim().toLowerCase()
  );
  const paymentStatus = teamMemberInfo?.payment_status || 'Pending';

  const handleLogout = () => {
    onLogout();
    setStep('login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white max-w-md mx-auto relative border-x border-neutral-900 shadow-2xl">
      <header className="flex justify-between items-center px-4 py-3.5 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-neutral-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-amber-400 leading-tight">Team Manage</h1>
            <p className="text-[10px] text-neutral-500">{memberName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
          <span className="text-xs text-neutral-300">Your Payment Status:</span>
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
              paymentStatus === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {paymentStatus === 'Paid' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" /> Pending
              </>
            )}
          </span>
        </div>

        <CalendarView
          bookings={crew.data?.bookings || []}
          freelancing={crew.data?.freelancing || []}
          team={crew.data?.team || []}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          memberName={memberName}
        />
      </main>
    </div>
  );
}
