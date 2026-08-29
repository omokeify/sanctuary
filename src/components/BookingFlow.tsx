import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Lock, 
  AlertCircle,
  HelpCircle,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { 
  Availability, 
  Booking, 
  Client, 
  ClientPreferences, 
  PressureLevel, 
  Service, 
  Therapist, 
  TherapistService, 
  TimeOff, 
  TimeSlot 
} from '../types';
import { 
  computeAvailableSlots, 
  formatDateLong, 
  formatDateShort, 
  formatTime12h, 
  timeToMinutes 
} from '../lib/availabilityEngine';

interface BookingFlowProps {
  service: Service;
  preselectedTherapistId?: string;
  allServices: Service[];
  allTherapists: Therapist[];
  therapistServices: TherapistService[];
  availabilities: Availability[];
  timeOffs: TimeOff[];
  bookings: Booking[];
  client: Client;
  onCancel: () => void;
  onBookingComplete: (newBooking: Booking) => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  service: initialService,
  preselectedTherapistId,
  allServices,
  allTherapists,
  therapistServices,
  availabilities,
  timeOffs,
  bookings,
  client: defaultClient,
  onCancel,
  onBookingComplete,
}) => {
  // Step state (1: Therapist, 2: Date/Time, 3: Details & Payment)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(preselectedTherapistId ? 2 : 1);
  const [selectedService, setSelectedService] = useState<Service>(initialService);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(preselectedTherapistId || 'any');

  // Date selection state (default to tomorrow or nearest bookable date)
  const today = new Date();
  const defaultDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Client Details & Preferences state
  const [clientName, setClientName] = useState<string>(defaultClient.name);
  const [clientEmail, setClientEmail] = useState<string>(defaultClient.email);
  const [clientPhone, setClientPhone] = useState<string>(defaultClient.phone);
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>(defaultClient.preferences.pressure_level || 'Firm');
  const [focusAreas, setFocusAreas] = useState<string>(defaultClient.preferences.focus_areas || '');
  const [allergies, setAllergies] = useState<string>(defaultClient.preferences.allergies || '');
  const [notes, setNotes] = useState<string>('');

  // Payment state
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('842');
  const [cardZip, setCardZip] = useState<string>('94107');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Filter therapists who can perform selected service
  const qualifiedTherapists = useMemo(() => {
    return allTherapists.filter(t => 
      t.active && therapistServices.some(ts => ts.therapist_id === t.id && ts.service_id === selectedService.id)
    );
  }, [allTherapists, therapistServices, selectedService.id]);

  // Compute live available slots for selected date and therapist
  const availableSlots = useMemo(() => {
    return computeAvailableSlots({
      serviceId: selectedService.id,
      therapistId: selectedTherapistId,
      dateStr: selectedDate,
      services: allServices,
      therapists: allTherapists,
      therapistServices,
      availabilities,
      timeOffs,
      bookings,
    });
  }, [
    selectedService.id,
    selectedTherapistId,
    selectedDate,
    allServices,
    allTherapists,
    therapistServices,
    availabilities,
    timeOffs,
    bookings,
  ]);

  // Segment slots into Morning (before 12pm), Afternoon (12pm - 4pm), Evening (4pm+)
  const slotGroups = useMemo(() => {
    const morning = availableSlots.filter(s => timeToMinutes(s.time) < 12 * 60);
    const afternoon = availableSlots.filter(s => timeToMinutes(s.time) >= 12 * 60 && timeToMinutes(s.time) < 16 * 60);
    const evening = availableSlots.filter(s => timeToMinutes(s.time) >= 16 * 60);
    return { morning, afternoon, evening };
  }, [availableSlots]);

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean; isToday: boolean }> = [];

    // Pad previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
      });
    }

    // Current month days
    const now = new Date();
    const todayYMD = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const d = new Date(year, month, i);
      const isPast = dateStr < todayYMD;
      const isToday = dateStr === todayYMD;

      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isPast,
        isToday,
      });
    }

    return days;
  }, [calendarMonth]);

  // Handle final checkout and booking creation
  const handleAuthorizeAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setPaymentError('Please fill out all required contact fields.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    // Simulate Stripe payment intent authorization
    await new Promise(resolve => setTimeout(resolve, 900));

    const depositAmount = paymentOption === 'full' ? selectedService.price : selectedService.deposit_amount;
    const paymentStatus = paymentOption === 'full' ? 'paid' : 'deposit_only';

    const assignedTherapistId = selectedTherapistId === 'any' ? selectedSlot.therapist_id : selectedTherapistId;

    const newBooking: Booking = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      client_id: defaultClient.id || 'cl-guest',
      service_id: selectedService.id,
      therapist_id: assignedTherapistId,
      date: selectedDate,
      start_time: selectedSlot.time,
      end_time: selectedSlot.end_time,
      status: 'confirmed',
      deposit_paid: depositAmount,
      total_price: selectedService.price,
      payment_method: paymentOption === 'full' ? 'full_stripe' : 'deposit_stripe',
      payment_status: paymentStatus,
      stripe_payment_id: `pi_stripe_${Date.now().toString(36)}`,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      notes: notes,
      client_preferences: {
        pressure_level: pressureLevel,
        allergies: allergies,
        focus_areas: focusAreas,
      },
      created_at: new Date().toISOString(),
    };

    setIsProcessingPayment(false);
    onBookingComplete(newBooking);
  };

  const selectedTherapistObj = allTherapists.find(t => t.id === (selectedTherapistId === 'any' && selectedSlot ? selectedSlot.therapist_id : selectedTherapistId));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-on-background">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary/20">
        <button
          id="btn-cancel-booking-flow"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return to Catalog
        </button>

        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Encrypted 256-bit Booking Flow</span>
        </div>
      </div>

      {/* Selected Service Ribbon */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-secondary/20 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={selectedService.image_url}
            alt={selectedService.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border border-secondary/20 shrink-0"
          />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Selected Treatment</span>
            <h3 className="font-display text-lg font-medium text-primary leading-tight">{selectedService.name}</h3>
            <div className="flex items-center gap-3 text-xs text-secondary mt-0.5 font-medium">
              <span>{selectedService.duration_minutes} min</span>
              <span>•</span>
              <span className="font-semibold text-primary">${selectedService.price}</span>
              <span>•</span>
              <span className="text-[#FF6F3D] font-semibold">${selectedService.deposit_amount} deposit</span>
            </div>
          </div>
        </div>

        {/* Change service dropdown if desired */}
        <select
          id="select-change-service"
          value={selectedService.id}
          onChange={(e) => {
            const s = allServices.find(srv => srv.id === e.target.value);
            if (s) {
              setSelectedService(s);
              setSelectedSlot(null);
            }
          }}
          className="px-3.5 py-2 rounded-full border border-secondary/30 bg-surface-container-lowest text-xs text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-2xs"
        >
          {allServices.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.duration_minutes}m - ${s.price})
            </option>
          ))}
        </select>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              currentStep === 1
                ? 'bg-primary text-white border-primary shadow-xs'
                : currentStep > 1
                ? 'bg-surface-container-low text-primary border-secondary/30 hover:border-primary'
                : 'bg-surface-container/50 text-secondary border-secondary/15'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-[#FF6F3D] text-white' : currentStep > 1 ? 'bg-secondary-container text-primary' : 'bg-surface-container text-secondary'
            }`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className="text-xs sm:text-sm font-semibold">1. Choose Specialist</span>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => {
              if (currentStep > 2 || selectedTherapistId) setCurrentStep(2);
            }}
            className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              currentStep === 2
                ? 'bg-primary text-white border-primary shadow-xs'
                : currentStep > 2
                ? 'bg-surface-container-low text-primary border-secondary/30 hover:border-primary'
                : 'bg-surface-container/50 text-secondary border-secondary/15'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-[#FF6F3D] text-white' : currentStep > 2 ? 'bg-secondary-container text-primary' : 'bg-surface-container text-secondary'
            }`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span className="text-xs sm:text-sm font-semibold">2. Date & Time</span>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => {
              if (selectedSlot) setCurrentStep(3);
            }}
            disabled={!selectedSlot}
            className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              currentStep === 3
                ? 'bg-primary text-white border-primary shadow-xs'
                : selectedSlot
                ? 'bg-surface-container-low text-primary border-secondary/30 hover:border-primary'
                : 'bg-surface-container/30 text-secondary/50 border-secondary/10 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-[#FF6F3D] text-white' : 'bg-surface-container text-secondary'
            }`}>
              3
            </div>
            <span className="text-xs sm:text-sm font-semibold">3. Details & Deposit</span>
          </button>
        </div>
      </div>

      {/* STEP 1: PICK THERAPIST */}
      {currentStep === 1 && (
        <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-secondary/20 shadow-xs">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-medium text-primary">Select Your Specialist</h2>
            <p className="text-sm text-secondary">
              Choose a dedicated therapist or select "Any Available" for the greatest time flexibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Any Available Option */}
            <div
              id="opt-therapist-any"
              onClick={() => setSelectedTherapistId('any')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                selectedTherapistId === 'any'
                  ? 'border-primary bg-secondary-container shadow-2xs ring-1 ring-primary'
                  : 'border-secondary/20 bg-surface-container-lowest hover:border-secondary'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-primary text-base">Any Available Specialist</h4>
                  <span className="text-[11px] font-semibold text-[#FF6F3D] bg-surface-container px-2 py-0.5 rounded-full border border-secondary/20">
                    Fastest Openings
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  We'll automatically match you with any certified therapist qualified in {selectedService.name}.
                </p>
              </div>
            </div>

            {/* Individual Therapists */}
            {qualifiedTherapists.map((therapist) => (
              <div
                key={therapist.id}
                id={`opt-therapist-${therapist.id}`}
                onClick={() => setSelectedTherapistId(therapist.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  selectedTherapistId === therapist.id
                    ? 'border-primary bg-secondary-container shadow-2xs ring-1 ring-primary'
                    : 'border-secondary/20 bg-surface-container-lowest hover:border-secondary'
                }`}
              >
                <img
                  src={therapist.photo_url}
                  alt={therapist.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-secondary/30 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-primary text-sm sm:text-base">{therapist.name}</h4>
                    <span className="text-[10px] font-medium text-secondary">{therapist.years_experience} yrs exp</span>
                  </div>
                  <p className="text-xs text-secondary line-clamp-1 font-medium">{therapist.title}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {therapist.specialties.slice(0, 2).map((sp, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-primary border border-secondary/15">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue button */}
          <div className="flex justify-end pt-4 border-t border-secondary/20">
            <button
              id="btn-step1-continue"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-full bg-[#FF6F3D] text-white font-semibold text-sm hover:opacity-90 transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-xs"
            >
              <span>Continue to Date & Time</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PICK DATE + TIME SLOT */}
      {currentStep === 2 && (
        <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-secondary/20 shadow-xs">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-medium text-primary">Select Date & Time</h2>
            <p className="text-sm text-secondary">
              Real-time availability calculated from specialist working schedules, time-off exceptions, and existing bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Left: Interactive Calendar */}
            <div className="lg:col-span-5 bg-surface-container rounded-2xl p-5 border border-secondary/15">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-primary">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const d = new Date(calendarMonth);
                      d.setMonth(d.getMonth() - 1);
                      setCalendarMonth(d);
                    }}
                    className="p-1.5 rounded-full hover:bg-surface-container-high text-primary transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(calendarMonth);
                      d.setMonth(d.getMonth() + 1);
                      setCalendarMonth(d);
                    }}
                    className="p-1.5 rounded-full hover:bg-surface-container-high text-primary transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-secondary mb-2 uppercase">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Calendar Day Cells */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((day, idx) => {
                  const isSelected = day.dateStr === selectedDate;
                  return (
                    <button
                      key={idx}
                      disabled={day.isPast || !day.isCurrentMonth}
                      onClick={() => {
                        setSelectedDate(day.dateStr);
                        setSelectedSlot(null); // Reset slot when date changes
                      }}
                      className={`h-10 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all relative ${
                        !day.isCurrentMonth
                          ? 'text-outline/40 cursor-not-allowed'
                          : day.isPast
                          ? 'text-outline/40 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-primary text-white shadow-2xs font-bold'
                          : 'bg-surface-container-lowest text-primary hover:bg-secondary-container cursor-pointer'
                      }`}
                    >
                      <span>{day.dayNum}</span>
                      {day.isToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-[#FF6F3D] absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-secondary/15 text-[11px] text-secondary flex items-center justify-between">
                <span>Selected: <strong className="text-primary">{formatDateShort(selectedDate)}</strong></span>
                <span>Studio Closed Sundays</span>
              </div>
            </div>

            {/* Right: Available Time Slots */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Open Slots for {formatDateShort(selectedDate)}
                </h4>
                <span className="text-xs text-secondary">
                  {availableSlots.length} slots available
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="bg-surface-container rounded-2xl p-8 text-center border border-secondary/15">
                  <Clock className="w-8 h-8 mx-auto text-secondary mb-2 opacity-50" />
                  <h5 className="font-semibold text-primary text-sm">No Open Appointments on this Date</h5>
                  <p className="text-xs text-secondary mt-1">
                    Therapists are booked, on scheduled time off, or outside operating hours. Please pick another date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {/* Morning Section */}
                  {slotGroups.morning.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-2">
                        <Sun className="w-3.5 h-3.5 text-amber-700" />
                        <span>Morning (9:00 AM – 12:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slotGroups.morning.map((slot) => (
                          <button
                            key={slot.time}
                            id={`slot-${slot.time.replace(':', '-')}`}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                              selectedSlot?.time === slot.time
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-surface-container-lowest text-primary border-secondary/20 hover:border-primary hover:bg-surface-container'
                            }`}
                          >
                            <span className="block text-sm font-bold">{formatTime12h(slot.time)}</span>
                            {selectedTherapistId === 'any' && (
                              <span className="text-[10px] opacity-80 block truncate">
                                w/ {slot.therapist_name.split(' ')[0]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Section */}
                  {slotGroups.afternoon.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-2">
                        <Sunset className="w-3.5 h-3.5 text-orange-700" />
                        <span>Afternoon (12:00 PM – 4:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slotGroups.afternoon.map((slot) => (
                          <button
                            key={slot.time}
                            id={`slot-${slot.time.replace(':', '-')}`}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                              selectedSlot?.time === slot.time
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-surface-container-lowest text-primary border-secondary/20 hover:border-primary hover:bg-surface-container'
                            }`}
                          >
                            <span className="block text-sm font-bold">{formatTime12h(slot.time)}</span>
                            {selectedTherapistId === 'any' && (
                              <span className="text-[10px] opacity-80 block truncate">
                                w/ {slot.therapist_name.split(' ')[0]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening Section */}
                  {slotGroups.evening.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-2">
                        <Moon className="w-3.5 h-3.5 text-primary" />
                        <span>Evening (4:00 PM – 7:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slotGroups.evening.map((slot) => (
                          <button
                            key={slot.time}
                            id={`slot-${slot.time.replace(':', '-')}`}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                              selectedSlot?.time === slot.time
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-surface-container-lowest text-primary border-secondary/20 hover:border-primary hover:bg-surface-container'
                            }`}
                          >
                            <span className="block text-sm font-bold">{formatTime12h(slot.time)}</span>
                            {selectedTherapistId === 'any' && (
                              <span className="text-[10px] opacity-80 block truncate">
                                w/ {slot.therapist_name.split(' ')[0]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-secondary/20">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-full border border-secondary/30 text-primary font-semibold text-xs transition cursor-pointer hover:bg-surface-container"
            >
              Back to Specialists
            </button>

            <button
              id="btn-step2-continue"
              disabled={!selectedSlot}
              onClick={() => setCurrentStep(3)}
              className={`px-6 py-3 rounded-full font-semibold text-sm shadow-xs transition flex items-center gap-2 cursor-pointer ${
                selectedSlot
                  ? 'bg-[#FF6F3D] hover:opacity-90 text-white active:scale-95'
                  : 'bg-surface-container text-outline/50 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Confirm Slot & Proceed</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CLIENT DETAILS + STRIPE DEPOSIT PAYMENT */}
      {currentStep === 3 && selectedSlot && (
        <form onSubmit={handleAuthorizeAndConfirm} className="space-y-6">
          {/* Appointment Summary Card */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-secondary/20 shadow-xs">
            <h2 className="font-display text-2xl font-medium text-primary mb-1">
              Client Details & Deposit Payment
            </h2>
            <p className="text-xs sm:text-sm text-secondary mb-6">
              Please enter your contact information and customize your session preferences.
            </p>

            {/* Selected Booking Spec Pill */}
            <div className="bg-primary text-white rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-white/70 block text-[10px] uppercase tracking-wider font-semibold">Treatment</span>
                <span className="font-semibold text-sm">{selectedService.name}</span>
              </div>
              <div>
                <span className="text-white/70 block text-[10px] uppercase tracking-wider font-semibold">Date & Time</span>
                <span className="font-semibold text-sm">{formatDateShort(selectedDate)} at {formatTime12h(selectedSlot.time)}</span>
              </div>
              <div>
                <span className="text-white/70 block text-[10px] uppercase tracking-wider font-semibold">Specialist</span>
                <span className="font-semibold text-sm">
                  {selectedTherapistId === 'any' ? selectedSlot.therapist_name : (selectedTherapistObj?.name || 'Assigned Specialist')}
                </span>
              </div>
            </div>

            {/* Contact Details Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Email Address * (For Confirmation)
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="sarah@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Mobile Phone * (For SMS Reminder)
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            {/* Bodywork Intake Preferences */}
            <div className="border-t border-secondary/20 pt-6 mb-6">
              <h3 className="font-display text-lg font-medium text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6F3D]" />
                Therapeutic Preferences & Intake
              </h3>

              {/* Pressure Level Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Preferred Pressure Depth
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Gentle', 'Medium', 'Firm', 'Deep'] as PressureLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPressureLevel(level)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition text-center cursor-pointer ${
                        pressureLevel === level
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-surface-container text-primary border border-secondary/20 hover:bg-secondary-container'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Priority Focus Areas
                  </label>
                  <input
                    type="text"
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Upper shoulders, neck, lower back"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Allergies or Areas to Avoid
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-xs text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Lavender allergy, ticklish feet"
                  />
                </div>
              </div>
            </div>

            {/* Payment Amount Choice */}
            <div className="border-t border-secondary/20 pt-6 mb-6">
              <h3 className="font-display text-lg font-medium text-primary mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Payment Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div
                  onClick={() => setPaymentOption('deposit')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    paymentOption === 'deposit'
                      ? 'border-primary bg-secondary-container ring-1 ring-primary'
                      : 'border-secondary/20 bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-primary">Pay Deposit Only</span>
                    <span className="font-bold text-base text-[#FF6F3D]">${selectedService.deposit_amount}</span>
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    Locks your appointment slot. Remaining balance of ${selectedService.price - selectedService.deposit_amount} is collected after your session.
                  </p>
                </div>

                <div
                  onClick={() => setPaymentOption('full')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    paymentOption === 'full'
                      ? 'border-primary bg-secondary-container ring-1 ring-primary'
                      : 'border-secondary/20 bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-primary">Pay Full Amount</span>
                    <span className="font-bold text-base text-primary">${selectedService.price}</span>
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    Completely seamless checkout — enjoy your session without touching your wallet at the studio.
                  </p>
                </div>
              </div>

              {/* Stripe Payment Elements Mock UI */}
              <div className="bg-surface-container rounded-2xl p-5 border border-secondary/15">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold tracking-wider uppercase">
                      Stripe
                    </div>
                    <span className="text-xs font-semibold text-primary">Credit or Debit Card</span>
                  </div>
                  <span className="text-[11px] text-secondary flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    256-Bit SSL Encrypted
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-secondary absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary mb-1">Expires</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary font-mono text-center"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary font-mono text-center"
                        placeholder="CVC"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary mb-1">ZIP / Postal</label>
                      <input
                        type="text"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-secondary/30 bg-surface-container-lowest text-sm text-primary font-mono text-center"
                        placeholder="94107"
                      />
                    </div>
                  </div>
                </div>

                {/* Studio Policy Notification */}
                <div className="mt-4 pt-3 border-t border-secondary/15 flex items-start gap-2 text-xs text-secondary">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Studio Cancellation Policy:</strong> Full deposit refund if cancelled at least 24 hours prior to appointment. Late cancellations or no-shows forfeit the deposit.
                  </span>
                </div>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">
                {paymentError}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-secondary/20">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-full border border-secondary/30 text-primary font-semibold text-xs transition cursor-pointer hover:bg-surface-container"
              >
                Back to Date & Time
              </button>

              <button
                id="btn-confirm-and-pay"
                type="submit"
                disabled={isProcessingPayment}
                className="px-8 py-3.5 rounded-full bg-[#FF6F3D] hover:opacity-90 text-white font-semibold text-sm shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Stripe Deposit...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      Authorize ${paymentOption === 'full' ? selectedService.price : selectedService.deposit_amount} & Confirm
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
