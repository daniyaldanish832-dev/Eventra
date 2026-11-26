import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({
  activeView,
  onNavigate,
  onOpenHostModal,
  onOpenAuthModal,
  currentUser,
  onSignOut,
  ticketCount,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('events')}
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm cursor-pointer"
        >
          Eventra
        </button>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleNavClick('events')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              activeView === 'events'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            Explore Events
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('tickets')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              activeView === 'tickets'
                ? 'border-blue-800 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950 hover:border-slate-300'
            }`}
          >
            My Tickets ({ticketCount})
          </button>

        

          {currentUser ? (
            <button
              type="button"
              onClick={onSignOut}
              className="py-1 border-b-2 border-transparent hover:border-slate-300 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              title="Click to sign out"
            >
              Sign Out ({currentUser.name.split(' ')[0]})
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="py-1 border-b-2 border-transparent hover:border-slate-300 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHostModal}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
          >
            Host Event
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('events')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'events'
                ? 'bg-slate-100 text-slate-950 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Explore Events
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('tickets')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'tickets'
                ? 'bg-slate-100 text-slate-950 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            My Tickets ({ticketCount})
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('organizer')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'organizer'
                ? 'bg-slate-100 text-slate-950 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Organizer Studio
          </button>
          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                onSignOut();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign Out ({currentUser.name})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </button>
          )}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onOpenHostModal();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors"
            >
              Host Event
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
