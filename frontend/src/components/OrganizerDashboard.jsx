import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit3,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { formatEventDate } from '../services/eventService.js';

export default function OrganizerDashboard({
  events,
  bookings,
  onCreateEventClick,
  onEditEventClick,
  onDeleteEvent,
  onToggleEventStatus,
  onDuplicateEvent,
  onToggleCheckIn,
  onWalkInRegister,
  onBackToPublic,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [eventSearch, setEventSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [selectedEventId, setSelectedEventId] = useState(
    events[0]?.id || 'all'
  );
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');

  const metrics = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status === 'Confirmed');
    const totalRevenue = activeBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );
    const totalPassesSold = events.reduce(
      (sum, ev) => sum + Number(ev.bookedSeats || 0),
      0
    );
    const publishedCount = events.filter(
      (ev) => ev.status === 'Published'
    ).length;
    const checkedInCount = activeBookings.filter((b) => b.checkedIn).length;
    const checkInRate =
      activeBookings.length > 0
        ? Math.round((checkedInCount / activeBookings.length) * 100)
        : 0;

    return {
      totalRevenue,
      totalPassesSold,
      publishedCount,
      checkInRate,
      checkedInCount,
      totalActiveBookings: activeBookings.length,
    };
  }, [events, bookings]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!map[ev.category]) {
        map[ev.category] = { category: ev.category, capacity: 0, booked: 0 };
      }
      map[ev.category].capacity += ev.capacity;
      map[ev.category].booked += ev.bookedSeats;
    });
    return Object.values(map);
  }, [events]);

  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    return events.filter((ev) => {
      const matchesStatus =
        statusFilter === 'All' || ev.status === statusFilter;
      const matchesQuery =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [events, eventSearch, statusFilter]);

  const filteredAttendees = useMemo(() => {
    const q = attendeeSearch.trim().toLowerCase();
    return bookings.filter((bk) => {
      if (bk.status === 'Cancelled') return false;
      const matchesEvent =
        selectedEventId === 'all' || bk.eventId === selectedEventId;
      const matchesQuery =
        !q ||
        bk.attendeeName.toLowerCase().includes(q) ||
        bk.attendeeEmail.toLowerCase().includes(q) ||
        bk.ticketCode.toLowerCase().includes(q);
      return matchesEvent && matchesQuery;
    });
  }, [bookings, selectedEventId, attendeeSearch]);

  const handleExportCSV = () => {
    const headers = [
      'Ticket Code',
      'Attendee Name',
      'Email',
      'Phone',
      'Event',
      'Pass Tier',
      'Quantity',
      'Amount USD',
      'Check-In Status',
    ];
    const rows = filteredAttendees.map((b) => [
      b.ticketCode,
      `"${b.attendeeName}"`,
      b.attendeeEmail,
      b.attendeePhone,
      `"${b.eventTitle}"`,
      `"${b.tierName}"`,
      b.quantity,
      b.totalAmount,
      b.checkedIn ? 'Checked In' : 'Pending',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eventra-attendees-${selectedEventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInEmail.trim()) return;
    const targetEventId =
      selectedEventId === 'all' ? events[0]?.id : selectedEventId;
    if (!targetEventId) return;

    onWalkInRegister({
      eventId: targetEventId,
      attendeeName: walkInName.trim(),
      attendeeEmail: walkInEmail.trim(),
      attendeePhone: walkInPhone.trim() || 'Walk-In Desk',
    });
    setWalkInName('');
    setWalkInEmail('');
    setWalkInPhone('');
    setShowWalkInForm(false);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Manage Events', icon: CalendarDays },
    { id: 'attendees', label: 'Attendees & Check-In', icon: Users },
  ];

  const activeBreadcrumb =
    navItems.find((item) => item.id === activeTab)?.label || 'Overview';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Sidebar (250px on desktop) */}
      <aside className="w-full lg:w-[250px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-400 px-3 mb-2">
            Organizer Console
          </p>
          <nav
            aria-label="Organizer navigation"
            className="flex lg:flex-col gap-1 overflow-x-auto"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-slate-200">
          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Events</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0">
        {/* Top Breadcrumb Contract Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Organizer</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-950">
              {activeBreadcrumb}
            </span>
          </div>

          <button
            type="button"
            onClick={onCreateEventClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>

        <div className="p-6 max-w-6xl space-y-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* 4-Column Tabular KPI Strip (Single-elevation, hairline border) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Recorded Ticket Revenue
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    ${metrics.totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Across {metrics.totalActiveBookings} direct orders
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Total Seats Reserved
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    {metrics.totalPassesSold.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Across {events.length} scheduled events
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Published Events
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    {metrics.publishedCount} / {events.length}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Open for public registration
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Attendee Check-In Rate
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    {metrics.checkInRate}%
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {metrics.checkedInCount} checked in at gate
                  </span>
                </div>
              </div>

              {/* High-Density Performance Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Event Capacity &amp; Sales Overview
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('events')}
                    className="text-xs font-semibold text-blue-800 hover:underline cursor-pointer"
                  >
                    Manage All Events
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-6">Event</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Booked / Cap</th>
                        <th className="py-3 px-6 text-right">Base Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {events.map((ev) => (
                        <tr
                          key={ev.id}
                          className="h-11 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2.5 px-6 font-medium text-slate-950 max-w-[260px] truncate">
                            {ev.title}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formatEventDate(ev.date)}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            {ev.status === 'Published' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Draft</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {ev.bookedSeats} / {ev.capacity}
                          </td>
                          <td className="py-2.5 px-6 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums whitespace-nowrap">
                            {ev.price === 0 ? 'Free' : `$${ev.price}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category Utilization Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="font-display text-base font-bold text-slate-950 mb-4">
                  Seat Utilization by Category
                </h2>
                <div className="space-y-4">
                  {categoryBreakdown.map((item) => {
                    const pct = Math.round(
                      (item.booked / Math.max(1, item.capacity)) * 100
                    );
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-medium text-slate-800">
                            {item.category}
                          </span>
                          <span className="font-mono text-slate-600 tabular-nums">
                            {item.booked} / {item.capacity} seats ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-800 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* MANAGE EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events by title, venue, or city..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                </div>

                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                  {['All', 'Published', 'Draft'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-white text-slate-950 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    No events found
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Adjust your search filter or publish a new event.
                  </p>
                  <button
                    type="button"
                    onClick={onCreateEventClick}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg cursor-pointer"
                  >
                    Create Event
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-5">Event Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Date &amp; City</th>
                        <th className="py-3 px-4 text-right">Seats</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredEvents.map((ev) => (
                        <tr
                          key={ev.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-5 font-medium text-slate-950 max-w-[260px] truncate">
                            {ev.title}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {ev.category}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                            <span className="font-mono tabular-nums">
                              {formatEventDate(ev.date)}
                            </span>{' '}
                            · {ev.city}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {ev.bookedSeats}/{ev.capacity}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onToggleEventStatus(ev.id)}
                              className={`text-xs font-semibold cursor-pointer hover:underline ${
                                ev.status === 'Published'
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }`}
                              title="Click to toggle Published / Draft"
                            >
                              {ev.status}
                            </button>
                          </td>
                          <td className="py-3 px-5 text-right whitespace-nowrap">
                            {confirmDeleteId === ev.id ? (
                              <span className="inline-flex items-center gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteEvent(ev.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 font-semibold text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 text-slate-600 bg-slate-100 rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onEditEventClick(ev)}
                                  aria-label={`Edit ${ev.title}`}
                                  title="Edit event"
                                  className="p-1.5 text-slate-500 hover:text-blue-800 hover:bg-slate-100 rounded-md cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDuplicateEvent(ev)}
                                  aria-label={`Duplicate ${ev.title}`}
                                  title="Duplicate event"
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(ev.id)}
                                  aria-label={`Delete ${ev.title}`}
                                  title="Delete event"
                                  className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ATTENDEES & CHECK-IN DESK TAB */}
          {activeTab === 'attendees' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <select
                    aria-label="Filter attendees by event"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 sm:max-w-xs"
                  >
                    <option value="all">All Published Events</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      placeholder="Search attendee name, email, or ticket code..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWalkInForm((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Walk-In Registration</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={filteredAttendees.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {showWalkInForm && (
                <form
                  onSubmit={handleWalkInSubmit}
                  className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Walk-In Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="Sanaullah Khan"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={walkInEmail}
                      onChange={(e) => setWalkInEmail(e.target.value)}
                      placeholder="sana@example.com"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                  >
                    Issue &amp; Check In
                  </button>
                </form>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {filteredAttendees.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      No matching attendees
                    </p>
                    <p className="text-xs text-slate-500">
                      Try clearing your search or selecting a different event.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                          <th className="py-3 px-5">Ticket Code</th>
                          <th className="py-3 px-4">Attendee</th>
                          <th className="py-3 px-4">Event</th>
                          <th className="py-3 px-4">Pass</th>
                          <th className="py-3 px-5 text-right">Gate Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredAttendees.map((bk) => (
                          <tr
                            key={bk.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-5 font-mono text-xs font-semibold text-blue-800 tabular-nums whitespace-nowrap">
                              {bk.ticketCode}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-950 block">
                                {bk.attendeeName}
                              </span>
                              <span className="text-xs text-slate-500">
                                {bk.attendeeEmail}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600 max-w-[220px] truncate">
                              {bk.eventTitle}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                              {bk.tierName} × {bk.quantity}
                            </td>
                            <td className="py-3 px-5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => onToggleCheckIn(bk.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                  bk.checkedIn
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-800 hover:text-blue-800'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {bk.checkedIn ? 'Checked In' : 'Check In'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
