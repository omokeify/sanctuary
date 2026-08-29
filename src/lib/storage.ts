import { Availability, Booking, Client, NotificationLog, Service, Therapist, TherapistService, TimeOff } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Signature Swedish & Botanical Aromatherapy',
    tagline: 'Gentle, flowing strokes infused with custom organic botanicals.',
    description: 'A deeply restorative full-body treatment utilizing long, rhythmic gliding strokes, gentle kneading, and warm organic essential oils tailored to soothe muscle tension and quiet the nervous system.',
    duration_minutes: 60,
    price: 120,
    deposit_amount: 30,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80',
    active: true,
    category: 'Massage',
    benefits: ['Lowers cortisol & mental fatigue', 'Improves blood circulation', 'Promotes restful deep sleep'],
    recommended_for: 'First-time visitors, general stress relief, and total mental reset.'
  },
  {
    id: 'srv-2',
    name: 'Deep Tissue & Neuromuscular Release',
    tagline: 'Targeted slow pressure to release chronic tension patterns.',
    description: 'Focused, deliberate pressure addressing the deeper layers of muscle tissue, fascia, and chronic trigger points. Ideal for desk postural strain, athletes, and persistent neck or lower back tightness.',
    duration_minutes: 90,
    price: 165,
    deposit_amount: 40,
    image_url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80',
    active: true,
    category: 'Therapeutic',
    benefits: ['Releases stubborn muscle knots', 'Restores joint mobility', 'Alleviates chronic back & neck aches'],
    recommended_for: 'Active athletes, desk workers, and those with chronic postural tightness.'
  },
  {
    id: 'srv-3',
    name: 'Warm Himalayan Salt Stone Ritual',
    tagline: 'Warmed mineral-rich stones gliding across tired muscles.',
    description: 'Hand-carved Himalayan pink salt stones are heated and bathed in jojoba oil to melt away stubborn stiffness while replenishing 84 natural minerals to the skin and grounding your energy.',
    duration_minutes: 75,
    price: 145,
    deposit_amount: 35,
    image_url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80',
    active: true,
    category: 'Specialty',
    benefits: ['Deep thermo-therapy relief', 'Negative ion balance & detoxification', 'Exfoliating skin nourishment'],
    recommended_for: 'Those feeling fatigued, chilled, or seeking comforting deep warmth.'
  },
  {
    id: 'srv-4',
    name: 'Prenatal Nurture & Body Balance',
    tagline: 'Specialized supportive side-lying comfort for expectant mothers.',
    description: 'Designed exclusively for clients in their 2nd or 3rd trimester. Using supportive ergonomic body cushions, gentle pressure eases sciatic discomfort, leg swelling, and low back fatigue.',
    duration_minutes: 60,
    price: 130,
    deposit_amount: 35,
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
    active: true,
    category: 'Specialty',
    benefits: ['Alleviates pregnancy sciatic strain', 'Reduces water retention & swollen feet', 'Safe soothing nervous system reset'],
    recommended_for: 'Expectant mothers past their first trimester.'
  }
];

export const INITIAL_THERAPISTS: Therapist[] = [
  {
    id: 'th-1',
    name: 'Elena Rostova, LMT',
    title: 'Lead Neuromuscular Therapist & Clinical Specialist',
    bio: 'With over 11 years of clinical bodywork practice, Elena blends Swedish flow with orthopedic friction and myofascial unwinding. She specializes in chronic neck tension and rotator cuff rehabilitation.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    years_experience: 11,
    specialties: ['Deep Tissue', 'Trigger Point Therapy', 'Postural Alignment'],
    active: true
  },
  {
    id: 'th-2',
    name: 'Marcus Chen, LMT',
    title: 'Sports Recovery & Myofascial Specialist',
    bio: 'Former university athletic trainer turned licensed bodyworker. Marcus incorporates passive stretching, heat therapy, and rhythmic pressure to optimize movement and speed recovery.',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    years_experience: 8,
    specialties: ['Sports Recovery', 'Himalayan Stones', 'Active Isolated Stretching'],
    active: true
  },
  {
    id: 'th-3',
    name: 'Maya Lindqvist, LMT',
    title: 'Holistic Bodyworker & Certified Prenatal Practitioner',
    bio: 'Maya brings a serene, meditative touch honed through international holistic training. Certified in prenatal care and lymphatic support, her sessions are deeply calming and restorative.',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    years_experience: 9,
    specialties: ['Botanical Aromatherapy', 'Prenatal Care', 'Lymphatic Flow'],
    active: true
  }
];

