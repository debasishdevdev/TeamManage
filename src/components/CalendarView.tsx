import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import type { Booking, FreelanceJob, TeamMember } from '@/types';

interface CalendarViewProps {
  bookings: Booking[];
  freelancing: FreelanceJob[];
  team: TeamMember[];
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  memberName?: string | null;
  onTogglePayment?: (memberId: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0].slice(-2)}`;
}

interface EventTeamMember {
  name: string;
  memberId: string;
  paymentStatus: string;
}

interface CalendarEvent {
  id: string;
  date: string | null;
  titleDisplay: string;
  subtitle: string;
  status: 'upcoming' | 'completed';
  teamMembers: EventTeamMember[];
}

export function CalendarView({ bookings, freelancing, team, currentDate, setCurrentDate, memberName, onTogglePayment }: CalendarViewProps) {
  const allBookedDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((b) => { if (b.event_date) dates.add(b.event_date); });
    freelancing.forEach((f) => { if (f.date) dates.add(f.date); });
    return dates;
  }, [bookings, freelancing]);

  const todayStr = new Date().toISOString().split('T')[0];

  const teamMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    team.forEach((t) => map.set(t.name, t));
    return map;
  }, [team]);

  const allEvents: CalendarEvent[] = useMemo(() => {
    const filteredBookings = memberName
      ? bookings.filter((b) => b.assigned_team.includes(memberName))
      : bookings;
    const filteredFreelancing = memberName
      ? freelancing.filter((f) => f.assigned_team === memberName)
      : freelancing;

    return [
      ...filteredBookings.map((b) => {
        const teamMembers: EventTeamMember[] = b.assigned_team.map((name) => {
          const member = teamMap.get(name);
          return { name, memberId: member?.id || '', paymentStatus: member?.payment_status || 'Pending' };
        });
        return {
          id: 'b-' + b.id,
          date: b.event_date,
          titleDisplay: `${formatDate(b.event_date)} — ${b.client_name} — ${b.event_type}`,
          subtitle: `📍 ${b.location} • ⏰ ${b.event_time || 'All Day'}`,
          status: (b.event_date && b.event_date >= todayStr ? 'upcoming' : 'completed') as 'upcoming' | 'completed',
          teamMembers,
        };
      }),
      ...filteredFreelancing.map((f) => {
        const teamMembers: EventTeamMember[] = f.assigned_team
          ? (() => {
              const member = teamMap.get(f.assigned_team);
              return [{ name: f.assigned_team, memberId: member?.id || '', paymentStatus: member?.payment_status || 'Pending' }];
            })()
          : [];
        return {
          id: 'f-' + f.id,
          date: f.date,
          titleDisplay: `${formatDate(f.date)} — ${f.name} — ${f.equipment || 'No Camera'}`,
          subtitle: 'Freelance Work',
          status: (f.date && f.date >= todayStr ? 'upcoming' : 'completed') as 'upcoming' | 'completed',
          teamMembers,
        };
      }),
    ].sort((a, b) => {
      const aDate = a.date || '9999-12-31';
      const bDate = b.date || '9999-12-31';
      return aDate.localeCompare(bDate);
    });
  }, [bookings, freelancing, memberName, todayStr, teamMap]);

  const upcomingEvents = allEvents.filter((e) => e.status === 'upcoming');
  const completedEvents = allEvents.filter((e) => e.status === 'completed');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderTeamMemberBadges = (teamMembers: EventTeamMember[], dimmed: boolean) => {
    if (teamMembers.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {teamMembers.map((tm) => {
          const isPaid = tm.paymentStatus === 'Paid';
          const badge = (
            <span
              className={`text-[10px] px-2 py-1 rounded-lg font-bold flex items-center gap-1 ${
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              } ${dimmed ? 'opacity-80' : ''}`}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> {tm.name}: Paid ✅
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> {tm.name}: Pending ⏳
                </>
              )}
            </span>
          );
          if (onTogglePayment && tm.memberId) {
            return (
              <button
                key={tm.memberId}
                onClick={() => onTogglePayment(tm.memberId)}
                className={`transition-colors hover:opacity-80 ${dimmed ? 'opacity-70' : ''}`}
              >
                {badge}
              </button>
            );
          }
          return (
            <span key={tm.memberId || tm.name} className={dimmed ? 'opacity-70' : ''}>
              {badge}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="text-amber-400 text-xs px-2.5 py-1.5 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-sm text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="text-amber-400 text-xs px-2.5 py-1.5 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-neutral-500 text-center mb-3">Booked dates highlighted in green</p>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-neutral-600 text-[10px] font-semibold py-1">{d}</span>
          ))}
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isBooked = allBookedDates.has(formattedDate);
            const isToday = formattedDate === todayStr;

            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs transition-all ${
                  isBooked
                    ? 'bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-600/20 border border-emerald-400'
                    : isToday
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                    : 'bg-neutral-800/40 text-neutral-400'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Upcoming Bookings</h3>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-[11px] text-neutral-600 bg-neutral-900 p-3 rounded-xl border border-neutral-800">No upcoming bookings.</p>
        ) : (
          upcomingEvents.map((ev) => (
            <div key={ev.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 hover:border-neutral-700 transition-colors">
              <p className="font-bold text-white text-sm">{ev.titleDisplay}</p>
              <p className="text-neutral-500 text-[10px]">{ev.subtitle}</p>
              {renderTeamMemberBadges(ev.teamMembers, false)}
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed Events</h3>
        </div>
        {completedEvents.length === 0 ? (
          <p className="text-[11px] text-neutral-600 bg-neutral-900 p-3 rounded-xl border border-neutral-800">No completed bookings yet.</p>
        ) : (
          completedEvents.map((ev) => (
            <div key={ev.id} className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800/60 space-y-1.5 opacity-70">
              <p className="font-bold text-neutral-300 text-sm">{ev.titleDisplay}</p>
              <p className="text-neutral-600 text-[10px]">{ev.subtitle}</p>
              {renderTeamMemberBadges(ev.teamMembers, true)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
