import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, IndianRupee } from 'lucide-react';
import type { Booking, FreelanceJob } from '@/types';

interface FinanceViewProps {
  bookings: Booking[];
  freelancing: FreelanceJob[];
}

export function FinanceView({ bookings, freelancing }: FinanceViewProps) {
  const totals = useMemo(() => {
    const totalBudget = bookings.reduce((sum, b) => sum + (b.budget || 0), 0);
    const totalReceived = bookings.reduce((sum, b) => sum + (b.received || 0), 0);
    const totalUnpaid = totalBudget - totalReceived;
    const freelancePaid = freelancing.reduce((sum, f) => sum + (f.paid || 0), 0);
    const freelanceUnpaid = freelancing.reduce((sum, f) => sum + (f.unpaid || 0), 0);
    return { totalBudget, totalReceived, totalUnpaid, freelancePaid, freelanceUnpaid };
  }, [bookings, freelancing]);

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-amber-400 text-sm">Studio Financial Overview</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-neutral-500">Total Received</span>
          </div>
          <p className="text-xl font-bold text-emerald-400 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {totals.totalReceived.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-neutral-500">Total Unpaid</span>
          </div>
          <p className="text-xl font-bold text-amber-400 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {totals.totalUnpaid.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-[10px] text-neutral-500">Total Budget</span>
          </div>
          <p className="text-xl font-bold text-sky-400 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {totals.totalBudget.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-[10px] text-neutral-500">Freelance Due</span>
          </div>
          <p className="text-xl font-bold text-violet-400 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {totals.freelanceUnpaid.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Booking Breakdown</h4>
        {bookings.length === 0 ? (
          <p className="text-[11px] text-neutral-600 bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">No bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-1">
              <p className="font-bold text-white text-sm">{b.client_name}</p>
              {b.event_type && <span className="inline-block text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md">{b.event_type}</span>}
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-emerald-400 font-semibold">Budget: ₹{b.budget.toLocaleString('en-IN')}</span>
                <span className="text-neutral-400">Received: ₹{(b.received || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-amber-400 font-semibold">Pending: ₹{((b.budget || 0) - (b.received || 0)).toLocaleString('en-IN')}</span>
                {b.installments && b.installments.length > 0 && (
                  <span className="text-neutral-500">{b.installments.length} installment{b.installments.length > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {freelancing.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Freelance Breakdown</h4>
          {freelancing.map((f) => (
            <div key={f.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800 space-y-1">
              <p className="font-bold text-white text-sm">{f.name}</p>
              {f.equipment && <p className="text-[10px] text-neutral-500">{f.equipment}</p>}
              <div className="flex gap-3 text-[11px]">
                <span className="text-emerald-400 font-semibold">Paid: ₹{(f.paid || 0).toLocaleString('en-IN')}</span>
                <span className="text-amber-400 font-semibold">Unpaid: ₹{(f.unpaid || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
