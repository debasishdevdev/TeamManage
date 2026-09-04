import { useState } from 'react';
import { Plus, X, Pencil, Save, Trash2, MessageCircle, Camera, Calendar, IndianRupee, User } from 'lucide-react';
import type { FreelanceJob, TeamMember } from '@/types';

interface FreelancingViewProps {
  freelancing: FreelanceJob[];
  team: TeamMember[];
  onAdd: (job: Omit<FreelanceJob, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<FreelanceJob>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyForm = { date: '', name: '', equipment: '', paid: '', unpaid: '', assigned_team: '' };

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0].slice(-2)}`;
}

export function FreelancingView({ freelancing, team, onAdd, onUpdate, onDelete }: FreelancingViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FreelanceJob>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Studio/Client name is required!');
    if (!form.date) return alert('Date is required!');
    
    try {
      setIsSubmitting(true);
      await onAdd({
        date: form.date,
        name: form.name.trim(),
        equipment: form.equipment.trim(),
        paid: Number(form.paid) || 0,
        unpaid: Number(form.unpaid) || 0,
        assigned_team: form.assigned_team,
      });
      setForm(emptyForm);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error adding freelance job:', error);
      alert('Failed to add freelance job: ' + (error.message || 'Unknown database error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (f: FreelanceJob) => {
    setEditingId(f.id);
    setEditForm({
      date: f.date || '',
      name: f.name,
      equipment: f.equipment,
      paid: f.paid,
      unpaid: f.unpaid,
      assigned_team: f.assigned_team,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      setIsUpdating(true);
      await onUpdate(editingId, {
        date: editForm.date || null,
        name: editForm.name || '',
        equipment: editForm.equipment || '',
        paid: Number(editForm.paid) || 0,
        unpaid: Number(editForm.unpaid) || 0,
        assigned_team: editForm.assigned_team || '',
      });
      setEditingId(null);
      setEditForm({});
    } catch (error: any) {
      console.error('Error updating freelance job:', error);
      alert('Failed to update: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const sendWhatsApp = (f: FreelanceJob) => {
    const formattedDate = formatDate(f.date);
    const msg = `Hello ${f.assigned_team || 'Team'}, you have a freelance assignment on ${formattedDate} for ${f.name} using ${f.equipment || 'Standard Kit'}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-amber-400 text-sm">Freelancing Bookings</h3>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
          className="flex items-center gap-1 text-xs bg-amber-500 text-neutral-950 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Freelance'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Studio / Client Name *</label>
            <input
              type="text"
              placeholder="Debashish"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Equipment / Camera</label>
            <input
              type="text"
              placeholder="Sony FX3"
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Paid (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={form.paid}
                onChange={(e) => setForm({ ...form, paid: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 mb-1 block">Unpaid (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={form.unpaid}
                onChange={(e) => setForm({ ...form, unpaid: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Assign Team Member</label>
            <select
              value={form.assigned_team}
              onChange={(e) => setForm({ ...form, assigned_team: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="">Select team member</option>
              {team.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-amber-500 text-neutral-950 font-bold p-2.5 rounded-lg text-xs hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Freelance Work'}
          </button>
        </form>
      )}

      {freelancing.length === 0 && !showForm && (
        <p className="text-[11px] text-neutral-600 bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
          No freelance bookings yet. Click "Add Freelance" to create one.
        </p>
      )}

      {freelancing.map((f) => (
        <div key={f.id} className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
          {editingId === f.id ? (
            <div className="space-y-2">
              <input
                type="date"
                value={editForm.date || ''}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Equipment"
                value={editForm.equipment || ''}
                onChange={(e) => setEditForm({ ...editForm, equipment: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Paid"
                  value={editForm.paid ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, paid: Number(e.target.value) })}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
                />
                <input
                  type="number"
                  placeholder="Unpaid"
                  value={editForm.unpaid ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, unpaid: Number(e.target.value) })}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>
              <select
                value={editForm.assigned_team || ''}
                onChange={(e) => setEditForm({ ...editForm, assigned_team: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              >
                <option value="">Select team member</option>
                {team.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button 
                  onClick={saveEdit} 
                  disabled={isUpdating}
                  className="bg-emerald-500 text-black px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-3 h-3" /> {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditingId(null)} className="bg-neutral-700 text-white px-3 py-2 rounded-lg text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-bold text-white tracking-wide">{formatDate(f.date)} — {f.name}</p>
                  {f.equipment && <p className="text-[10px] text-neutral-500 flex items-center gap-1"><Camera className="w-3 h-3" /> {f.equipment}</p>}
                  {f.assigned_team && <p className="text-[10px] text-amber-400 flex items-center gap-1"><User className="w-3 h-3" /> {f.assigned_team}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => startEdit(f)} className="text-amber-400 bg-amber-500/10 px-2 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this freelance entry?')) {
                        try {
                          await onDelete(f.id);
                        } catch (error: any) {
                          alert('Failed to delete: ' + (error.message || 'Unknown error'));
                        }
                      }
                    }}
                    className="text-red-400 bg-red-500/10 px-2 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                <div className="flex gap-3 text-[11px]">
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{(f.paid || 0).toLocaleString('en-IN')} paid</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{(f.unpaid || 0).toLocaleString('en-IN')} unpaid</span>
                </div>
                <button
                  onClick={() => sendWhatsApp(f)}
                  className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-600/30 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
