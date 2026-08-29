import React from 'react';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, User, Sparkles, HeartHandshake, Info } from 'lucide-react';
import { Service, Therapist, TherapistService } from '../types';

interface ServiceDetailPageProps {
  service: Service;
  therapists: Therapist[];
  therapistServices: TherapistService[];
  onBack: () => void;
  onBookWithTherapist: (service: Service, therapistId?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  therapists,
  therapistServices,
  onBack,
  onBookWithTherapist,
}) => {
  // Find therapists offering this service
  const qualifiedTherapists = therapists.filter(t => 
    t.active && therapistServices.some(ts => ts.therapist_id === t.id && ts.service_id === service.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-on-background">
      {/* Back button */}
      <button
        id="btn-back-to-catalog"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition mb-6 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Treatment Catalog
      </button>

      {/* Main Detail Header Card */}
      <div className="bg-surface-container-low rounded-2xl border border-secondary/20 shadow-sm overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left / Top Image */}
          <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[320px] bg-surface-container">
            <img
              src={service.image_url}
              alt={service.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary text-white shadow-xs">
                {service.category}
              </span>
            </div>
          </div>

          {/* Right Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-secondary font-semibold mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {service.duration_minutes} Minutes
                </span>
                <span>•</span>
                <span>One-on-One Private Suite</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-medium text-primary mb-2 leading-tight">
                {service.name}
              </h1>

              <p className="text-sm font-medium text-secondary italic mb-4">
                "{service.tagline}"
              </p>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Price & Deposit Highlight Box */}
              <div className="bg-surface-container rounded-xl p-4 border border-secondary/20 flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs text-secondary font-medium block">Total Treatment Investment</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">${service.price}</span>
                    <span className="text-xs text-secondary">(${service.deposit_amount} deposit required online)</span>
                  </div>
                </div>

                <button
                  id="btn-direct-book-service"
                  onClick={() => onBookWithTherapist(service)}
                  className="px-6 py-3 rounded-full bg-[#FF6F3D] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Choose Time
                </button>
              </div>
            </div>

            {/* Quick Benefits Checklist */}
            <div className="border-t border-secondary/20 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Primary Physiological Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended For & Preparation Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container-low rounded-2xl p-6 border border-secondary/20 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
            <HeartHandshake className="w-4 h-4 text-[#FF6F3D]" />
            Ideal For
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {service.recommended_for}
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 border border-secondary/20 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
            <Info className="w-4 h-4 text-primary" />
            Studio Preparation & Care
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Please arrive 10 minutes before your scheduled appointment to enjoy our complimentary organic herbal infusion and complete your intake notes.
          </p>
        </div>
      </div>

      {/* Available Therapists for this Service */}
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-secondary/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-secondary/20">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium text-primary">
              Licensed Specialists Offering This Treatment
            </h2>
            <p className="text-xs sm:text-sm text-secondary">
              Choose your preferred specialist or select "Any Available" during booking
            </p>
          </div>

          <button
            id="btn-book-any-therapist"
            onClick={() => onBookWithTherapist(service)}
            className="px-5 py-2.5 rounded-full border border-secondary/30 hover:border-primary text-primary font-semibold text-xs transition cursor-pointer hover:bg-surface-container"
          >
            Book with Any Available Specialist
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qualifiedTherapists.map((therapist) => (
            <div
              key={therapist.id}
              id={`therapist-card-${therapist.id}`}
              className="bg-surface-container-lowest rounded-2xl p-5 border border-secondary/20 flex flex-col justify-between hover:border-primary transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={therapist.photo_url}
                    alt={therapist.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-secondary"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-primary">{therapist.name}</h4>
                    <p className="text-[11px] text-secondary font-medium">{therapist.title}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-primary bg-secondary-container px-2 py-0.2 rounded-full">
                      {therapist.years_experience} Yrs Experience
                    </span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-3">
                  {therapist.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {therapist.specialties.map((s, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container text-primary border border-secondary/15 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button
                id={`btn-select-therapist-${therapist.id}`}
                onClick={() => onBookWithTherapist(service, therapist.id)}
                className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-container text-white font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Book with {therapist.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