export const INITIAL_THERAPIST_SERVICES: TherapistService[] = [
  // Elena offers Deep Tissue, Swedish, Himalayan Stones
  { therapist_id: 'th-1', service_id: 'srv-1' },
  { therapist_id: 'th-1', service_id: 'srv-2' },
  { therapist_id: 'th-1', service_id: 'srv-3' },
  // Marcus offers Deep Tissue, Swedish, Himalayan Stones
  { therapist_id: 'th-2', service_id: 'srv-1' },
  { therapist_id: 'th-2', service_id: 'srv-2' },
  { therapist_id: 'th-2', service_id: 'srv-3' },
  // Maya offers Swedish, Himalayan Stones, Prenatal
  { therapist_id: 'th-3', service_id: 'srv-1' },
  { therapist_id: 'th-3', service_id: 'srv-3' },
  { therapist_id: 'th-3', service_id: 'srv-4' },
];

export const INITIAL_AVAILABILITY: Availability[] = [
  // Elena: Tue-Sat 09:00 - 17:00 (Break 13:00-14:00)
  { id: 'av-1', therapist_id: 'th-1', day_of_week: 1, start_time: '09:00', end_time: '17:00', break_start: '13:00', break_end: '14:00' },
  { id: 'av-2', therapist_id: 'th-1', day_of_week: 2, start_time: '09:00', end_time: '17:00', break_start: '13:00', break_end: '14:00' },
  { id: 'av-3', therapist_id: 'th-1', day_of_week: 3, start_time: '09:00', end_time: '17:00', break_start: '13:00', break_end: '14:00' },
  { id: 'av-4', therapist_id: 'th-1', day_of_week: 4, start_time: '09:00', end_time: '17:00', break_start: '13:00', break_end: '14:00' },
  { id: 'av-5', therapist_id: 'th-1', day_of_week: 5, start_time: '09:00', end_time: '17:00', break_start: '13:00', break_end: '14:00' },
  { id: 'av-6', therapist_id: 'th-1', day_of_week: 6, start_time: '10:00', end_time: '16:00', break_start: '13:00', break_end: '13:30' },

  // Marcus: Mon-Fri 10:00 - 18:00 (Break 14:00-15:00)
  { id: 'av-7', therapist_id: 'th-2', day_of_week: 1, start_time: '10:00', end_time: '18:00', break_start: '14:00', break_end: '15:00' },
  { id: 'av-8', therapist_id: 'th-2', day_of_week: 2, start_time: '10:00', end_time: '18:00', break_start: '14:00', break_end: '15:00' },
  { id: 'av-9', therapist_id: 'th-2', day_of_week: 3, start_time: '10:00', end_time: '18:00', break_start: '14:00', break_end: '15:00' },
  { id: 'av-10', therapist_id: 'th-2', day_of_week: 4, start_time: '10:00', end_time: '18:00', break_start: '14:00', break_end: '15:00' },
  { id: 'av-11', therapist_id: 'th-2', day_of_week: 5, start_time: '10:00', end_time: '18:00', break_start: '14:00', break_end: '15:00' },

  // Maya: Wed-Sun 09:30 - 17:30 (Break 13:00-14:00)
  { id: 'av-12', therapist_id: 'th-3', day_of_week: 3, start_time: '09:30', end_time: '17:30', break_start: '13:00', break_end: '14:00' },
  { id: 'av-13', therapist_id: 'th-3', day_of_week: 4, start_time: '09:30', end_time: '17:30', break_start: '13:00', break_end: '14:00' },
  { id: 'av-14', therapist_id: 'th-3', day_of_week: 5, start_time: '09:30', end_time: '17:30', break_start: '13:00', break_end: '14:00' },
  { id: 'av-15', therapist_id: 'th-3', day_of_week: 6, start_time: '09:30', end_time: '17:30', break_start: '13:00', break_end: '14:00' },
  { id: 'av-16', therapist_id: 'th-3', day_of_week: 0, start_time: '10:00', end_time: '16:00', break_start: '13:00', break_end: '13:30' },
];

