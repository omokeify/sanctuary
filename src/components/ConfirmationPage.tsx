import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Download, 
  ExternalLink, 
  Mail, 
  ArrowRight
} from 'lucide-react';
import { Booking, Service, Therapist } from '../types';
import { formatDateLong, formatTime12h } from '../lib/availabilityEngine';
import { downloadICSFile, generateGoogleCalendarUrl } from '../lib/icsGenerator';

interface ConfirmationPageProps {
  booking: Booking;
  service: Service;
  therapist: Therapist;
  onGoToDashboard: () => void;
  onBookAnother: () => void;
  onOpenNotifications: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  booking,
  service,
  therapist,
  onGoToDashboard,
  onBookAnother,
  onOpenNotifications,
}) => {
  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#283927', '#596246', '#FF6F3D', '#fff9ed']
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  }, []);

  const formattedDate = formatDateLong(booking.date);
  const formattedTime = formatTime12h(booking.start_time);
  const formattedEndTime = formatTime12h(booking.end_time);
  const remainingBalance = booking.total_price - booking.deposit_paid;

  const handleDownloadICS = () => {
    downloadICSFile(booking, service, therapist);
  };

  const googleCalUrl = generateGoogleCalendarUrl(booking, service, therapist);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in text-on-background">
      {/* Top Banner Status */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-primary mx-auto flex items-center justify-center mb-4 shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-primary" />
        </div>
        <span className="px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary text-white inline-block mb-2 shadow-xs">
          Appointment Confirmed
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-primary mb-2">
          We Look Forward to Welcoming You
        </h1>
        <p className="text-sm text-secondary">
          Booking Reference: <strong className="text-primary font-mono">{booking.id}</strong>
        </p>
      </div>

      {/* Main Receipt & Summary Card */}
      <div className="bg-surface-container-low rounded-2xl border border-secondary/20 shadow-sm overflow-hidden mb-8">
        {/* Card Header Strip */}
        <div className="bg-primary p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Treatment</span>
            <h3 className="font-display text-2xl font-medium">{service.name}</h3>
            <p className="text-xs text-white/80 mt-0.5">{service.duration_minutes} Minutes One-on-One Bodywork</p>
          </div>

          <div className="flex items-center gap-3 bg-primary-container p-3 rounded-xl border border-white/10">
            <img
              src={therapist.photo_url}
              alt={therapist.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-white/30"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/70">Specialist</span>
              <div className="font-semibold text-sm text-white">{therapist.name}</div>
              <div className="text-[11px] text-white/80">{therapist.title}</div>
            </div>
          </div>
        </div>

        {/* Card Body Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Date & Time Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container rounded-xl p-5 border border-secondary/15">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-secondary font-medium block">Date of Appointment</span>
                <span className="text-sm font-semibold text-primary">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6F3D] text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-secondary font-medium block">Scheduled Time</span>
                <span className="text-sm font-semibold text-primary">{formattedTime} – {formattedEndTime}</span>
              </div>
            </div>
          </div>

          {/* Location & Studio Arrival Notes */}
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-container border border-secondary/15">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <strong>Studio Location:</strong> Forest Sanctuary, 742 Evergreen Serenity Way, Suite 400.
              <br />
              Please arrive 10 minutes prior to unwind with a complimentary organic botanical infusion and consult with {therapist.name.split(' ')[0]}.
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-secondary/15 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
              Payment & Deposit Receipt
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-secondary">
                <span>Total Treatment Fee</span>
                <span className="text-primary font-semibold">${booking.total_price}</span>
              </div>
              <div className="flex items-center justify-between text-secondary">
                <span>Deposit Charged via Stripe</span>
                <span className="text-emerald-700 font-bold">-${booking.deposit_paid} (Paid)</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-primary pt-2 border-t border-secondary/15">
                <span>Remaining Balance Due at Studio</span>
                <span className="text-base">${remainingBalance}</span>
              </div>
            </div>
          </div>

          {/* Client Intake Summary */}
          {booking.client_preferences && (
            <div className="border-t border-secondary/15 pt-5 text-xs text-on-surface-variant">
              <h4 className="font-bold uppercase tracking-wider text-secondary mb-2 text-[11px]">
                Intake Notes For Specialist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-container p-3.5 rounded-xl border border-secondary/15">
                <div>
                  <span className="text-secondary">Pressure:</span> <strong className="text-primary">{booking.client_preferences.pressure_level}</strong>
                </div>
                {booking.client_preferences.focus_areas && (
                  <div>
                    <span className="text-secondary">Focus:</span> <strong className="text-primary">{booking.client_preferences.focus_areas}</strong>
                  </div>
                )}
                {booking.client_preferences.allergies && (
                  <div className="sm:col-span-2">
                    <span className="text-secondary">Allergies / Avoid:</span> <strong className="text-primary">{booking.client_preferences.allergies}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Sync Actions */}
          <div className="border-t border-secondary/15 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
              Add to Your Personal Calendar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-full border border-secondary/30 hover:border-primary text-primary font-semibold text-xs transition flex items-center justify-center gap-2 hover:bg-surface-container"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <span>Google Calendar</span>
              </a>

              <button
                onClick={handleDownloadICS}
                className="py-2.5 px-4 rounded-full border border-secondary/30 hover:border-primary text-primary font-semibold text-xs transition flex items-center justify-center gap-2 hover:bg-surface-container cursor-pointer"
              >
                <Download className="w-4 h-4 text-primary" />
                <span>Download .ICS File (Apple / Outlook)</span>
              </button>
            </div>
          </div>

          {/* Live Notification Preview Alert */}
          <div 
            onClick={onOpenNotifications}
            className="p-4 rounded-xl bg-surface-container border border-secondary/20 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FF6F3D] text-white flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-primary">Confirmation Dispatched</h5>
                <p className="text-[11px] text-secondary">
                  Resend confirmation email delivered to <strong>{booking.client_email}</strong>. Click to inspect log.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-6 bg-surface-container border-t border-secondary/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onBookAnother}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-secondary/30 hover:border-primary text-primary font-semibold text-xs transition cursor-pointer hover:bg-surface-container-high"
          >
            Browse Other Treatments
          </button>

          <button
            id="btn-view-my-dashboard"
            onClick={onGoToDashboard}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Manage in Client Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

