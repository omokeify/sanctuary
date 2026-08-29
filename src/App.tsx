import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  Availability, 
  Booking, 
  BookingStatus, 
  Client, 
  ClientPreferences, 
  NotificationLog, 
  Service, 
  Therapist, 
  TherapistService, 
  TimeOff 
} from './types';
import { 
  AppState, 
  loadAppState, 
  resetAppState, 
  saveAppState 
} from './lib/storage';
import { notificationService } from './lib/notifications';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ServiceDetailPage } from './components/ServiceDetailPage';
import { BookingFlow } from './components/BookingFlow';
import { ConfirmationPage } from './components/ConfirmationPage';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';

export default function App() {
  // App-level state loaded from local persistence
  const [appState, setAppState] = useState<AppState>(() => loadAppState());

  // Current view & flow selection
  const [currentView, setCurrentView] = useState<AppView>('catalog');
  const [selectedService, setSelectedService] = useState<Service>(appState.services[0]);
  const [preselectedTherapistId, setPreselectedTherapistId] = useState<string | undefined>(undefined);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState<Booking | null>(null);

  // Notification logs state for drawer
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    try {
      const raw = localStorage.getItem('soma_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Helper to refresh notification logs
  const reloadNotificationLogs = () => {
    try {
      const raw = localStorage.getItem('soma_notifications');
      setNotificationLogs(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error(e);
    }
  };

  // Start booking for a specific service or default
  const handleStartBooking = (service?: Service, therapistId?: string) => {
    if (service) {
      setSelectedService(service);
    } else if (appState.services.length > 0) {
      setSelectedService(appState.services[0]);
    }
    setPreselectedTherapistId(therapistId);
    setCurrentView('booking_flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View Service Details
  const handleViewServiceDetails = (service: Service) => {
    setSelectedService(service);
    setCurrentView('service_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // On successful booking completion
  const handleBookingComplete = async (newBooking: Booking) => {
    // 1. Add booking to persistent state
    const updatedBookings = [newBooking, ...appState.bookings];
    setAppState(prev => ({
      ...prev,
      bookings: updatedBookings,
    }));

    // 2. Dispatch notifications via Resend and Twilio stubs
    const service = appState.services.find(s => s.id === newBooking.service_id) || selectedService;
    const therapist = appState.therapists.find(t => t.id === newBooking.therapist_id) || appState.therapists[0];

    await notificationService.sendBookingConfirmation(newBooking, service, therapist);
    reloadNotificationLogs();

    // 3. Navigate to Confirmation view
    setActiveConfirmedBooking(newBooking);
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel booking handler with 24-hour policy rule
  const handleCancelBooking = async (bookingId: string, reason: string, isWithin24Hours: boolean) => {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const refundAmount = isWithin24Hours ? 0 : booking.deposit_paid;

    const updatedBookings = appState.bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled' as BookingStatus,
          payment_status: refundAmount > 0 ? ('refunded' as const) : b.payment_status,
          cancellation_reason: reason,
        };
      }
      return b;
    });

    setAppState(prev => ({
      ...prev,
      bookings: updatedBookings,
    }));

    const service = appState.services.find(s => s.id === booking.service_id) || appState.services[0];
    const therapist = appState.therapists.find(t => t.id === booking.therapist_id) || appState.therapists[0];

    await notificationService.sendCancellationNotice(booking, service, therapist, refundAmount);
    reloadNotificationLogs();
  };

  // Reschedule booking handler
  const handleRescheduleBooking = async (
    bookingId: string, 
    newDate: string, 
    newStartTime: string, 
    newEndTime: string
  ) => {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const oldDate = booking.date;
    const oldTime = booking.start_time;

    const updatedBookings = appState.bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
        };
      }
      return b;
    });

    setAppState(prev => ({
      ...prev,
      bookings: updatedBookings,
    }));

    const updatedBooking = { ...booking, date: newDate, start_time: newStartTime, end_time: newEndTime };
    const service = appState.services.find(s => s.id === booking.service_id) || appState.services[0];
    const therapist = appState.therapists.find(t => t.id === booking.therapist_id) || appState.therapists[0];

    await notificationService.sendRescheduleNotice(updatedBooking, service, therapist, oldDate, oldTime);
    reloadNotificationLogs();
  };

  // Update client intake preferences
  const handleUpdateClientPreferences = (prefs: ClientPreferences) => {
    setAppState(prev => ({
      ...prev,
      client: {
        ...prev.client,
        preferences: prefs,
      }
    }));
  };

  // Admin: Update booking status (e.g. mark completed, no-show, cancelled)
  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setAppState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, status } : b)
    }));
  };

  // Admin: Trigger test 24h reminder
  const handleTriggerTestReminder = async (bookingId: string) => {
    const booking = appState.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const service = appState.services.find(s => s.id === booking.service_id) || appState.services[0];
    const therapist = appState.therapists.find(t => t.id === booking.therapist_id) || appState.therapists[0];

    await notificationService.send24hReminder(booking, service, therapist);
    reloadNotificationLogs();
    setIsNotificationDrawerOpen(true);
  };

  // Admin: Reset database to seeds
  const handleResetDemoData = () => {
    const fresh = resetAppState();
    setAppState(fresh);
    localStorage.removeItem('soma_notifications');
    setNotificationLogs([]);
    setCurrentView('catalog');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-sans selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Main Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentRole={appState.currentRole}
        setCurrentRole={(role) => setAppState(prev => ({ ...prev, currentRole: role }))}
        client={appState.client}
        onStartBooking={() => handleStartBooking()}
        notificationCount={notificationLogs.length}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: LANDING & CATALOG */}
        {currentView === 'catalog' && (
          <LandingPage
            services={appState.services}
            therapists={appState.therapists}
            therapistServices={appState.therapistServices}
            onBookService={(srv) => handleStartBooking(srv)}
            onViewServiceDetails={handleViewServiceDetails}
            onBookWithTherapist={(therapistId) => handleStartBooking(undefined, therapistId)}
          />
        )}

        {/* VIEW 2: SERVICE DETAIL */}
        {currentView === 'service_detail' && (
          <ServiceDetailPage
            service={selectedService}
            therapists={appState.therapists}
            therapistServices={appState.therapistServices}
            onBack={() => setCurrentView('catalog')}
            onBookWithTherapist={(srv, therapistId) => handleStartBooking(srv, therapistId)}
          />
        )}

        {/* VIEW 3: 3-STEP UNIFIED BOOKING FLOW */}
        {currentView === 'booking_flow' && (
          <BookingFlow
            service={selectedService}
            preselectedTherapistId={preselectedTherapistId}
            allServices={appState.services}
            allTherapists={appState.therapists}
            therapistServices={appState.therapistServices}
            availabilities={appState.availabilities}
            timeOffs={appState.timeOffs}
            bookings={appState.bookings}
            client={appState.client}
            onCancel={() => setCurrentView('catalog')}
            onBookingComplete={handleBookingComplete}
          />
        )}

        {/* VIEW 4: CONFIRMATION & CALENDAR SYNC */}
        {currentView === 'confirmation' && activeConfirmedBooking && (
          <ConfirmationPage
            booking={activeConfirmedBooking}
            service={appState.services.find(s => s.id === activeConfirmedBooking.service_id) || selectedService}
            therapist={appState.therapists.find(t => t.id === activeConfirmedBooking.therapist_id) || appState.therapists[0]}
            onGoToDashboard={() => setCurrentView('client_dashboard')}
            onBookAnother={() => setCurrentView('catalog')}
            onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          />
        )}

        {/* VIEW 5: CLIENT DASHBOARD */}
        {currentView === 'client_dashboard' && (
          <ClientDashboard
            client={appState.client}
            bookings={appState.bookings}
            services={appState.services}
            therapists={appState.therapists}
            therapistServices={appState.therapistServices}
            availabilities={appState.availabilities}
            timeOffs={appState.timeOffs}
            onUpdateClientPreferences={handleUpdateClientPreferences}
            onCancelBooking={handleCancelBooking}
            onRescheduleBooking={handleRescheduleBooking}
            onBookNewTreatment={() => handleStartBooking()}
          />
        )}

        {/* VIEW 6: ADMIN DASHBOARD */}
        {currentView === 'admin_dashboard' && (
          <AdminDashboard
            services={appState.services}
            therapists={appState.therapists}
            therapistServices={appState.therapistServices}
            availabilities={appState.availabilities}
            timeOffs={appState.timeOffs}
            bookings={appState.bookings}
            onUpdateServices={(srvs) => setAppState(prev => ({ ...prev, services: srvs }))}
            onUpdateTherapists={(ths) => setAppState(prev => ({ ...prev, therapists: ths }))}
            onUpdateTherapistServices={(tss) => setAppState(prev => ({ ...prev, therapistServices: tss }))}
            onUpdateAvailabilities={(avs) => setAppState(prev => ({ ...prev, availabilities: avs }))}
            onUpdateTimeOffs={(tos) => setAppState(prev => ({ ...prev, timeOffs: tos }))}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddManualBooking={(b) => setAppState(prev => ({ ...prev, bookings: [b, ...prev.bookings] }))}
            onTriggerTestReminder={handleTriggerTestReminder}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Slide-out Notification Dispatch Logs Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        logs={notificationLogs}
        onClearLogs={() => {
          localStorage.removeItem('soma_notifications');
          setNotificationLogs([]);
        }}
      />
    </div>
  );
}
