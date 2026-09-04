import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TeamViewProps {
  data?: any;
  onUpdate?: () => void;
}

export function TeamView({ data, onUpdate }: TeamViewProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState('Photographer');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Local team list state taaki turant screen update ho
  const [teamList, setTeamList] = useState<any[]>([]);

  useEffect(() => {
    if (data?.team) {
      setTeamList(data.team);
    }
  }, [data]);

  // Random Unique Team ID Generator (e.g. CRW-4821)
  const generateTeamId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CRW-${randomNum}`;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const newTeamId = generateTeamId();
    const newMemberData = {
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      role: role,
      team_id: newTeamId,
      payment_status: 'Pending',
    };

    try {
      const { data: insertedData, error } = await supabase.from('team').insert([newMemberData]).select();

      if (error) throw error;

      // Agar database se returned data mile ya local insert karna ho
      const addedMember = insertedData ? insertedData[0] : { id: Date.now().toString(), ...newMemberData };

      // Turant local list mein add karein taaki zero na dikhe
      setTeamList((prev) => [addedMember, ...prev]);

      // Form clear karein
      setName('');
      setWhatsapp('');
      setRole('Photographer');

      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert(err.message || 'Error adding team member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    // UI se turant hata dein
    setTeamList((prev) => prev.filter((m) => m.id !== id));

    try {
      const { error } = await supabase.from('team').delete().eq('id', id);
      if (!error && onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePaymentStatus = async (member: any) => {
    const newStatus = member.payment_status === 'Paid' ? 'Pending' : 'Paid';
    
    // UI mein turant status change karein
    setTeamList((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, payment_status: newStatus } : m))
    );

    try {
      const { error } = await supabase
        .from('team')
        .update({ payment_status: newStatus })
        .eq('id', member.id);
      if (!error && onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (teamId: string) => {
    if (!teamId) return;
    navigator.clipboard.writeText(teamId);
    setCopiedId(teamId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 text-white">
      {/* Add Member Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Add Team Member
        </h3>
        <form onSubmit={handleAddMember} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Photographer">Photographer</option>
              <option value="Cinematographer">Cinematographer</option>
              <option value="Editor">Editor</option>
              <option value="Drone Pilot">Drone Pilot</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {loading ? 'Adding...' : 'Add Team Member'}
          </button>
        </form>
      </div>

      {/* Team List with Count, Member Name, Unique Code, and Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white px-1">Team List ({teamList.length})</h3>
        {teamList.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-8">No team members added yet.</p>
        ) : (
          teamList.map((member: any) => (
            <div key={member.id || member.team_id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{member.name}</h4>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-700">
                      {member.role || 'Member'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{member.whatsapp || 'No WhatsApp'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePaymentStatus(member)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      member.payment_status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {member.payment_status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {member.payment_status || 'Pending'}
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Unique Code Display & Copy Button */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Login ID Code:</span>
                  <span className="bg-neutral-950 text-amber-400 font-mono font-bold px-2.5 py-1 rounded border border-amber-500/30 tracking-wider">
                    {member.team_id || 'CRW-GENERATE'}
                  </span>
                  {member.team_id && (
                    <button
                      onClick={() => copyToClipboard(member.team_id)}
                      className="text-neutral-400 hover:text-white transition-colors p-1 flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded"
                      title="Copy Unique Code"
                    >
                      {copiedId === member.team_id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> <span className="text-[10px]">Copy Code</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${member.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  Status: {member.payment_status || 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
