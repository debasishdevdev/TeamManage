import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CrewData, CurrentUser } from '@/types';

export function useCrewBook(currentUser: CurrentUser | null) {
  const [data, setData] = useState<CrewData>({
    bookings: [],
    freelancing: [],
    team: [],
    finance: { income: [], expenses: [] }
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (currentUser.role === 'owner') {
        // OWNER: Fetch only data belonging to this owner's email
        const ownerEmail = currentUser.email;

        const [bookingsRes, freelancingRes, teamRes, financeRes] = await Promise.all([
          supabase.from('bookings').select('*').eq('owner_email', ownerEmail),
          supabase.from('freelancing').select('*').eq('owner_email', ownerEmail),
          supabase.from('team').select('*').eq('owner_email', ownerEmail),
          supabase.from('finance').select('*').eq('owner_email', ownerEmail),
        ]);

        setData({
          bookings: bookingsRes.data || [],
          freelancing: freelancingRes.data || [],
          team: teamRes.data || [],
          finance: {
            income: financeRes.data?.filter(f => f.type === 'income') || [],
            expenses: financeRes.data?.filter(f => f.type === 'expense') || []
          }
        });

      } else if (currentUser.role === 'member') {
        // MEMBER: Fetch only team info and bookings assigned to this specific member name/ID
        const memberName = currentUser.name;

        // Fetch all teams to find owner or global team list, or match by team_id
        const teamRes = await supabase.from('team').select('*');
        const allBookingsRes = await supabase.from('bookings').select('*');

        // Filter bookings where this member's name is in assigned_team array or string
        const myBookings = (allBookingsRes.data || []).filter((b: any) => {
          if (Array.isArray(b.assigned_team)) {
            return b.assigned_team.some((name: string) => name.trim().toLowerCase() === memberName.trim().toLowerCase());
          }
          return false;
        });

        setData({
          bookings: myBookings,
          freelancing: [], // Members don't see freelancing
          team: teamRes.data || [],
          finance: { income: [], expenses: [] } // Members have zero access to finance
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  return { data, loading, refetch: fetchData };
}
