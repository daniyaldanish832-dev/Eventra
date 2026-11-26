import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';
import { formatEventDate, formatTime12h } from '../services/eventService.js';

export default function MyTicketsView({
  bookings,
  onCancelBooking,
  onExploreEvents,
}) {
  const [filter, setFilter] = useState('All');
  const [selectedPass, setSelectedPass] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((bk) => {
      if (filter === 'Upcoming')
        return bk.status === 'Confirmed' && !bk.checkedIn;
      if (filter === 'Checked In')
        return bk.status === 'Confirmed' && bk.checkedIn;
      if (filter === 'Cancelled') return bk.status === 'Cancelled';
      return true;
    });
  }, [bookings, filter]);

  const counts = useMemo(() => {
    return {
      All: bookings.length,
      Upcoming: bookings.filter(
        (b) => b.status === 'Confirmed' && !b.checkedIn
      ).length,
      'Checked In': bookings.filter(
        (b) => b.status === 'Confirmed' && b.checkedIn
      ).length,
      Cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
    };
  }, [bookings]);

  const renderStatusLabel = (bk) => {
    if (bk.status === 'Cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
    }
    if (bk.checkedIn) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Checked In</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <Clock className="w-3.5 h-3.5" />
        <span>Confirmed · Ready for Gate</span>
      </span>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            My Tickets &amp; Digital Passes
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            View confirmed event passes, print entry tickets, or manage upcoming
            registrations.
          </p>
        </div>

        {/* Interactive Segmented Filter Tabs */}
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg self-start"
          role="tablist"
          aria-label="Filter tickets by status"
        >
          {['All', 'Upcoming', 'Checked In', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filter === tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab
                  ? 'bg-white text-slate-950 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {filteredBookings.length === 0 ? (
        <div className="mt-10 bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Ticket className="w-10 h-10 text-slate-400 mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-semibold text-slate-950 mb-1">
            No tickets match this filter
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            When you reserve a seat for an upcoming conference, workshop, or
            concert, your digital pass will appear right here.
          </p>
          <button
            type="button"
            onClick={onExploreEvents}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
          >
            Browse Upcoming Events
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((bk) => (
            <article
              key={bk.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    {bk.ticketCode}
                  </span>
                  {renderStatusLabel(bk)}
                </div>

                <h3 className="font-display text-lg font-bold text-slate-950 mt-4 mb-1.5">
                  {bk.eventTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mb-4">
                  <span className="font-mono tabular-nums">
                    {formatEventDate(bk.eventDate)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatTime12h(bk.eventTime)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {bk.venue}, {bk.city}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Attendee</span>
                    <span className="font-medium text-slate-900 truncate block">
                      {bk.attendeeName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pass Tier</span>
                    <span className="font-medium text-slate-900 truncate block">
                      {bk.tierName} × {bk.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Amount</span>
                    <span className="font-mono font-semibold text-slate-950 tabular-nums">
                      {bk.totalAmount === 0 ? 'Free' : `$${bk.totalAmount}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPass(bk)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Open Digital Pass</span>
                </button>

                {bk.status === 'Confirmed' && !bk.checkedIn && (
                  <div>
                    {confirmCancelId === bk.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">
                          Confirm cancel?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onCancelBooking(bk.id);
                            setConfirmCancelId(null);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer"
                        >
                          Yes, Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(null)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(bk.id)}
                        className="text-xs font-medium text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        Cancel Registration
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Printable Digital Ticket Pass Modal */}
      {selectedPass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="digital-pass-title"
        >
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3
                id="digital-pass-title"
                className="font-display text-base font-bold text-slate-950"
              >
                Digital Entry Pass
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                aria-label="Close pass modal"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-ticket-pass" className="p-6 space-y-5 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-slate-950">
                  Eventra Pass
                </span>
                {renderStatusLabel(selectedPass)}
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-4 space-y-2">
                <h4 className="font-display text-lg font-bold text-slate-950 leading-snug">
                  {selectedPass.eventTitle}
                </h4>
                <p className="text-xs text-slate-600">
                  {formatEventDate(selectedPass.eventDate)} ·{' '}
                  {formatTime12h(selectedPass.eventTime)}
                </p>
                <p className="text-xs text-slate-600">
                  {selectedPass.venue}, {selectedPass.city}
                </p>
              </div>

              {/* Clean SVG Matrix Code Placeholder representing Ticket Verification */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shrink-0">
                  <QrCode className="w-14 h-14 text-slate-900" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 block">
                    Verification Code
                  </span>
                  <span className="font-mono text-base font-bold text-blue-800 tabular-nums block">
                    {selectedPass.ticketCode}
                  </span>
                  <span className="text-xs text-slate-600 block mt-1 truncate">
                    {selectedPass.attendeeName}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {selectedPass.tierName} × {selectedPass.quantity}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
