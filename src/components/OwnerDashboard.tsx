import { useState } from 'react';
import { CalendarDays, ClipboardList, Users, Wallet, Video, LogOut } from 'lucide-react';
import type { AppStep, TabId, CurrentUser } from '@/types';
import { useCrewBook } from '@/hooks/useCrewBook';
import { CalendarView } from '@/components/CalendarView';
import { BookingsManager } from '@/components/BookingsManager';
import { TeamView } from '@/components/TeamView';
import { FinanceView } from '@/components/FinanceView';
import { FreelancingView } from '@/components/FreelancingView';

interface OwnerDashboardProps {
  user: CurrentUser;
  onLogout: () => void;
  setStep: (step: AppStep) => void;
}

const tabs: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'freelancing', label: 'Freelance', icon: Video },
];

export function OwnerDashboard({ user, onLogout, setStep }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const crew = useCrewBook();

  if (crew.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 mb-3 animate-pulse">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-xs text-neutral-500">Loading your studio...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-[10px] text-neutral-500">Owner Dashboard</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {activeTab === 'calendar' && (
          <CalendarView
            bookings={crew.data.bookings}
            freelancing={crew.data.freelancing}
            team={crew.data.team}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            onTogglePayment={(memberId) => {
              const member = crew.data.team.find((t) => t.id === memberId);
              if (member) {
                crew.updateTeamMember(memberId, {
                  payment_status: member.payment_status === 'Paid' ? 'Pending' : 'Paid',
                });
              }
            }}
          />
        )}
        {activeTab === 'bookings' && (
          <BookingsManager
            bookings={crew.data.bookings}
            team={crew.data.team}
            onAddBooking={crew.addBooking}
            onUpdateBooking={crew.updateBooking}
            onDeleteBooking={crew.deleteBooking}
            onAddInstallment={crew.addInstallment}
          />
        )}
        {activeTab === 'team' && (
          <TeamView
            team={crew.data.team}
            onAddMember={crew.addTeamMember}
            onUpdateMember={crew.updateTeamMember}
            onDeleteMember={crew.deleteTeamMember}
          />
        )}
        {activeTab === 'finance' && (
          <FinanceView bookings={crew.data.bookings} freelancing={crew.data.freelancing} />
        )}
        {activeTab === 'freelancing' && (
          <FreelancingView
            freelancing={crew.data.freelancing}
            team={crew.data.team}
            onAdd={crew.addFreelance}
            onUpdate={crew.updateFreelance}
            onDelete={crew.deleteFreelance}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-neutral-900 border-t border-neutral-800 flex justify-around py-2.5 px-1 z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center text-[10px] transition-colors px-2 py-1 rounded-lg ${
                active ? 'text-amber-400 font-bold' : 'text-neutral-500'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-amber-400' : 'text-neutral-600'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
