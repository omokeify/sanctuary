import React from 'react';
import { Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  onViewDetails: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onBook,
  onViewDetails,
}) => {
  return (
    <div 
      id={`service-card-${service.id}`}
      className="bg-surface-container-low rounded-2xl overflow-hidden border border-secondary/20 shadow-[0_4px_24px_rgba(40,57,39,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col group"
    >
      {/* Service Image with Category & Duration Badge */}
      <div className="aspect-video relative overflow-hidden bg-surface-container">
        <img
          src={service.image_url}
          alt={service.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm bg-opacity-90 tracking-wide uppercase">
          {service.category}
        </span>

        {/* Duration Badge */}
        <span className="absolute bottom-3.5 left-4 flex items-center gap-1 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-xs">
          <Clock className="w-3 h-3 text-[#FF6F3D]" />
          <span>{service.duration_minutes} Mins</span>
        </span>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3 
            onClick={() => onViewDetails(service)}
            className="font-display text-xl text-primary font-medium mb-1.5 cursor-pointer hover:text-[#FF6F3D] transition-colors leading-snug"
          >
            {service.name}
          </h3>
          
          <p className="text-xs text-secondary font-medium mb-3 italic">
            "{service.tagline}"
          </p>

          <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Quick benefits */}
          <div className="space-y-1 mb-4">
            {service.benefits.slice(0, 2).map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                <span className="truncate">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-auto pt-4 border-t border-secondary/15">
          <div className="flex items-center justify-between mb-3 text-xs text-secondary">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Online deposit:
            </span>
            <span className="font-semibold text-primary">${service.deposit_amount}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-secondary text-xs">{service.duration_minutes} mins</span>
              <span className="text-primary font-bold text-lg leading-none">${service.price}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id={`btn-details-${service.id}`}
                onClick={() => onViewDetails(service)}
                className="py-2 px-3 rounded-full border border-secondary/30 hover:border-primary text-primary font-medium text-xs transition cursor-pointer hover:bg-surface-container"
              >
                Details
              </button>

              <button
                id={`btn-book-${service.id}`}
                onClick={() => onBook(service)}
                className="bg-[#FF6F3D] text-[#ffffff] px-4 py-2 rounded-full font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              >
                <span>Book</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

