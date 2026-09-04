import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking, TeamMember, FreelanceJob, Installment } from '@/types';

export interface CrewBookData {
  bookings: Booking[];
  team: TeamMember[];
  freelancing: FreelanceJob[];
}

export function useCrewBook() {
  const [data, setData] = useState<CrewBookData>({ bookings: [], team: [], freelancing: [] });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [bookingsRes, teamRes, freelancingRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('team').select('*').order('created_at', { ascending: false }),
      supabase.from('freelancing').select('*').order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.error) throw bookingsRes.error;
    if (teamRes.error) throw teamRes.error;
    if (freelancingRes.error) throw freelancingRes.error;

    setData({
      bookings: bookingsRes.data as Booking[],
      team: teamRes.data as TeamMember[],
      freelancing: freelancingRes.data as FreelanceJob[],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll().catch((err) => {
      console.error('Failed to load data:', err);
      setLoading(false);
    });
  }, [fetchAll]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  const addBooking = useCallback(async (booking: Omit<Booking, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('bookings').insert(booking);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const updateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    const { error } = await supabase.from('bookings').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const deleteBooking = useCallback(async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const addInstallment = useCallback(async (bookingId: string, installment: Installment) => {
    const booking = data.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const installments = [...(booking.installments || []), installment];
    const received = installments.reduce((sum, i) => sum + i.amount, 0);
    const { error } = await supabase
      .from('bookings')
      .update({ installments, received })
      .eq('id', bookingId);
    if (error) throw error;
    await fetchAll();
  }, [data.bookings, fetchAll]);

  const addTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('team').insert(member);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const updateTeamMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    const { error } = await supabase.from('team').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const deleteTeamMember = useCallback(async (id: string) => {
    const { error } = await supabase.from('team').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const addFreelance = useCallback(async (job: Omit<FreelanceJob, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('freelancing').insert(job);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const updateFreelance = useCallback(async (id: string, updates: Partial<FreelanceJob>) => {
    const { error } = await supabase.from('freelancing').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const deleteFreelance = useCallback(async (id: string) => {
    const { error } = await supabase.from('freelancing').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    refresh,
    addBooking,
    updateBooking,
    deleteBooking,
    addInstallment,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addFreelance,
    updateFreelance,
    deleteFreelance,
  };
}
