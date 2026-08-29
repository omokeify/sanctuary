import React from 'react';
import { Bell, Calendar, Shield, Sparkles } from 'lucide-react';
import { AppView, Client } from '../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentRole: 'client' | 'admin';
  setCurrentRole: (role: 'client' | 'admin') => void;
  client: Client;
  onStartBooking: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentRole,
  setCurrentRole,
  client,
  onStartBooking,
  notificationCount,
  onOpenNotifications,
}) => {
  return (
    <header className="w-full top-0 sticky z-50 bg-background/95 backdrop-blur-md border-b border-secondary/20 shadow-xs">
      {/* Top micro-bar for hours, notifications & role switch */}
      <div className="bg-surface-container-high px-4 py-1.5 border-b border-secondary/10 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-on-surface-variant">
            <span className="hidden sm:inline flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">location_on</span>
              742 Evergreen Serenity Way • Suite 400
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">schedule</span>
              Mon–Sat 9am – 7pm
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification logs drawer trigger */}
            <button
              id="btn-notifications-drawer"
              onClick={onOpenNotifications}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-low hover:bg-surface-container text-primary transition text-xs font-medium cursor-pointer border border-secondary/20"
              title="View simulated email & SMS logs"
            >
              <Bell className="w-3.5 h-3.5 text-secondary" />
              <span className="hidden xs:inline">Notifications</span>
              {notificationCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FF6F3D] text-white rounded-full text-[10px] font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Role switch toggle */}
            <div className="flex items-center bg-surface-container-highest p-0.5 rounded-full border border-secondary/20">
              <button
                id="btn-role-client"
                onClick={() => {
                  setCurrentRole('client');
                  if (currentView === 'admin_dashboard') setCurrentView('catalog');
                }}
                className={`px-3 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  currentRole === 'client'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Client View
              </button>
              <button
                id="btn-role-admin"
                onClick={() => {
                  setCurrentRole('admin');
                  setCurrentView('admin_dashboard');
                }}
                className={`px-3 py-0.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  currentRole === 'admin'
                    ? 'bg-[#FF6F3D] text-white shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Shield className="w-3 h-3" />
                Admin Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div 
            id="brand-logo"
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <span className="material-symbols-outlined text-2xl text-primary">spa</span>
            </div>
            <div>
              <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-primary block leading-tight">
                Forest Sanctuary
              </span>
              <span className="text-[10px] tracking-wider uppercase text-secondary font-semibold">
                Boutique Bodywork & Massage
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              id="nav-services"
              onClick={() => setCurrentView('catalog')}
              className={`text-sm transition-colors duration-300 cursor-pointer ${
                currentView === 'catalog' || currentView === 'service_detail'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-secondary font-medium hover:text-primary'
              }`}
            >
              Treatments
            </button>

            <a
              href="#meet-therapists"
              onClick={(e) => {
                if (currentView !== 'catalog') {
                  e.preventDefault();
                  setCurrentView('catalog');
                  setTimeout(() => {
                    document.getElementById('meet-therapists')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="text-sm text-secondary font-medium hover:text-primary transition-colors duration-300 cursor-pointer"
            >
              Therapists
            </a>

            <button
              id="nav-client-dashboard"
              onClick={() => setCurrentView('client_dashboard')}
              className={`text-sm transition-colors duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'client_dashboard'
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-secondary font-medium hover:text-primary'
              }`}
            >
              <Calendar className="w-4 h-4 text-secondary" />
              My Appointments
            </button>

            {currentRole === 'admin' && (
              <button
                id="nav-admin-dashboard"
                onClick={() => setCurrentView('admin_dashboard')}
                className={`text-sm transition-colors duration-300 cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin_dashboard'
                    ? 'text-[#FF6F3D] font-bold border-b-2 border-[#FF6F3D] pb-1'
                    : 'text-[#FF6F3D] hover:opacity-80 font-medium'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </nav>

          {/* CTA & User Action */}
          <div className="flex items-center gap-3">
            {currentRole === 'client' ? (
              <button
                id="btn-header-book"
                onClick={onStartBooking}
                className="bg-[#FF6F3D] text-[#ffffff] px-6 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book Treatment</span>
              </button>
            ) : (
              <button
                id="btn-header-admin-manage"
                onClick={() => setCurrentView('admin_dashboard')}
                className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-xs sm:text-sm hover:bg-primary-container transition cursor-pointer"
              >
                Schedule Grid
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

