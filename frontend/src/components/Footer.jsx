import React from 'react';

export default function Footer({ onNavigate, onOpenHostModal }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="font-display text-lg font-bold text-slate-950">
              Eventra
            </span>
            <p className="text-sm text-slate-600 mt-1 max-w-md">
              Modern event discovery, digital ticketing, and attendee check-in
              frontend built in ReactJS for MERN stack applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Explore Events
            </button>
            <button
              type="button"
              onClick={() => onNavigate('tickets')}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              My Tickets
            </button>
            <button
              type="button"
              onClick={() => onNavigate('organizer')}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Organizer Studio
            </button>
            <button
              type="button"
              onClick={onOpenHostModal}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Host an Event
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Eventra. All rights reserved.</p>
          <p>Ready for Express &amp; MongoDB REST integration.</p>
        </div>
      </div>
    </footer>
  );
}
