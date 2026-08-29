import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  Plus, 
  CalendarCheck, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { Booking, Client, ClientPreferences, PressureLevel, Service, Therapist, Availability, TimeOff, TherapistService } from '../types';
import { formatDateLong, formatDateShort, formatTime12h, timeToMinutes, computeAvailableSlots } from '../lib/availabilityEngine';
import { downloadICSFile } from '../lib/icsGenerator';

interface ClientDashboardProps {
  client: Client;
  bookings: Booking[];
  services: Service[];
  therapists: Therapist[];
  therapistServices: TherapistService[];
  availabilities: Availability[];
  timeOffs: TimeOff[];
  onUpdateClientPreferences: (prefs: ClientPreferences) => void;
  onCancelBooking: (bookingId: string, reason: string, isWithin24Hours: boolean) => void;
  onRescheduleBooking: (bookingId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  onBookNewTreatment: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  bookings,
  services,
  therapists,
  therapistServices,
  availabilities,
  timeOffs,
  onUpdateClientPreferences,
  onCancelBooking,
  onRescheduleBooking,
  onBookNewTreatment,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'preferences'>('upcoming');

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Schedule conflict');

  // Reschedule Modal State
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleSlot, setRescheduleSlot] = useState<{ time: string; end_time: string } | null>(null);

  // Preferences Form State
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>(client.preferences.pressure_level || 'Firm');
  const [focusAreas, setFocusAreas] = useState<string>(client.preferences.focus_areas || '');
  const [allergies, setAllergies] = useState<string>(client.preferences.allergies || '');
  const [areasToAvoid, setAreasToAvoid] = useState<string>(client.preferences.areas_to_avoid || '');
  const [preferencesSaved, setPreferencesSaved] = useState<boolean>(false);

  // Filter client's bookings
  const clientBookings = bookings.filter(b => b.client_email === client.email || b.client_id === client.id);

