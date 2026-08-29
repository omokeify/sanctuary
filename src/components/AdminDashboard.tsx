import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  DollarSign, 
  Coffee, 
  Send,
  RefreshCw,
  CheckCircle2,
  CalendarX
} from 'lucide-react';
import { Availability, Booking, BookingStatus, Service, Therapist, TherapistService, TimeOff } from '../types';
import { formatDateLong, formatDateShort, formatTime12h } from '../lib/availabilityEngine';

interface AdminDashboardProps {
  services: Service[];
  therapists: Therapist[];
  therapistServices: TherapistService[];
  availabilities: Availability[];
  timeOffs: TimeOff[];
  bookings: Booking[];
  onUpdateServices: (services: Service[]) => void;
  onUpdateTherapists: (therapists: Therapist[]) => void;
  onUpdateTherapistServices: (ts: TherapistService[]) => void;
  onUpdateAvailabilities: (availabilities: Availability[]) => void;
  onUpdateTimeOffs: (timeOffs: TimeOff[]) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onAddManualBooking: (booking: Booking) => void;
  onTriggerTestReminder: (bookingId: string) => void;
  onResetDemoData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  therapists,
  therapistServices,
  availabilities,
  timeOffs,
  bookings,
  onUpdateServices,
  onUpdateTherapists,
  onUpdateTherapistServices,
  onUpdateAvailabilities,
  onUpdateTimeOffs,
  onUpdateBookingStatus,
  onAddManualBooking,
  onTriggerTestReminder,
  onResetDemoData,
}) => {
  const [adminTab, setAdminTab] = useState<'calendar' | 'services' | 'therapists' | 'timeoff' | 'settings'>('calendar');

  // Calendar filter state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  });
  const [selectedTherapistFilter, setSelectedTherapistFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Service Edit / Create Modal state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState<boolean>(false);

  // Therapist Edit / Create Modal state
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);

  // Time-Off Blocker Modal state
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState<boolean>(false);
  const [newTimeOffTherapistId, setNewTimeOffTherapistId] = useState<string>(therapists[0]?.id || '');
  const [newTimeOffDate, setNewTimeOffDate] = useState<string>(selectedDate);
  const [newTimeOffReason, setNewTimeOffReason] = useState<string>('Personal Day / Continuing Education');

  // Filter bookings for Calendar view
  const filteredBookings = bookings.filter(b => {
    if (selectedTherapistFilter !== 'all' && b.therapist_id !== selectedTherapistFilter) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.client_name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.client_email.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));

  // Service CRUD handlers
  const handleSaveService = (serviceToSave: Service) => {
    const exists = services.some(s => s.id === serviceToSave.id);
    let updated: Service[];
    if (exists) {
      updated = services.map(s => s.id === serviceToSave.id ? serviceToSave : s);
    } else {
      updated = [...services, serviceToSave];
    }
    onUpdateServices(updated);
    setEditingService(null);
    setIsNewServiceModalOpen(false);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      onUpdateServices(services.filter(s => s.id !== serviceId));
    }
  };

  // Add Time Off Exception handler
  const handleAddTimeOff = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TimeOff = {
      id: `to-${Date.now()}`,
      therapist_id: newTimeOffTherapistId,
      date: newTimeOffDate,
      start_time: '00:00',
      end_time: '23:59',
      reason: newTimeOffReason,
    };
    onUpdateTimeOffs([...timeOffs, newEntry]);
    setIsTimeOffModalOpen(false);
  };

  const handleDeleteTimeOff = (id: string) => {
    onUpdateTimeOffs(timeOffs.filter(t => t.id !== id));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-on-background">
      {/* Top Banner */}
      <div className="bg-primary text-on-primary rounded-3xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-tertiary-fixed" />
            <span className="text-xs uppercase font-semibold tracking-wider text-on-primary/80">Admin & Operations Portal</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Studio Master Control</h1>
          <p className="text-xs sm:text-sm text-on-primary/80 mt-1 max-w-xl">
            Manage live appointments, therapist schedules, time-off exceptions, and treatment catalog.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 text-xs">
          <div className="text-center px-2">
            <span className="block font-bold text-xl text-white">{bookings.length}</span>
            <span className="text-on-primary/70 text-[10px] uppercase font-semibold">Bookings</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <span className="block font-bold text-xl text-tertiary-fixed">{services.length}</span>
            <span className="text-on-primary/70 text-[10px] uppercase font-semibold">Treatments</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <span className="block font-bold text-xl text-secondary-fixed">{therapists.length}</span>
            <span className="text-on-primary/70 text-[10px] uppercase font-semibold">Therapists</span>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-surface-container-lowest p-2 rounded-full border border-outline-variant/30 shadow-xs">
        <button
          id="admin-tab-calendar"
          onClick={() => setAdminTab('calendar')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'calendar'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-container-low'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Bookings & Calendar ({bookings.length})</span>
        </button>

        <button
          id="admin-tab-services"
          onClick={() => setAdminTab('services')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'services'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-container-low'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Services & Pricing ({services.length})</span>
        </button>

        <button
          id="admin-tab-therapists"
          onClick={() => setAdminTab('therapists')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'therapists'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-container-low'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Therapists & Shifts ({therapists.length})</span>
        </button>

        <button
          id="admin-tab-timeoff"
          onClick={() => setAdminTab('timeoff')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
            adminTab === 'timeoff'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-container-low'
          }`}
        >
          <CalendarX className="w-4 h-4" />
          <span>Time-Off Exceptions ({timeOffs.length})</span>
        </button>

        <button
          id="admin-tab-settings"
          onClick={() => setAdminTab('settings')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ml-auto ${
            adminTab === 'settings'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-container-low'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Studio Settings</span>
        </button>
      </div>

      {/* TAB 1: MASTER BOOKINGS & CALENDAR */}
      {adminTab === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Controls & Filters Bar */}
          <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/30 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search client or ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-low text-xs text-on-background focus:outline-none focus:border-primary w-48 sm:w-60"
                />
                <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
              </div>

              {/* Therapist Filter */}
              <select
                value={selectedTherapistFilter}
                onChange={(e) => setSelectedTherapistFilter(e.target.value)}
                className="px-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-low text-xs text-on-background font-semibold focus:outline-none focus:border-primary"
              >
                <option value="all">All Therapists</option>
                {therapists.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-low text-xs text-on-background font-semibold focus:outline-none focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div className="text-xs text-secondary font-medium">
              Showing <strong className="text-primary">{filteredBookings.length}</strong> matching appointments
            </div>
          </div>

          {/* Bookings Table / Cards Grid */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-background">
                <thead className="bg-surface-container-low border-b border-outline-variant/30 text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Ref / Client</th>
                    <th className="py-4 px-4">Treatment</th>
                    <th className="py-4 px-4">Therapist</th>
                    <th className="py-4 px-4">Date & Time</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-secondary">
                        No bookings match your selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const srv = services.find(s => s.id === b.service_id);
                      const th = therapists.find(t => t.id === b.therapist_id);

                      return (
                        <tr key={b.id} className="hover:bg-surface-container-low/60 transition">
                          <td className="py-4 px-5">
                            <span className="font-mono font-bold text-primary block">{b.id}</span>
                            <span className="font-semibold text-sm block text-on-background">{b.client_name}</span>
                            <span className="text-[11px] text-secondary">{b.client_email} • {b.client_phone}</span>
                            {b.client_preferences && (
                              <span className="inline-block mt-1 text-[10px] bg-surface-container-high text-primary px-2 py-0.5 rounded-full font-medium">
                                Pressure: {b.client_preferences.pressure_level}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-xs block text-primary">{srv?.name || 'Custom Session'}</span>
                            <span className="text-[11px] text-secondary">{srv?.duration_minutes} min • ${b.total_price}</span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={th?.photo_url}
                                alt={th?.name}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                              />
                              <span className="font-medium text-xs">{th?.name || 'Unassigned'}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold text-xs block">{formatDateShort(b.date)}</span>
                            <span className="text-[11px] text-primary font-semibold">{formatTime12h(b.start_time)} – {formatTime12h(b.end_time)}</span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-xs text-primary block">${b.deposit_paid} Dep. Paid</span>
                            <span className="text-[10px] text-secondary">Bal: ${b.total_price - b.deposit_paid}</span>
                          </td>

                          <td className="py-4 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'confirmed'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : b.status === 'completed'
                                ? 'bg-primary-fixed text-on-primary-fixed'
                                : b.status === 'cancelled'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface-container-highest text-secondary'
                            }`}>
                              {b.status}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right space-x-1 whitespace-nowrap">
                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  title="Mark Completed"
                                  onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                                  className="p-1.5 rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  title="Mark No-Show"
                                  onClick={() => onUpdateBookingStatus(b.id, 'no_show')}
                                  className="p-1.5 rounded-full bg-surface-container-high text-secondary hover:bg-secondary hover:text-white transition cursor-pointer"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                                <button
                                  title="Cancel Appointment"
                                  onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                                  className="p-1.5 rounded-full bg-error-container text-on-error-container hover:bg-error hover:text-white transition cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  title="Dispatch Test 24h Reminder (Resend)"
                                  onClick={() => onTriggerTestReminder(b.id)}
                                  className="p-1.5 rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES & PRICING CRUD */}
      {adminTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary">Studio Service Catalog</h2>
              <p className="text-xs text-secondary">Configure treatments, durations, pricing, and required deposit amounts.</p>
            </div>

            <button
              id="btn-add-service"
              onClick={() => {
                setEditingService({
                  id: `srv-${Date.now()}`,
                  name: '',
                  tagline: '',
                  description: '',
                  duration_minutes: 60,
                  price: 120,
                  deposit_amount: 30,
                  image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80',
                  active: true,
                  category: 'Massage',
                  benefits: ['Muscle relaxation', 'Stress reduction'],
                  recommended_for: 'General relaxation and wellness.'
                });
                setIsNewServiceModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Treatment</span>
            </button>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={srv.image_url}
                        alt={srv.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-outline-variant/30 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-primary px-2.5 py-0.5 rounded-full">
                          {srv.category}
                        </span>
                        <h3 className="font-bold text-base text-primary mt-1">{srv.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingService(srv);
                          setIsNewServiceModalOpen(true);
                        }}
                        className="p-2 rounded-full text-secondary hover:text-primary hover:bg-surface-container-low cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-2 rounded-full text-error hover:bg-error-container cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-on-background/80 line-clamp-2 mb-4 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-secondary block uppercase font-bold">Duration</span>
                      <strong className="text-primary">{srv.duration_minutes} min</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-secondary block uppercase font-bold">Full Price</span>
                      <strong className="text-primary">${srv.price}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-secondary block uppercase font-bold">Deposit</span>
                      <strong className="text-tertiary font-bold">${srv.deposit_amount}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/20 text-xs">
                  <span className="text-secondary">Status: {srv.active ? 'Active & Bookable' : 'Inactive'}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-semibold text-primary">Active</span>
                    <input
                      type="checkbox"
                      checked={srv.active}
                      onChange={(e) => {
                        handleSaveService({ ...srv, active: e.target.checked });
                      }}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: THERAPISTS & WEEKLY AVAILABILITY */}
      {adminTab === 'therapists' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary">Therapists & Shift Schedules</h2>
              <p className="text-xs text-secondary">Configure weekly recurring templates, working hours, and lunch breaks.</p>
            </div>
          </div>

          <div className="space-y-6">
            {therapists.map((therapist) => {
              const therapistAvails = availabilities.filter(a => a.therapist_id === therapist.id);
              const assignedServices = therapistServices
                .filter(ts => ts.therapist_id === therapist.id)
                .map(ts => services.find(s => s.id === ts.service_id)?.name)
                .filter(Boolean);

              return (
                <div
                  key={therapist.id}
                  className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <img
                        src={therapist.photo_url}
                        alt={therapist.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-outline-variant/40"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-bold text-primary">{therapist.name}</h3>
                          <span className="text-[10px] bg-secondary-container text-on-secondary-container font-bold px-2.5 py-0.5 rounded-full">
                            {therapist.years_experience} Yrs Exp
                          </span>
                        </div>
                        <p className="text-xs text-secondary font-medium">{therapist.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {assignedServices.map((sn, i) => (
                            <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary border border-outline-variant/30">
                              ✓ {sn}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Shift Grid */}
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                      Weekly Recurring Availability Schedule
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                      {[1, 2, 3, 4, 5, 6, 0].map((dIndex) => {
                        const shift = therapistAvails.find(a => a.day_of_week === dIndex);
                        const isWorking = !!shift;

                        return (
                          <div
                            key={dIndex}
                            className={`p-3 rounded-2xl border text-center transition ${
                              isWorking
                                ? 'bg-surface-container-low border-outline-variant/40 shadow-xs'
                                : 'bg-surface-container/30 border-outline-variant/20 text-secondary/50'
                            }`}
                          >
                            <span className="text-[11px] font-bold uppercase block text-secondary">
                              {dayNames[dIndex].slice(0, 3)}
                            </span>
                            {isWorking ? (
                              <div className="mt-1">
                                <span className="text-xs font-bold text-primary block">
                                  {formatTime12h(shift.start_time)}
                                </span>
                                <span className="text-[10px] text-secondary block">
                                  to {formatTime12h(shift.end_time)}
                                </span>
                                {shift.break_start && (
                                  <span className="text-[9px] text-tertiary block mt-0.5 font-semibold">
                                    Break: {formatTime12h(shift.break_start)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] mt-1 block italic text-secondary/60">Off</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TIME OFF & EXCEPTIONS */}
      {adminTab === 'timeoff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary">Time-Off & Blackout Blocks</h2>
              <p className="text-xs text-secondary">
                The availability engine cross-references these exceptions and immediately removes slots from client booking.
              </p>
            </div>

            <button
              onClick={() => setIsTimeOffModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Time-Off Exception</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-on-background">
              <thead className="bg-surface-container-low border-b border-outline-variant/30 text-[11px] font-semibold text-secondary uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">Therapist</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Time Window</th>
                  <th className="py-4 px-4">Reason / Notes</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {timeOffs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-secondary">
                      No active time-off exceptions recorded.
                    </td>
                  </tr>
                ) : (
                  timeOffs.map((to) => {
                    const th = therapists.find(t => t.id === to.therapist_id);
                    return (
                      <tr key={to.id} className="hover:bg-surface-container-low/60 transition">
                        <td className="py-4 px-5 font-bold flex items-center gap-2">
                          <img
                            src={th?.photo_url}
                            alt={th?.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-outline-variant/40"
                          />
                          <span>{th?.name}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold">{formatDateLong(to.date)}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-[10px]">
                            {to.start_time === '00:00' && to.end_time === '23:59' ? 'All Day Blackout' : `${formatTime12h(to.start_time)} – ${formatTime12h(to.end_time)}`}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-secondary">{to.reason}</td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleDeleteTimeOff(to.id)}
                            className="p-1.5 rounded-full text-error hover:bg-error-container transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STUDIO SETTINGS & DEMO RESET */}
      {adminTab === 'settings' && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary">Studio Operating Settings</h2>
            <p className="text-xs text-secondary">Platform parameters and demo database management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/20">
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <h4 className="font-bold text-sm text-primary mb-1">Cancellation Policy Window</h4>
              <p className="text-xs text-secondary mb-3 leading-relaxed">
                Clients cancelling more than 24 hours in advance receive automatic 100% deposit refunds. Cancellations under 24 hours forfeit deposit.
              </p>
              <div className="text-xs font-semibold text-primary bg-surface-container-lowest px-3.5 py-2 rounded-full border border-outline-variant/30 inline-block">
                Enforcement Window: 24 Hours Active
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <h4 className="font-bold text-sm text-primary mb-1">Reset Demo Database</h4>
              <p className="text-xs text-secondary mb-3 leading-relaxed">
                Re-seeds initial services, therapists, schedules, and test client bookings.
              </p>
              <button
                onClick={() => {
                  if (confirm('Reset database to initial pristine seed state?')) {
                    onResetDemoData();
                  }
                }}
                className="px-5 py-2.5 rounded-full bg-error hover:bg-error/90 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                Reset Database to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT SERVICE MODAL */}
      {isNewServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/30 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-primary">
                {services.some(s => s.id === editingService.id) ? 'Edit Treatment' : 'Add New Treatment'}
              </h3>
              <button
                onClick={() => setIsNewServiceModalOpen(false)}
                className="p-1.5 rounded-full text-secondary hover:text-primary hover:bg-surface-container-low cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveService(editingService);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-primary mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-background focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingService.tagline}
                  onChange={(e) => setEditingService({ ...editingService, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-background focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-background focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-primary mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    step={15}
                    required
                    value={editingService.duration_minutes}
                    onChange={(e) => setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">Deposit ($)</label>
                  <input
                    type="number"
                    required
                    value={editingService.deposit_amount}
                    onChange={(e) => setEditingService({ ...editingService, deposit_amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs font-bold text-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Category</label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-background focus:outline-none focus:border-primary"
                >
                  <option value="Massage">Massage</option>
                  <option value="Bodywork">Bodywork</option>
                  <option value="Therapeutic">Therapeutic</option>
                  <option value="Specialty">Specialty</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-outline-variant/40 text-secondary hover:text-primary hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-white font-semibold shadow-sm cursor-pointer"
                >
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TIME OFF MODAL */}
      {isTimeOffModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/30 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-primary">
                Block Therapist Time-Off
              </h3>
              <button
                onClick={() => setIsTimeOffModalOpen(false)}
                className="p-1.5 rounded-full text-secondary hover:text-primary hover:bg-surface-container-low cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTimeOff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-primary mb-1">Select Therapist</label>
                <select
                  value={newTimeOffTherapistId}
                  onChange={(e) => setNewTimeOffTherapistId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-background focus:outline-none focus:border-primary"
                >
                  {therapists.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newTimeOffDate}
                  onChange={(e) => setNewTimeOffDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs font-bold text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={newTimeOffReason}
                  onChange={(e) => setNewTimeOffReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-background focus:outline-none focus:border-primary"
                  placeholder="e.g. Personal Vacation, Training"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsTimeOffModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-outline-variant/40 text-secondary hover:text-primary hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary hover:bg-primary-container text-white font-semibold shadow-sm cursor-pointer"
                >
                  Add Time-Off Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
