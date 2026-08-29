import { Availability, Booking, Service, Therapist, TherapistService, TimeOff, TimeSlot } from '../types';

/**
 * Converts "HH:MM" string to minutes from start of day
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts minutes from start of day to "HH:MM" string
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Format "HH:MM" (24h) to "h:mm A" (12h, e.g. "9:30 AM", "2:00 PM")
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Checks if two time intervals [startA, endA) and [startB, endB) overlap
 */
export function timesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Returns the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) for "YYYY-MM-DD"
 */
export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay();
}

/**
 * Format date "YYYY-MM-DD" to human readable "Friday, October 24, 2026"
 */
export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date "YYYY-MM-DD" to short "Fri, Oct 24"
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Availability Engine Parameters
 */
export interface AvailabilityQuery {
  serviceId: string;
  therapistId?: string; // If 'any' or undefined, searches all capable therapists
  dateStr: string;      // "YYYY-MM-DD"
  services: Service[];
  therapists: Therapist[];
  therapistServices: TherapistService[];
  availabilities: Availability[];
  timeOffs: TimeOff[];
  bookings: Booking[];
}

/**
 * Main Availability Engine Function:
 * Computes real bookable slots for a service and date, accounting for:
 * - Which therapists offer this service
 * - Therapist recurring weekly working hours (Availability)
 * - Scheduled breaks
 * - Specific TimeOff exception blocks for the date
 * - Existing bookings that are not cancelled
 * - Buffer times (5 min changeover)
 * - Past times if date is today
 */
export function computeAvailableSlots(query: AvailabilityQuery): TimeSlot[] {
  const {
    serviceId,
    therapistId,
    dateStr,
    services,
    therapists,
    therapistServices,
    availabilities,
    timeOffs,
    bookings,
  } = query;

  const service = services.find(s => s.id === serviceId);
  if (!service) return [];

  const serviceDuration = service.duration_minutes;
  const dayOfWeek = getDayOfWeek(dateStr);

  // 1. Determine eligible therapists
  let eligibleTherapistIds: string[] = [];
  if (therapistId && therapistId !== 'any') {
    // Specific therapist selected - check if they offer service
    const offers = therapistServices.some(
      ts => ts.therapist_id === therapistId && ts.service_id === serviceId
    );
    if (offers) {
      eligibleTherapistIds = [therapistId];
    }
  } else {
    // 'Any available' therapist - find all active therapists that offer this service
    eligibleTherapistIds = therapistServices
      .filter(ts => ts.service_id === serviceId)
      .map(ts => ts.therapist_id)
      .filter(id => {
        const t = therapists.find(item => item.id === id);
        return t && t.active;
      });
  }

  if (eligibleTherapistIds.length === 0) {
    return [];
  }

  // Helper to check if slot is in the past for today's date
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const isToday = dateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Map to hold unique slot times and eligible therapist
  const slotMap = new Map<string, TimeSlot>();

  // Interval step in minutes for appointment starts (every 30 minutes, e.g. 09:00, 09:30, 10:00...)
  const SLOT_INTERVAL = 30;

  for (const tId of eligibleTherapistIds) {
    const therapist = therapists.find(t => t.id === tId);
    if (!therapist || !therapist.active) continue;

    // Check therapist weekly availability for this day of week
    const therapistAvail = availabilities.filter(
      a => a.therapist_id === tId && a.day_of_week === dayOfWeek
    );

    if (therapistAvail.length === 0) continue;

    // Check therapist time-off records for this specific date
    const dateOffs = timeOffs.filter(
      to => to.therapist_id === tId && to.date === dateStr
    );

    // Check therapist existing bookings for this date (excluding cancelled)
    const therapistBookings = bookings.filter(
      b => b.therapist_id === tId && b.date === dateStr && b.status !== 'cancelled'
    );

    for (const avail of therapistAvail) {
      const shiftStart = timeToMinutes(avail.start_time);
      const shiftEnd = timeToMinutes(avail.end_time);

      const breakStart = avail.break_start ? timeToMinutes(avail.break_start) : null;
      const breakEnd = avail.break_end ? timeToMinutes(avail.break_end) : null;

      for (let slotStart = shiftStart; slotStart + serviceDuration <= shiftEnd; slotStart += SLOT_INTERVAL) {
        const slotEnd = slotStart + serviceDuration;
        const timeKey = minutesToTime(slotStart);

        // Past time check if today (must be at least 30 mins from now)
        if (isToday && slotStart <= currentMinutes + 15) {
          continue;
        }

        // Check break overlap
        if (breakStart !== null && breakEnd !== null) {
          if (timesOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
            continue;
          }
        }

        // Check time off overlap
        const isBlockedByTimeOff = dateOffs.some(to => {
          const toStart = timeToMinutes(to.start_time);
          const toEnd = timeToMinutes(to.end_time);
          return timesOverlap(slotStart, slotEnd, toStart, toEnd);
        });
        if (isBlockedByTimeOff) continue;

        // Check booking overlaps
        const isBlockedByBooking = therapistBookings.some(b => {
          const bStart = timeToMinutes(b.start_time);
          const bEnd = timeToMinutes(b.end_time);
          return timesOverlap(slotStart, slotEnd, bStart, bEnd);
        });
        if (isBlockedByBooking) continue;

        // If not already in map or if prioritizing this therapist
        if (!slotMap.has(timeKey)) {
          slotMap.set(timeKey, {
            time: timeKey,
            end_time: minutesToTime(slotEnd),
            available: true,
            therapist_id: therapist.id,
            therapist_name: therapist.name,
          });
        }
      }
    }
  }

  // Sort slots chronologically
  return Array.from(slotMap.values()).sort((a, b) => {
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });
}
