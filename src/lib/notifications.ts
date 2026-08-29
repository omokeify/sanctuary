import { Booking, NotificationLog, Service, Therapist } from '../types';
import { formatDateLong, formatTime12h } from './availabilityEngine';

export interface INotificationService {
  sendBookingConfirmation(booking: Booking, service: Service, therapist: Therapist): Promise<NotificationLog[]>;
  send24hReminder(booking: Booking, service: Service, therapist: Therapist): Promise<NotificationLog[]>;
  sendCancellationNotice(booking: Booking, service: Service, therapist: Therapist, refundAmount: number): Promise<NotificationLog[]>;
  sendRescheduleNotice(booking: Booking, service: Service, therapist: Therapist, oldDate: string, oldTime: string): Promise<NotificationLog[]>;
}

class NotificationServiceStub implements INotificationService {
  private getStorageLogs(): NotificationLog[] {
    try {
      const data = localStorage.getItem('soma_notifications');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLog(log: NotificationLog) {
    const current = this.getStorageLogs();
    const updated = [log, ...current];
    try {
      localStorage.setItem('soma_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save notification log', e);
    }
  }

  async sendBookingConfirmation(booking: Booking, service: Service, therapist: Therapist): Promise<NotificationLog[]> {
    const formattedDate = formatDateLong(booking.date);
    const formattedTime = formatTime12h(booking.start_time);
    
    // 1. Resend Email Confirmation
    const emailLog: NotificationLog = {
      id: `ntf-resend-${Date.now()}-1`,
      type: 'email',
      provider: 'Resend',
      recipient: booking.client_email,
      subject: `Confirmed: Your ${service.name} at Soma Sanctuary on ${formattedDate}`,
      body: `Hello ${booking.client_name},\n\nYour appointment is confirmed!\n\nService: ${service.name} (${service.duration_minutes} min)\nTherapist: ${therapist.name}\nDate & Time: ${formattedDate} at ${formattedTime}\nDeposit Paid: $${booking.deposit_paid} (Remaining balance $${booking.total_price - booking.deposit_paid} due at checkout)\n\nLocation: Soma Sanctuary, 742 Evergreen Serenity Way, Suite 400\nPlease arrive 10 minutes early to unwind with our herbal tea bar.\n\nWarm regards,\nSoma Sanctuary Concierge`,
      status: 'delivered',
      created_at: new Date().toISOString(),
      booking_id: booking.id,
    };

    // 2. Twilio SMS Stub
    const smsLog: NotificationLog = {
      id: `ntf-twilio-${Date.now()}-2`,
      type: 'sms',
      provider: 'Twilio',
      recipient: booking.client_phone,
      subject: `SMS to ${booking.client_phone}`,
      body: `SOMA SANCTUARY: Your ${service.name} with ${therapist.name} is booked for ${formattedDate} at ${formattedTime}. Reply C to confirm or manage at somasanctuary.com`,
      status: 'delivered',
      created_at: new Date().toISOString(),
      booking_id: booking.id,
    };

    this.saveLog(emailLog);
    this.saveLog(smsLog);
    return [emailLog, smsLog];
  }

  async send24hReminder(booking: Booking, service: Service, therapist: Therapist): Promise<NotificationLog[]> {
    const formattedDate = formatDateLong(booking.date);
    const formattedTime = formatTime12h(booking.start_time);

    const emailLog: NotificationLog = {
      id: `ntf-resend-rem-${Date.now()}`,
      type: 'email',
      provider: 'Resend',
      recipient: booking.client_email,
      subject: `Reminder: Your Massage tomorrow at ${formattedTime}`,
      body: `Hi ${booking.client_name},\n\nWe look forward to seeing you tomorrow for your ${service.name} with ${therapist.name}.\n\nTime: ${formattedTime}\nLocation: 742 Evergreen Serenity Way\n\nNote: Cancellations made with less than 24 hours notice are non-refundable.\n\nSee you soon!`,
      status: 'delivered',
      created_at: new Date().toISOString(),
      booking_id: booking.id,
    };

    this.saveLog(emailLog);
    return [emailLog];
  }

  async sendCancellationNotice(booking: Booking, service: Service, therapist: Therapist, refundAmount: number): Promise<NotificationLog[]> {
    const formattedDate = formatDateLong(booking.date);
    const formattedTime = formatTime12h(booking.start_time);

    const emailLog: NotificationLog = {
      id: `ntf-resend-canc-${Date.now()}`,
      type: 'email',
      provider: 'Resend',
      recipient: booking.client_email,
      subject: `Cancellation Confirmed: ${service.name} on ${formattedDate}`,
      body: `Hello ${booking.client_name},\n\nYour appointment on ${formattedDate} at ${formattedTime} with ${therapist.name} has been cancelled.\n\n${refundAmount > 0 ? `A deposit refund of $${refundAmount} has been processed back to your original payment card (allow 3-5 business days).` : 'Per our 24-hour studio policy, the deposit was non-refundable as cancellation occurred within 24 hours of appointment.'}\n\nWe hope to welcome you again soon.\n\nSoma Sanctuary`,
      status: 'delivered',
      created_at: new Date().toISOString(),
      booking_id: booking.id,
    };

    this.saveLog(emailLog);
    return [emailLog];
  }

  async sendRescheduleNotice(booking: Booking, service: Service, therapist: Therapist, oldDate: string, oldTime: string): Promise<NotificationLog[]> {
    const newFormattedDate = formatDateLong(booking.date);
    const newFormattedTime = formatTime12h(booking.start_time);

    const emailLog: NotificationLog = {
      id: `ntf-resend-resched-${Date.now()}`,
      type: 'email',
      provider: 'Resend',
      recipient: booking.client_email,
      subject: `Rescheduled: Your appointment is now on ${newFormattedDate}`,
      body: `Hello ${booking.client_name},\n\nYour ${service.name} with ${therapist.name} has been rescheduled.\n\nPrevious: ${formatDateLong(oldDate)} at ${formatTime12h(oldTime)}\nNEW Date & Time: ${newFormattedDate} at ${newFormattedTime}\n\nYour deposit of $${booking.deposit_paid} has been transferred automatically.\n\nSoma Sanctuary`,
      status: 'delivered',
      created_at: new Date().toISOString(),
      booking_id: booking.id,
    };

    this.saveLog(emailLog);
    return [emailLog];
  }
}

export const notificationService = new NotificationServiceStub();
