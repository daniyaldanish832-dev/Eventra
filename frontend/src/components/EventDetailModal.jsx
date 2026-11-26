import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Minus,
  Plus,
  Ticket,
  User,
  X,
} from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatEventDate, formatTime12h } from '../services/eventService.js';

export default function EventDetailModal({
  event,
  currentUser,
  onClose,
  onConfirmBooking,
  onViewTickets,
}) {
  const tiers =
    event.tiers && event.tiers.length > 0
      ? event.tiers
      : [
          {
            name: 'General Admission',
            price: event.price,
            perks: 'Standard event access and digital pass',
          },
        ];

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [attendeeName, setAttendeeName] = useState(currentUser?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(currentUser?.email || '');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const seatsLeft = Math.max(0, event.capacity - event.bookedSeats);
  const activeTier = tiers[selectedTierIndex] || tiers[0];
  const totalAmount = activeTier.price * quantity;
  const maxSelectable = Math.min(6, seatsLeft);

  const validateForm = () => {
    const nextErrors = {};
    if (!attendeeName.trim() || attendeeName.trim().length < 2) {
      nextErrors.attendeeName = 'Please enter attendee full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail.trim())) {
      nextErrors.attendeeEmail = 'Please enter a valid email address.';
    }
    if (!attendeePhone.trim() || attendeePhone.trim().length < 7) {
      nextErrors.attendeePhone = 'Please enter a valid contact number.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (seatsLeft === 0) return;
    if (!validateForm()) return;

    const booking = onConfirmBooking({
      eventId: event.id,
      tierName: activeTier.name,
      unitPrice: activeTier.price,
      quantity,
      totalAmount,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim(),
      attendeePhone: attendeePhone.trim(),
    });
    setConfirmedBooking(booking);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">
              {event.category} · Hosted by {event.organizerName}
            </p>
            <h2
              id="event-detail-title"
              className="font-display text-lg sm:text-xl font-bold text-slate-950 truncate"
            >
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {confirmedBooking ? (
            <div className="p-6 sm:p-10 max-w-xl mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-950 mb-2">
                Registration Confirmed
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Your digital pass has been issued for{' '}
                <span className="font-medium text-slate-900">
                  {confirmedBooking.attendeeName}
                </span>
                . Present the ticket code below at the venue gate.
              </p>

              <div className="text-left border border-slate-200 rounded-xl p-5 bg-slate-50 mb-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-medium text-slate-500">
                    Ticket Code
                  </span>
                  <span className="font-mono text-sm font-semibold text-blue-800 tabular-nums">
                    {confirmedBooking.ticketCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Pass Tier</span>
                  <span className="font-medium text-slate-900">
                    {confirmedBooking.tierName} × {confirmedBooking.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Schedule</span>
                  <span className="font-mono text-slate-900 tabular-nums">
                    {formatEventDate(confirmedBooking.eventDate)} ·{' '}
                    {formatTime12h(confirmedBooking.eventTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Venue</span>
                  <span className="font-medium text-slate-900 text-right">
                    {confirmedBooking.venue}, {confirmedBooking.city}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="font-medium text-slate-700">Total Paid</span>
                  <span className="font-mono text-base font-bold text-slate-950 tabular-nums">
                    {confirmedBooking.totalAmount === 0
                      ? 'Free'
                      : `$${confirmedBooking.totalAmount}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewTickets();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Open My Tickets</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Back to Events
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Details & Schedule */}
              <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200">
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <ImageWithFallback
                    src={event.coverImage}
                    alt={event.title}
                    fallbackTitle={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-200 text-sm">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-800 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-500 block">Date</span>
                      <span className="font-medium text-slate-900 tabular-nums">
                        {formatEventDate(event.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-800 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-500 block">Time</span>
                      <span className="font-medium text-slate-900 tabular-nums">
                        {formatTime12h(event.startTime)} –{' '}
                        {formatTime12h(event.endTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-800 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-500 block">
                        Location
                      </span>
                      <span className="font-medium text-slate-900">
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-base font-semibold text-slate-950 mb-2">
                    About This Event
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {event.agenda && event.agenda.length > 0 && (
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-950 mb-3">
                      Event Schedule
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                      {event.agenda.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-baseline gap-4 px-4 py-3 text-sm"
                        >
                          <span className="font-mono text-xs font-medium text-slate-500 w-20 shrink-0 tabular-nums">
                            {item.time}
                          </span>
                          <span className="font-medium text-slate-900">
                            {item.session}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Organized by{' '}
                    <strong className="font-semibold text-slate-900">
                      {event.organizerName}
                    </strong>{' '}
                    · {event.organizerEmail}
                  </span>
                </div>
              </div>

              {/* Right Column: Ticket Checkout Form */}
              <div className="lg:col-span-5 p-6 bg-slate-50/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-semibold text-slate-950">
                    Reserve Your Seat
                  </h3>
                  <span
                    className={`font-mono text-xs font-medium tabular-nums ${
                      seatsLeft === 0 ? 'text-red-700' : 'text-slate-600'
                    }`}
                  >
                    {seatsLeft} seats left
                  </span>
                </div>

                {seatsLeft === 0 ? (
                  <div className="p-5 bg-white border border-slate-200 rounded-xl text-center">
                    <p className="text-sm font-semibold text-red-700 mb-1">
                      This event is currently sold out
                    </p>
                    <p className="text-xs text-slate-600">
                      All {event.capacity} seats have been reserved. Check back
                      later for cancellations or browse other upcoming events.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Ticket Tiers */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Select Pass Tier
                      </label>
                      <div className="space-y-2">
                        {tiers.map((tier, idx) => {
                          const isSelected = idx === selectedTierIndex;
                          return (
                            <button
                              key={tier.name}
                              type="button"
                              onClick={() => setSelectedTierIndex(idx)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-white border-blue-800 ring-1 ring-blue-800'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-slate-950">
                                  {tier.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-950 tabular-nums">
                                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {tier.perks}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-slate-900 block">
                          Ticket Quantity
                        </span>
                        <span className="text-xs text-slate-500">
                          Max {maxSelectable} per booking
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.max(1, q - 1))
                          }
                          disabled={quantity <= 1}
                          aria-label="Decrease ticket quantity"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-semibold w-6 text-center tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.min(maxSelectable, q + 1))
                          }
                          disabled={quantity >= maxSelectable}
                          aria-label="Increase ticket quantity"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Attendee Inputs */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label
                          htmlFor="booking-name"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Full Name
                        </label>
                        <input
                          id="booking-name"
                          type="text"
                          value={attendeeName}
                          onChange={(e) => setAttendeeName(e.target.value)}
                          placeholder="e.g. Daniyal Danish"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                        />
                        {errors.attendeeName && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.attendeeName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="booking-email"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Email Address
                        </label>
                        <input
                          id="booking-email"
                          type="email"
                          value={attendeeEmail}
                          onChange={(e) => setAttendeeEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                        />
                        {errors.attendeeEmail && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.attendeeEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="booking-phone"
                          className="block text-xs font-medium text-slate-700 mb-1"
                        >
                          Phone Number
                        </label>
                        <input
                          id="booking-phone"
                          type="tel"
                          value={attendeePhone}
                          onChange={(e) => setAttendeePhone(e.target.value)}
                          placeholder="+92 300 0000000"
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                        />
                        {errors.attendeePhone && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.attendeePhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary & Submit */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="font-medium text-slate-700">
                          Total Payable ({quantity}{' '}
                          {quantity === 1 ? 'pass' : 'passes'})
                        </span>
                        <span className="font-mono text-xl font-bold text-slate-950 tabular-nums">
                          {totalAmount === 0 ? 'Free' : `$${totalAmount}`}
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
                      >
                        {totalAmount === 0
                          ? 'Confirm Free Registration'
                          : `Confirm & Issue Pass ($${totalAmount})`}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
