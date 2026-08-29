import { Booking, Service, Therapist } from '../types';

/**
 * Format a Date object to iCalendar UTC string format: YYYYMMDDTHHMMSSZ
 */
function formatICSDate(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(year, month - 1, day, hours, minutes, 0);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/**
 * Generate iCalendar (.ics) content string
 */
export function generateICSContent(booking: Booking, service: Service, therapist: Therapist): string {
  const startICS = formatICSDate(booking.date, booking.start_time);
  const endICS = formatICSDate(booking.date, booking.end_time);
  const nowICS = formatICSDate(
    new Date().toISOString().split('T')[0],
    `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
  );

  const title = `Massage Appointment: ${service.name} with ${therapist.name}`;
  const description = `Your appointment at Soma Sanctuary for ${service.name} (${service.duration_minutes} min).\\nTherapist: ${therapist.name}\\nBooking Ref: ${booking.id}\\nDeposit Paid: $${booking.deposit_paid}\\nStudio Location: 742 Evergreen Serenity Way, Suite 400. Please arrive 10 minutes prior.`;
  const location = `Soma Sanctuary, 742 Evergreen Serenity Way, Suite 400`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soma Sanctuary//Massage Studio Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@somasanctuary.com`,
    `DTSTAMP:${nowICS}Z`,
    `DTSTART:${startICS}`,
    `DTEND:${endICS}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Massage appointment tomorrow at Soma Sanctuary',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Trigger download of .ics file
 */
export function downloadICSFile(booking: Booking, service: Service, therapist: Therapist) {
  const icsContent = generateICSContent(booking, service, therapist);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Soma-Sanctuary-Booking-${booking.id.slice(0, 8)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar Web URL
 */
export function generateGoogleCalendarUrl(booking: Booking, service: Service, therapist: Therapist): string {
  const startICS = formatICSDate(booking.date, booking.start_time);
  const endICS = formatICSDate(booking.date, booking.end_time);
  const title = encodeURIComponent(`${service.name} with ${therapist.name} - Soma Sanctuary`);
  const details = encodeURIComponent(`Appointment at Soma Sanctuary for ${service.name} (${service.duration_minutes} min).\nTherapist: ${therapist.name}\nBooking Ref: ${booking.id}\nDeposit: $${booking.deposit_paid} paid`);
  const location = encodeURIComponent('Soma Sanctuary, 742 Evergreen Serenity Way, Suite 400');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startICS}/${endICS}&details=${details}&location=${location}`;
}
