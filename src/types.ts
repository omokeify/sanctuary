export type PressureLevel = 'Gentle' | 'Medium' | 'Firm' | 'Deep';

export interface ClientPreferences {
  pressure_level: PressureLevel;
  allergies?: string;
  areas_to_avoid?: string;
  focus_areas?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferences: ClientPreferences;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  tagline: string;
  description: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  image_url: string;
  active: boolean;
  category: 'Massage' | 'Bodywork' | 'Therapeutic' | 'Specialty';
  benefits: string[];
  recommended_for: string;
}

export interface Therapist {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  years_experience: number;
  specialties: string[];
  active: boolean;
}

export interface TherapistService {
  therapist_id: string;
  service_id: string;
}

export interface Availability {
  id: string;
  therapist_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string;  // "09:00"
  end_time: string;    // "17:00"
  break_start?: string; // e.g. "13:00"
  break_end?: string;   // e.g. "14:00"
}

export interface TimeOff {
  id: string;
  therapist_id: string;
  date: string;        // "YYYY-MM-DD"
  start_time: string;  // "00:00" or specific time
  end_time: string;    // "23:59" or specific time
  reason: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  client_id: string;
  service_id: string;
  therapist_id: string;
  date: string;        // "YYYY-MM-DD"
  start_time: string;  // "10:00"
  end_time: string;    // "11:00"
  status: BookingStatus;
  deposit_paid: number;
  total_price: number;
  payment_method: 'deposit_stripe' | 'full_stripe' | 'in_person';
  payment_status: 'paid' | 'deposit_only' | 'pending' | 'refunded';
  stripe_payment_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  notes?: string;
  client_preferences?: ClientPreferences;
  created_at: string;
  cancellation_reason?: string;
}

export interface TimeSlot {
  time: string;       // "09:00"
  end_time: string;   // "10:00"
  available: boolean;
  therapist_id: string;
  therapist_name: string;
  reason_unavailable?: string;
}

export interface NotificationLog {
  id: string;
  type: 'email' | 'sms';
  provider: 'Resend' | 'Twilio';
  recipient: string;
  subject: string;
  body: string;
  status: 'delivered' | 'sent' | 'queued';
  created_at: string;
  booking_id: string;
}

export type AppView = 
  | 'catalog' 
  | 'service_detail' 
  | 'booking_flow' 
  | 'confirmation' 
  | 'client_dashboard' 
  | 'admin_dashboard';
