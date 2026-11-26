import React from 'react';
import { ArrowRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';

export default function HeroSection({
  onBrowseClick,
  onOpenOrganizer,
  totalEvents,
  totalSeatsBooked,
}) {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* 2-Column Split Hero with items-stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500 mb-3">
              Event Discovery &amp; Organizer Operations
            </p>
            <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-tight text-slate-950 leading-[1.1] text-balance mb-5">
              Plan live events, issue instant passes, and run smooth check-ins.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-[58ch] mb-8">
              One unified platform for technical hackathons, executive summits,
              design workshops, and cultural evenings. Browse upcoming dates or
              step into the organizer console to manage attendees in real time.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onBrowseClick}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
              >
                <span>Browse Upcoming Events</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenOrganizer}
                className="inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-slate-800 hover:text-blue-800 border-b border-slate-300 hover:border-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                Open Organizer Studio
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px] lg:min-h-[380px]">
              <ImageWithFallback
                src="/src/assets/images/hero_event_auditorium_1794733986850.jpg"
                alt="Packed modern glass and timber auditorium during a keynote event"
                fallbackTitle="Eventra Main Auditorium"
                className="w-full h-full lg:h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-Column Quantitative Strip below Hero Split */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-slate-950 tabular-nums">
              {totalEvents}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Active Published Events
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-slate-950 tabular-nums">
              {totalSeatsBooked.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Confirmed Attendee Passes
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-slate-950 tabular-nums">
              99.4%
            </p>
            <p className="text-sm text-slate-600 mt-1">
              On-Site Gate Check-In Rate
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-slate-950 tabular-nums">
              &lt; 2 min
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Average Ticket Checkout Time
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