export const INITIAL_TIMEOFFS: TimeOff[] = [
  {
    id: 'to-1',
    therapist_id: 'th-1',
    date: '2026-09-02',
    start_time: '09:00',
    end_time: '17:00',
    reason: 'Continuing Education - Advanced Neuromuscular Seminar'
  }
];

export const INITIAL_CLIENT: Client = {
  id: 'cl-demo',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@example.com',
  phone: '(555) 392-8819',
  preferences: {
    pressure_level: 'Firm',
    allergies: 'Mild sensitivity to eucalyptus oil',
    areas_to_avoid: 'Ticklish feet, lower right calf',
    focus_areas: 'Upper shoulders, cervical neck, sub-occipitals'
  },
  created_at: '2026-07-15T10:00:00Z'
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-89211',
    client_id: 'cl-demo',
    service_id: 'srv-2',
    therapist_id: 'th-1',
    date: '2026-09-04',
    start_time: '10:00',
    end_time: '11:30',
    status: 'confirmed',
    deposit_paid: 40,
    total_price: 165,
    payment_method: 'deposit_stripe',
    payment_status: 'deposit_only',
    stripe_payment_id: 'pi_3Mtw284kLmnQ',
    client_name: 'Sarah Jenkins',
    client_email: 'sarah.jenkins@example.com',
    client_phone: '(555) 392-8819',
    notes: 'Please focus on left trapezius and rhomboids from cycling posture.',
    client_preferences: {
      pressure_level: 'Firm',
      focus_areas: 'Upper shoulders, cervical neck',
      allergies: 'Mild eucalyptus sensitivity'
    },
    created_at: '2026-08-20T14:30:00Z'
  },
  {
    id: 'BK-74120',
    client_id: 'cl-demo',
    service_id: 'srv-1',
    therapist_id: 'th-3',
    date: '2026-08-10',
    start_time: '14:00',
    end_time: '15:00',
    status: 'completed',
    deposit_paid: 30,
    total_price: 120,
    payment_method: 'full_stripe',
    payment_status: 'paid',
    stripe_payment_id: 'pi_28Kx9911LaPq',
    client_name: 'Sarah Jenkins',
    client_email: 'sarah.jenkins@example.com',
    client_phone: '(555) 392-8819',
    notes: 'Botanical lavender blend was delightful.',
    created_at: '2026-08-01T09:00:00Z'
  }
];

export interface AppState {
  services: Service[];
  therapists: Therapist[];
  therapistServices: TherapistService[];
  availabilities: Availability[];
  timeOffs: TimeOff[];
  bookings: Booking[];
  client: Client;
  currentRole: 'client' | 'admin';
}

const STORAGE_KEY = 'soma_sanctuary_state_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        services: parsed.services || INITIAL_SERVICES,
        therapists: parsed.therapists || INITIAL_THERAPISTS,
        therapistServices: parsed.therapistServices || INITIAL_THERAPIST_SERVICES,
        availabilities: parsed.availabilities || INITIAL_AVAILABILITY,
        timeOffs: parsed.timeOffs || INITIAL_TIMEOFFS,
        bookings: parsed.bookings || INITIAL_BOOKINGS,
        client: parsed.client || INITIAL_CLIENT,
        currentRole: parsed.currentRole || 'client',
      };
    }
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
  }

  return {
    services: INITIAL_SERVICES,
    therapists: INITIAL_THERAPISTS,
    therapistServices: INITIAL_THERAPIST_SERVICES,
    availabilities: INITIAL_AVAILABILITY,
    timeOffs: INITIAL_TIMEOFFS,
    bookings: INITIAL_BOOKINGS,
    client: INITIAL_CLIENT,
    currentRole: 'client',
  };
}

export function saveAppState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function resetAppState(): AppState {
  const fresh: AppState = {
    services: INITIAL_SERVICES,
    therapists: INITIAL_THERAPISTS,
    therapistServices: INITIAL_THERAPIST_SERVICES,
    availabilities: INITIAL_AVAILABILITY,
    timeOffs: INITIAL_TIMEOFFS,
    bookings: INITIAL_BOOKINGS,
    client: INITIAL_CLIENT,
    currentRole: 'client',
  };
  saveAppState(fresh);
  return fresh;
}