  // Partition into upcoming vs past
  const now = new Date();
  const todayYMD = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcomingBookings = clientBookings.filter(b => {
    if (b.status === 'cancelled' || b.status === 'completed' || b.status === 'no_show') return false;
    if (b.date > todayYMD) return true;
    if (b.date === todayYMD && timeToMinutes(b.start_time) > currentMinutes) return true;
    return false;
  }).sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));

  const pastBookings = clientBookings.filter(b => {
    return !upcomingBookings.some(u => u.id === b.id);
  }).sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time));

  // Helper to test if booking is within 24 hours
  const isWithin24Hours = (booking: Booking): boolean => {
    const [year, month, day] = booking.date.split('-').map(Number);
    const [hours, minutes] = booking.start_time.split(':').map(Number);
    const bookingDate = new Date(year, month - 1, day, hours, minutes);
    const diffMs = bookingDate.getTime() - new Date().getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClientPreferences({
      pressure_level: pressureLevel,
      focus_areas: focusAreas,
      allergies: allergies,
      areas_to_avoid: areasToAvoid,
    });
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  // Compute slots for reschedule modal
  const rescheduleService = reschedulingBooking ? services.find(s => s.id === reschedulingBooking.service_id) : null;
  const rescheduleAvailableSlots = React.useMemo(() => {
    if (!reschedulingBooking || !rescheduleDate || !rescheduleService) return [];
    return computeAvailableSlots({
      serviceId: reschedulingBooking.service_id,
      therapistId: reschedulingBooking.therapist_id,
      dateStr: rescheduleDate,
      services,
      therapists,
      therapistServices,
      availabilities,
      timeOffs,
      bookings: bookings.filter(b => b.id !== reschedulingBooking.id), // Ignore current booking being moved
    });
  }, [reschedulingBooking, rescheduleDate, rescheduleService, services, therapists, therapistServices, availabilities, timeOffs, bookings]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-on-background">
      {/* Header with Client Info */}
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-secondary/20 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-display text-2xl font-bold shadow-inner">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-medium text-primary">
                  {client.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-primary border border-secondary/20">
                  Guest Portal
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5 font-medium">
                {client.email} • {client.phone}
              </p>
            </div>
          </div>

          <button
            id="btn-dash-new-booking"
            onClick={onBookNewTreatment}
            className="px-6 py-3 rounded-full bg-[#FF6F3D] hover:opacity-90 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Treatment</span>
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-secondary/20">
          <button
            id="tab-upcoming"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface-container'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Upcoming ({upcomingBookings.length})</span>
          </button>

          <button
            id="tab-past"
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface-container'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History & Completed ({pastBookings.length})</span>
          </button>

          <button
            id="tab-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface-container'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Intake Preferences</span>
          </button>
        </div>
      </div>

      {/* TAB 1: UPCOMING APPOINTMENTS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {upcomingBookings.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center border border-secondary/20 shadow-xs">
              <CalendarCheck className="w-12 h-12 text-secondary mx-auto mb-3 opacity-40" />
              <h3 className="font-display text-xl font-medium text-primary">No Upcoming Appointments</h3>
              <p className="text-xs text-secondary mt-1 max-w-md mx-auto">
                Ready for a restorative bodywork session? Explore our curated treatments and select your preferred specialist.
              </p>
              <button
                onClick={onBookNewTreatment}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#FF6F3D] hover:opacity-90 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                Browse Treatments
              </button>
            </div>
          ) : (
            upcomingBookings.map((booking) => {
              const srv = services.find(s => s.id === booking.service_id);
              const th = therapists.find(t => t.id === booking.therapist_id);
              const isLateCancellation = isWithin24Hours(booking);

              return (
                <div
                  key={booking.id}
                  id={`booking-card-${booking.id}`}
                  className="bg-surface-container-low rounded-2xl border border-secondary/20 shadow-xs overflow-hidden hover:border-secondary/40 transition"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-secondary/15">
                      <div className="flex items-start gap-4">
                        <img
                          src={th?.photo_url || srv?.image_url}
                          alt={th?.name || 'Therapist'}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border border-secondary/30 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary-container text-primary border border-secondary/20">
                              Confirmed
                            </span>
                            <span className="text-xs text-secondary font-mono">Ref: {booking.id}</span>
                          </div>
                          <h3 className="font-display text-xl font-medium text-primary mt-1">
                            {srv?.name || 'Massage Treatment'}
                          </h3>
                          <p className="text-xs text-secondary font-medium">
                            with <strong>{th?.name || 'Assigned Specialist'}</strong> ({srv?.duration_minutes} min)
                          </p>
                        </div>
                      </div>

                      {/* Deposit / Balance breakdown */}
                      <div className="text-left sm:text-right bg-surface-container p-3.5 rounded-xl border border-secondary/15">
                        <span className="text-[10px] font-semibold uppercase text-secondary block">Deposit Paid</span>
                        <span className="text-base font-bold text-primary">${booking.deposit_paid}</span>
                        <span className="text-[11px] text-secondary block mt-0.5 font-medium">
                          Remaining ${booking.total_price - booking.deposit_paid} due at studio
                        </span>
                      </div>
                    </div>

                    {/* Date, Time & Location Pill Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="bg-surface-container p-3.5 rounded-xl border border-secondary/15 flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-[10px] text-secondary block font-semibold uppercase">Date</span>
                          <span className="text-xs font-semibold text-primary">{formatDateLong(booking.date)}</span>
                        </div>
                      </div>

                      <div className="bg-surface-container p-3.5 rounded-xl border border-secondary/15 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#FF6F3D]" />
                        <div>
                          <span className="text-[10px] text-secondary block font-semibold uppercase">Time</span>
                          <span className="text-xs font-semibold text-primary">{formatTime12h(booking.start_time)} – {formatTime12h(booking.end_time)}</span>
                        </div>
                      </div>

                      <div className="bg-surface-container p-3.5 rounded-xl border border-secondary/15 flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-[10px] text-secondary block font-semibold uppercase">Location</span>
                          <span className="text-xs font-medium text-primary">Forest Suite 400</span>
                        </div>
                      </div>
                    </div>

                    {/* 24-Hour Policy Window Notice */}
                    {isLateCancellation && (
                      <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>Within 24-Hour Policy Window:</strong> This appointment is in less than 24 hours. Cancellations now forfeit the ${booking.deposit_paid} deposit per studio policy.
                        </div>
                      </div>
                    )}

                    {/* Card Actions: Calendar Sync, Reschedule, Cancel */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-secondary/15">
                      <button
                        onClick={() => srv && th && downloadICSFile(booking, srv, th)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-secondary/30 text-xs font-semibold text-primary hover:bg-surface-container transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .ICS Calendar
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-reschedule-${booking.id}`}
                          onClick={() => {
                            setReschedulingBooking(booking);
                            setRescheduleDate(booking.date);
                            setRescheduleSlot(null);
                          }}
                          className="px-4 py-2 rounded-full border border-secondary/30 text-primary hover:bg-primary hover:text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reschedule
                        </button>

                        <button
                          id={`btn-cancel-${booking.id}`}
                          onClick={() => setCancellingBooking(booking)}
                          className="px-4 py-2 rounded-full border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-xs transition cursor-pointer"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PAST APPOINTMENTS */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl p-10 text-center border border-secondary/20 shadow-xs">
              <Clock className="w-10 h-10 text-secondary mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-primary">No past treatment records found.</p>
            </div>
          ) : (
            pastBookings.map((booking) => {
              const srv = services.find(s => s.id === booking.service_id);
              const th = therapists.find(t => t.id === booking.therapist_id);

              return (
                <div
                  key={booking.id}
                  className="bg-surface-container-low rounded-2xl p-5 border border-secondary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={th?.photo_url || srv?.image_url}
                      alt={th?.name || 'Therapist'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-secondary/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          booking.status === 'completed'
                            ? 'bg-secondary-container text-primary'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-surface-container text-secondary'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs text-secondary">{formatDateShort(booking.date)}</span>
                      </div>
                      <h4 className="font-display font-medium text-sm text-primary mt-0.5">{srv?.name}</h4>
                      <p className="text-xs text-secondary font-medium">with {th?.name} • ${booking.total_price}</p>
                    </div>
                  </div>

                  <button
                    onClick={onBookNewTreatment}
                    className="px-5 py-2 rounded-full border border-primary hover:bg-primary hover:text-white text-primary font-semibold text-xs transition cursor-pointer self-start sm:self-auto"
                  >
                    Book Again
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: INTAKE PREFERENCES */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-secondary/20 shadow-xs">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-medium text-primary">My Therapeutic Intake Preferences</h2>
            <p className="text-xs sm:text-sm text-secondary">
              These preferences are automatically applied to all your massage reservations and shared privately with your specialist.
            </p>
          </div>

          <div className="space-y-6">
            {/* Pressure Selector */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-2">
                Default Pressure Depth Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Gentle', 'Medium', 'Firm', 'Deep'] as PressureLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPressureLevel(level)}
                    className={`py-3 px-3 rounded-xl text-xs font-semibold transition text-center cursor-pointer ${
                      pressureLevel === level
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container text-primary border border-secondary/20 hover:bg-secondary-container'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">
                Priority Focus Areas
              </label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Cervical neck, scapula, low back, calves"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Allergies & Essential Oil Sensitivities
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Lavender sensitivity, nut oils"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Areas to Avoid
                </label>
                <input
                  type="text"
                  value={areasToAvoid}
                  onChange={(e) => setAreasToAvoid(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Feet, abdomen, scalp"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-secondary/20 flex items-center justify-between">
              {preferencesSaved ? (
                <span className="text-xs text-primary font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  Preferences Saved Successfully!
                </span>
              ) : (
                <span className="text-xs text-secondary font-medium">Last updated: Today</span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-primary hover:opacity-90 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CANCEL MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-low rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-secondary/20 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-medium text-primary">
                Cancel Appointment
              </h3>
              <button
                onClick={() => setCancellingBooking(null)}
                className="p-1 rounded-full text-secondary hover:text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-secondary mb-4 font-medium">
              Booking Ref: <strong>{cancellingBooking.id}</strong> on {formatDateShort(cancellingBooking.date)} at {formatTime12h(cancellingBooking.start_time)}.
            </p>

            {/* Policy Check Display */}
            {isWithin24Hours(cancellingBooking) ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
                <strong>Late Cancellation Notice:</strong>
                <p className="mt-1">
                  This appointment is scheduled in less than 24 hours. Under our studio policy, your ${cancellingBooking.deposit_paid} deposit is non-refundable.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-4">
                <strong>Eligible for 100% Refund:</strong>
                <p className="mt-1">
                  Because this cancellation is more than 24 hours in advance, your full ${cancellingBooking.deposit_paid} deposit will be refunded to your card automatically.
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-primary mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-xs text-primary focus:outline-none"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Feeling unwell / illness">Feeling unwell / illness</option>
                <option value="Travel / away">Travel / out of town</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-5 py-2 rounded-full border border-secondary/30 text-primary font-semibold text-xs hover:bg-surface-container cursor-pointer"
              >
                Keep Booking
              </button>

              <button
                onClick={() => {
                  const within24 = isWithin24Hours(cancellingBooking);
                  onCancelBooking(cancellingBooking.id, cancellationReason, within24);
                  setCancellingBooking(null);
                }}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-low rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-secondary/20 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-medium text-primary">
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="p-1 rounded-full text-secondary hover:text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-secondary mb-4 font-medium">
              Choose a new date and open time slot. Your ${reschedulingBooking.deposit_paid} deposit will seamlessly transfer to the new appointment.
            </p>

            {/* Date Picker Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-primary mb-1">
                Select New Date
              </label>
              <input
                type="date"
                min={todayYMD}
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleSlot(null);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-xs font-semibold text-primary focus:outline-none"
              />
            </div>

            {/* Slots available */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-primary mb-2">
                Available Time Slots for {formatDateShort(rescheduleDate)}
              </label>

              {rescheduleAvailableSlots.length === 0 ? (
                <div className="p-4 bg-surface-container rounded-xl text-center text-xs text-secondary">
                  No open slots with this specialist on this date. Try another day.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {rescheduleAvailableSlots.map((s) => (
                    <button
                      key={s.time}
                      onClick={() => setRescheduleSlot(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                        rescheduleSlot?.time === s.time
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface-container-lowest text-primary border-secondary/20 hover:bg-surface-container'
                      }`}
                    >
                      {formatTime12h(s.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary/20">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="px-5 py-2 rounded-full border border-secondary/30 text-primary font-semibold text-xs hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>

              <button
                disabled={!rescheduleSlot}
                onClick={() => {
                  if (rescheduleSlot) {
                    onRescheduleBooking(
                      reschedulingBooking.id,
                      rescheduleDate,
                      rescheduleSlot.time,
                      rescheduleSlot.end_time
                    );
                    setReschedulingBooking(null);
                  }
                }}
                className={`px-5 py-2 rounded-full font-semibold text-xs shadow-xs transition cursor-pointer ${
                  rescheduleSlot
                    ? 'bg-[#FF6F3D] hover:opacity-90 text-white'
                    : 'bg-surface-container text-outline/40 cursor-not-allowed'
                }`}
              >
                Save New Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
