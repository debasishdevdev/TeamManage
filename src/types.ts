export interface Installment {
  date: string;
  amount: number;
}

export interface Booking {
  id: string;
  client_name: string;
  event_type: string;
  event_date: string | null;
  event_time: string;
  location: string;
  budget: number;
  received: number;
  notes: string;
  assigned_team: string[];
  status: string;
  installments: Installment[];
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  whatsapp: string;
  role: string;
  payment_status: string;
  created_at: string;
}

export interface FreelanceJob {
  id: string;
  date: string | null;
  name: string;
  equipment: string;
  paid: number;
  unpaid: number;
  assigned_team: string;
  created_at: string;
}

export type UserRole = 'owner' | 'member';

export interface CurrentUser {
  name: string;
  role: UserRole;
  whatsapp: string;
}

export type AppStep = 'splash' | 'login' | 'otp_verify' | 'owner_dash' | 'member_dash';
export type TabId = 'calendar' | 'bookings' | 'team' | 'finance' | 'freelancing';
