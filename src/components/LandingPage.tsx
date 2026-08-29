import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  MapPin, 
  HeartHandshake
} from 'lucide-react';
import { Service, Therapist, TherapistService } from '../types';
import { ServiceCard } from './ServiceCard';

interface LandingPageProps {
  services: Service[];
  therapists: Therapist[];
  therapistServices: TherapistService[];
  onBookService: (service: Service) => void;
  onViewServiceDetails: (service: Service) => void;
  onBookWithTherapist: (therapistId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  services,
  therapists,
  therapistServices,
  onBookService,
  onViewServiceDetails,
  onBookWithTherapist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Massage', 'Therapeutic', 'Specialty'];

  const filteredServices = selectedCategory === 'All'
    ? services.filter(s => s.active)
    : services.filter(s => s.active && s.category === selectedCategory);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 animate-fade-in bg-background text-on-background">
      {/* HERO SECTION (2-COLUMN MATCHING SNIPPET) */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column Text & CTA */}
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container text-primary text-xs font-semibold tracking-wide border border-secondary/20">
            <span className="material-symbols-outlined text-[16px] text-primary">spa</span>
            <span>Boutique Bodywork • Certified Licensed Therapists</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-primary font-medium leading-[1.12] tracking-tight">
            A tranquil haven for your body and mind.
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant max-w-md leading-relaxed">
            Experience tailored therapeutic massage and holistic bodywork designed to restore balance, release chronic tension, and calm your nervous system.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 items-center pt-2">
            <a
              href="#services"
              className="bg-[#FF6F3D] text-[#ffffff] px-8 py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book an Appointment</span>
            </a>

            <a
              href="#meet-therapists"
              className="px-6 py-3.5 rounded-full border border-secondary/30 text-primary font-semibold text-sm hover:bg-surface-container transition-colors cursor-pointer"
            >
              Meet Specialists
            </a>
          </div>

          {/* Studio Assurances Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-secondary/20 text-xs w-full">
            <div>
              <span className="font-bold text-primary block text-sm">100% Certified</span>
              <span className="text-secondary">500+ clinical hours</span>
            </div>
            <div>
              <span className="font-bold text-primary block text-sm">Private Suites</span>
              <span className="text-secondary">Heated hydraulic tables</span>
            </div>
            <div>
              <span className="font-bold text-primary block text-sm">Fair Policy</span>
              <span className="text-secondary">24h free cancellation</span>
            </div>
          </div>
        </div>

        {/* Right Column Hero Image Card */}
        <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-md border border-secondary/20 relative group bg-surface-container-low">
          <img
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80"
            alt="Forest Sanctuary Serene Suite"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Live Availability Badge */}
          <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md border border-white/40 text-primary shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">Today's Studio Status</span>
                <p className="font-semibold text-sm text-primary">Same-Day Openings Available</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE CATALOG SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-secondary/20">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Curated Menu</span>
            <h2 className="font-display text-3xl sm:text-4xl text-primary font-medium mt-1">
              Curated Treatment Menu
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mt-1.5 max-w-xl leading-relaxed">
              Each session includes organic warmed botanicals, customized pressure levels, and full intake consultation.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low text-primary border border-secondary/25 hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={onBookService}
              onViewDetails={onViewServiceDetails}
            />
          ))}
        </div>
      </section>

      {/* MEET THE THERAPISTS SECTION */}
      <section id="meet-therapists" className="bg-surface-container-low py-16 sm:py-20 border-y border-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Licensed Practitioners</span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-primary mt-1">
              Meet Our Specialists
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant mt-2 leading-relaxed">
              Every practitioner at Forest Sanctuary brings dedicated clinical expertise, advanced bodywork certifications, and an individualized therapeutic touch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {therapists.filter(t => t.active).map((therapist) => {
              const offers = therapistServices
                .filter(ts => ts.therapist_id === therapist.id)
                .map(ts => services.find(s => s.id === ts.service_id)?.name)
                .filter(Boolean);

              return (
                <div
                  key={therapist.id}
                  id={`therapist-landing-${therapist.id}`}
                  className="bg-surface-container-lowest rounded-2xl p-6 border border-secondary/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
                >
                  <div>
                    <div className="relative mb-5 overflow-hidden rounded-xl aspect-square bg-surface-container">
                      <img
                        src={therapist.photo_url}
                        alt={therapist.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                        {therapist.years_experience} Yrs Clinical Exp
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-medium text-primary">{therapist.name}</h3>
                    <p className="text-xs font-semibold text-secondary mb-2">{therapist.title}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{therapist.bio}</p>

                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] uppercase font-bold text-secondary block">Specialized Treatments</span>
                      <div className="flex flex-wrap gap-1.5">
                        {offers.map((srvName, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container text-primary border border-secondary/15 font-medium">
                            {srvName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onBookWithTherapist(therapist.id)}
                    className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>View Slots with {therapist.name.split(' ')[0]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STUDIO POLICY & ARRIVAL GUIDE */}
      <section id="policy" className="max-w-7xl mx-auto px-6">
        <div className="bg-surface-container-low rounded-2xl p-8 sm:p-12 border border-secondary/20 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display text-lg font-medium text-primary">24-Hour Cancellation Policy</h4>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Cancel or reschedule online with at least 24 hours notice for a full 100% deposit refund. Late cancellations forfeit deposit.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display text-lg font-medium text-primary">Studio Location & Parking</h4>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Located at 742 Evergreen Serenity Way, Suite 400. Dedicated complimentary heated underground parking available in stalls 40–55.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display text-lg font-medium text-primary">Sanctuary Standards</h4>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Hospital-grade HEPA air filtration in every private suite, organic cotton linens for every guest, and complimentary organic botanical tea service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MATCHING SNIPPET */}
      <footer className="w-full mt-20 bg-surface-container-highest border-t border-secondary/15">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">spa</span>
            <span className="font-display text-xl sm:text-2xl text-primary font-medium tracking-tight">Forest Sanctuary</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-secondary font-medium">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#meet-therapists" className="hover:text-primary transition-colors">Therapists</a>
            <a href="#policy" className="hover:text-primary transition-colors">Studio Policy</a>
          </div>

          <p className="text-xs sm:text-sm text-on-surface-variant text-center md:text-right">
            © {new Date().getFullYear()} Forest Sanctuary. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

