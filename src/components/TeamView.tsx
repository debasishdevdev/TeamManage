import { useState } from 'react';
import { Plus, X, Pencil, Save, Trash2, Phone, Briefcase } from 'lucide-react';
import type { TeamMember } from '@/types';

interface TeamViewProps {
  team: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id' | 'created_at'>) => Promise<void>;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export function TeamView({ team, onAddMember, onUpdateMember, onDeleteMember }: TeamViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', whatsapp: '', role: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Name is required!');
    await onAddMember({
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      role: form.role.trim(),
      payment_status: 'Pending',
    });
    setForm({ name: '', whatsapp: '', role: '' });
    setShowForm(false);
  };

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditForm(m);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await onUpdateMember(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-amber-400 text-sm">Team Members</h3>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ name: '', whatsapp: '', role: '' }); }}
          className="flex items-center gap-1 text-xs bg-amber-500 text-neutral-950 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Name *</label>
            <input
              type="text"
              placeholder="Amit Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">WhatsApp Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 mb-1 block">Role</label>
            <input
              type="text"
              placeholder="Cinematographer"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <button type="submit" className="w-full bg-amber-500 text-neutral-950 font-bold p-2.5 rounded-lg text-xs hover:bg-amber-600 transition-colors">
            Add Team Member
          </button>
        </form>
      )}

      {team.length === 0 && !showForm && (
        <p className="text-[11px] text-neutral-600 bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
          No team members yet. Click "Add Member" to add one.
        </p>
      )}

      {team.map((m) => (
        <div key={m.id} className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
          {editingId === m.id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                value={editForm.whatsapp || ''}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs"
              />
              <input
                type="text"
                value={editForm.role || ''}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
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
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">{m.name}</p>
                <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                  {m.role && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {m.role}</span>}
                  {m.whatsapp && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.whatsapp}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateMember(m.id, { payment_status: m.payment_status === 'Paid' ? 'Pending' : 'Paid' })}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors ${
                    m.payment_status === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {m.payment_status === 'Paid' ? 'Paid' : 'Pending'}
                </button>
                <button onClick={() => startEdit(m)} className="text-amber-400 bg-amber-500/10 px-2 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => { if (confirm('Remove this team member?')) onDeleteMember(m.id); }}
                  className="text-red-400 bg-red-500/10 px-2 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
