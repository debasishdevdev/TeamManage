import { useState } from 'react';
import { Plus, X, MapPin, Calendar, IndianRupee, Users, Pencil, Save, Trash2, Clock, FileText } from 'lucide-react';
import type { Booking, TeamMember, Installment } from '@/types';

interface BookingsManagerProps {
  bookings: Booking[];
  team: TeamMember[];
  onAddBooking: (booking: Omit<Booking, 'id' | 'created_at'>) => Promise<void>;
  onUpdateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
  onAddInstallment: (bookingId: string, installment: Installment) => Promise<void>;
}

const emptyForm = {
  client_name: '',
  event_type: '',
  event_date: '',
  event_time: '',
  location: '',
  budget: 0,
  received: 0,
  notes: '',
  assigned_team: [] as string[],
  status: 'Confirmed',
  installments: [] as Installment[],
};

export function BookingsManager({ bookings, team, onAddBooking, onUpdateBooking, onDeleteBooking, onAddInstallment }: BookingsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});
  const [paymentInput, setPaymentInput] = useState({ amount: '', date: '' });
  const [activePaymentFor, setActivePaymentFor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim()) return alert('Client name is required!');
    if (!form.event_date) return alert('Event date is required!');
    
    try {
      setIsSubmitting(true);
      await onAddBooking(form);
      setForm(emptyForm);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error adding booking:', error);
      alert('Failed to save booking: ' + (error.message || 'Unknown database error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (b: Booking) => {
    setEditingId(b.id);
    setEditForm(b);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await onUpdateBooking(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (error: any) {
      console.error('Error updating booking:', error);
      alert('Failed to update: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddInstallment = async (bookingId: string) => {
    if (!paymentInput.amount || !paymentInput.date) return alert('Enter both amount and payment date!');
    try {
      await onAddInstallment(bookingId, { date: paymentInput.date, amount: Number(paymentInput.amount) });
      setPaymentInput({ amount: '', date: '' });
      setActivePaymentFor(null);
    } catch (error: any) {
      console.error('Error adding installment:', error);
      alert('Failed to add installment: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleTeamMember = (name: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-amber-400 text-sm">Manage Bookings</h3>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
          className="flex items-center gap-1 text-xs bg-amber-500 text-neutral-950 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Booking'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Client Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul & Priya"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Event Type</label>
              <input
                type="text"
                placeholder="Wedding"
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Event Date *</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Event Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                value={form.event_time}
                onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Location</label>
              <input
                type="text"
                placeholder="Jaipur Palace"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Budget (₹)</label>
              <input
                type="number"
                placeholder="150000"
                value={form.budget || ''}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Received (₹)</label>
              <input
                type="number"
                placeholder="50000"
                value={form.received || ''}
                onChange={(e) => setForm({ ...form, received: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Notes</label>
            <textarea
              placeholder="Special instructions..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Assign Team Members</label>
            <div className="flex flex-wrap gap-1.5">
              {team.length === 0 ? (
                <p className="text-[10px] text-neutral-600">No team members yet. Add some in the Team tab.</p>
              ) : (
                team.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTeamMember(t.name, form.assigned_team, (v) => setForm({ ...form, assigned_team: v }))}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                      form.assigned_team.includes(t.name)
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {t.name}
                  </button>
                ))
              )}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-amber-500 text-neutral-950 font-bold p-2.5 rounded-lg text-xs hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Create Booking'}
          </button>
        </form>
      )}

      {bookings.length === 0 && !showForm && (
        <p className="text-[11px] text-neutral-600 bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
          No bookings yet. Click "Add Booking" to create one.
        </p>
      )}

      {bookings.map((b) => (
        <div key={b.id} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3">
          {editingId === b.id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.client_name || ''}
                onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="date"
                value={editForm.event_date || ''}
                onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Event Type"
                value={editForm.event_type || ''}
                onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Location"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Time"
                value={editForm.event_time || ''}
                onChange={(e) => setEditForm({ ...editForm, event_time: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="number"
                placeholder="Budget"
                value={editForm.budget ?? ''}
                onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="bg-emerald-500 text-black px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1">
                  <Save className="w-3 h-3" /> Save
                </button>
                <button onClick={() => setEditingId(null)} className="bg-neutral-700 text-white px-3 py-2 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{b.client_name}</p>
                  {b.event_type && <span className="inline-block text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">{b.event_type}</span>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">
                    {b.event_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.event_date}</span>}
                    {b.event_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.event_time}</span>}
                    {b.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.location}</span>}
                  </div>
                  {b.notes && <p className="text-[10px] text-neutral-500 flex items-start gap-1"><FileText className="w-3 h-3 mt-0.5 shrink-0" /> {b.notes}</p>}
                  {b.assigned_team && b.assigned_team.length > 0 && (
                    <div className="flex items-start gap-1">
                      <Users className="w-3 h-3 text-neutral-500 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {b.assigned_team.map((name) => (
                          <span key={name} className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">{name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-1 text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{b.budget.toLocaleString('en-IN')} budget</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{(b.received || 0).toLocaleString('en-IN')} received</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => startEdit(b)} className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 hover:bg-amber-500/20 transition-colors">
                    <Pencil className="w-2.5 h-2.5" /> Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this booking?')) onDeleteBooking(b.id); }}
                    className="text-red-400 bg-red-500/10 px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-neutral-400 font-bold">Payment Installments</p>
                  <button
                    onClick={() => setActivePaymentFor(activePaymentFor === b.id ? null : b.id)}
                    className="text-[10px] text-amber-400 hover:text-amber-300"
                  >
                    {activePaymentFor === b.id ? 'Cancel' : '+ Add'}
                  </button>
                </div>
                {b.installments && b.installments.length > 0 ? (
                  b.installments.map((inst, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-neutral-300 bg-neutral-800/50 px-3 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {inst.date}</span>
                      <span className="text-emerald-400 font-bold">₹{inst.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-neutral-600">No installments recorded.</p>
                )}

                {activePaymentFor === b.id && (
                  <div className="flex gap-1.5 mt-2">
                    <input
                      type="date"
                      value={paymentInput.date}
                      onChange={(e) => setPaymentInput({ ...paymentInput, date: e.target.value })}
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={paymentInput.amount}
                      onChange={(e) => setPaymentInput({ ...paymentInput, amount: e.target.value })}
                      className="w-24 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => handleAddInstallment(b.id)}
                      className="bg-amber-500 text-neutral-950 font-bold rounded-lg text-[10px] px-3 hover:bg-amber-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
