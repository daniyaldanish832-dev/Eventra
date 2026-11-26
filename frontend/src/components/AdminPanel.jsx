import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { formatEventDate } from '../services/eventService.js';

export default function AdminPanel({
  currentUser,
  events,
  bookings,
  users,
  onUpdateUserStatus,
  onToggleEventStatus,
  onDeleteEvent,
  onBackToPublic,
  onSignOut,
}) {
  const [activeTab, setActiveTab] = useState('overview');

  // Organizers tab filters
  const [orgSearch, setOrgSearch] = useState('');
  const [orgStatusFilter, setOrgStatusFilter] = useState('All');

  // Users tab filters
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  // Digital pass revenue tab filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('All');

  // Events oversight tab filters
  const [eventSearch, setEventSearch] = useState('');
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState(null);

  const PLATFORM_FEE_RATE = 0.05;

  // Separate organizers & attendees/users from unified users store
  const organizers = useMemo(() => {
    const baseOrganizers = users.filter((u) => u.role === 'Organizer');
    const knownEmails = new Set(
      baseOrganizers.map((o) => o.email.toLowerCase())
    );

    // Also include any organizer from newly created events if not yet in users list
    const extraFromEvents = [];
    events.forEach((ev) => {
      const email = (ev.organizerEmail || '').toLowerCase();
      if (email && !knownEmails.has(email)) {
        knownEmails.add(email);
        extraFromEvents.push({
          id: `usr-ev-${ev.id}`,
          name: ev.organizerName,
          email: ev.organizerEmail,
          phone: '—',
          role: 'Organizer',
          organization: ev.organizerName,
          city: ev.city,
          status: 'Verified',
          joinedAt: ev.date,
        });
      }
    });

    const allOrgs = [...baseOrganizers, ...extraFromEvents];

    return allOrgs.map((org) => {
      const orgEvents = events.filter(
        (ev) =>
          (ev.organizerEmail || '').toLowerCase() === org.email.toLowerCase() ||
          ev.organizerName.toLowerCase() ===
            (org.organization || org.name).toLowerCase()
      );
      const orgEventIds = new Set(orgEvents.map((e) => e.id));
      const orgBookings = bookings.filter(
        (b) => b.status === 'Confirmed' && orgEventIds.has(b.eventId)
      );
      const grossRevenue = orgBookings.reduce(
        (sum, b) => sum + Number(b.totalAmount || 0),
        0
      );
      const passesIssued = orgBookings.reduce(
        (sum, b) => sum + Number(b.quantity || 0),
        0
      );
      const totalBookedSeats = orgEvents.reduce(
        (sum, e) => sum + Number(e.bookedSeats || 0),
        0
      );

      return {
        ...org,
        eventsCount: orgEvents.length,
        totalBookedSeats,
        passesIssued,
        grossRevenue,
      };
    });
  }, [users, events, bookings]);

  const attendees = useMemo(() => {
    const baseAttendees = users.filter((u) => u.role !== 'Organizer');
    const knownEmails = new Set(
      baseAttendees.map((u) => u.email.toLowerCase())
    );

    // Include any ticket buyers who checked out as guests without registering
    const extraFromBookings = [];
    bookings.forEach((bk) => {
      const email = (bk.attendeeEmail || '').toLowerCase();
      if (email && !knownEmails.has(email)) {
        knownEmails.add(email);
        extraFromBookings.push({
          id: `usr-bk-${bk.id}`,
          name: bk.attendeeName,
          email: bk.attendeeEmail,
          phone: bk.attendeePhone || '—',
          role: 'Attendee',
          organization: bk.city || 'Guest Checkout',
          city: bk.city || '—',
          status: 'Active',
          joinedAt: (bk.bookedAt || '').slice(0, 10) || '2026-11-15',
        });
      }
    });

    const allUsers = [...baseAttendees, ...extraFromBookings];

    return allUsers.map((usr) => {
      const userBookings = bookings.filter(
        (b) =>
          b.status === 'Confirmed' &&
          (b.attendeeEmail || '').toLowerCase() === usr.email.toLowerCase()
      );
      const passesBought = userBookings.reduce(
        (sum, b) => sum + Number(b.quantity || 0),
        0
      );
      const totalSpent = userBookings.reduce(
        (sum, b) => sum + Number(b.totalAmount || 0),
        0
      );

      return {
        ...usr,
        ordersCount: userBookings.length,
        passesBought,
        totalSpent,
      };
    });
  }, [users, bookings]);

  const financials = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'Confirmed');
    const cancelled = bookings.filter((b) => b.status === 'Cancelled');

    const grossRevenue = confirmed.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );
    const platformFee = Number((grossRevenue * PLATFORM_FEE_RATE).toFixed(2));
    const netOrganizerPayout = Number((grossRevenue - platformFee).toFixed(2));
    const cancelledAmount = cancelled.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );
    const totalPassesIssued = confirmed.reduce(
      (sum, b) => sum + Number(b.quantity || 0),
      0
    );
    const checkedInPasses = confirmed
      .filter((b) => b.checkedIn)
      .reduce((sum, b) => sum + Number(b.quantity || 0), 0);

    // Event-wise pass revenue breakdown
    const perEvent = events.map((ev) => {
      const evConfirmed = confirmed.filter((b) => b.eventId === ev.id);
      const evPasses = evConfirmed.reduce(
        (sum, b) => sum + Number(b.quantity || 0),
        0
      );
      const evGross = evConfirmed.reduce(
        (sum, b) => sum + Number(b.totalAmount || 0),
        0
      );
      const evFee = Number((evGross * PLATFORM_FEE_RATE).toFixed(2));
      const evNet = Number((evGross - evFee).toFixed(2));
      return {
        id: ev.id,
        title: ev.title,
        organizerName: ev.organizerName,
        basePrice: ev.price,
        passesSold: evPasses,
        gross: evGross,
        fee: evFee,
        net: evNet,
      };
    });

    return {
      grossRevenue,
      platformFee,
      netOrganizerPayout,
      cancelledAmount,
      totalPassesIssued,
      checkedInPasses,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      perEvent,
    };
  }, [bookings, events]);

  const filteredOrganizers = useMemo(() => {
    const q = orgSearch.trim().toLowerCase();
    return organizers.filter((org) => {
      const matchesStatus =
        orgStatusFilter === 'All' || org.status === orgStatusFilter;
      const matchesQuery =
        !q ||
        org.name.toLowerCase().includes(q) ||
        (org.organization || '').toLowerCase().includes(q) ||
        org.email.toLowerCase().includes(q) ||
        (org.city || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [organizers, orgSearch, orgStatusFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return attendees.filter((u) => {
      const matchesStatus =
        userStatusFilter === 'All' || u.status === userStatusFilter;
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.city || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [attendees, userSearch, userStatusFilter]);

  const enrichedBookings = useMemo(() => {
    const eventMap = {};
    events.forEach((ev) => {
      eventMap[ev.id] = ev;
    });
    return bookings.map((bk) => ({
      ...bk,
      organizerName: eventMap[bk.eventId]?.organizerName || 'Platform Event',
    }));
  }, [bookings, events]);

  const filteredLedger = useMemo(() => {
    const q = ledgerSearch.trim().toLowerCase();
    return enrichedBookings.filter((bk) => {
      const matchesStatus =
        ledgerStatusFilter === 'All' ||
        (ledgerStatusFilter === 'Checked In'
          ? bk.status === 'Confirmed' && bk.checkedIn
          : bk.status === ledgerStatusFilter);
      const matchesQuery =
        !q ||
        bk.ticketCode.toLowerCase().includes(q) ||
        bk.attendeeName.toLowerCase().includes(q) ||
        bk.attendeeEmail.toLowerCase().includes(q) ||
        bk.eventTitle.toLowerCase().includes(q) ||
        bk.organizerName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [enrichedBookings, ledgerSearch, ledgerStatusFilter]);

  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    return events.filter(
      (ev) =>
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.organizerName.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q)
    );
  }, [events, eventSearch]);

  const handleExportRevenueCSV = () => {
    const headers = [
      'Ticket Code',
      'Buyer Name',
      'Buyer Email',
      'Event',
      'Organizer',
      'Tier',
      'Quantity',
      'Gross Amount (USD)',
      'Platform Fee 5% (USD)',
      'Organizer Net (USD)',
      'Status',
    ];
    const rows = filteredLedger.map((b) => {
      const gross = Number(b.totalAmount || 0);
      const fee = (gross * PLATFORM_FEE_RATE).toFixed(2);
      const net = (gross - Number(fee)).toFixed(2);
      const statusLabel =
        b.status === 'Cancelled'
          ? 'Cancelled'
          : b.checkedIn
            ? 'Checked In'
            : 'Confirmed';
      return [
        b.ticketCode,
        `"${b.attendeeName}"`,
        b.attendeeEmail,
        `"${b.eventTitle}"`,
        `"${b.organizerName}"`,
        `"${b.tierName}"`,
        b.quantity,
        gross.toFixed(2),
        b.status === 'Cancelled' ? '0.00' : fee,
        b.status === 'Cancelled' ? '0.00' : net,
        statusLabel,
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'eventra-admin-digital-pass-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'organizers', label: 'Organizers', icon: Building2 },
    { id: 'users', label: 'Users & Attendees', icon: Users },
    { id: 'revenue', label: 'Digital Pass Revenue', icon: CreditCard },
    { id: 'events', label: 'All Events', icon: CalendarDays },
  ];

  const activeBreadcrumb =
    navItems.find((item) => item.id === activeTab)?.label || 'Overview';

  const renderAccountStatus = (status) => {
    if (status === 'Verified' || status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
        <Ban className="w-3.5 h-3.5" />
        <span>Suspended</span>
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Sidebar (250px on desktop) */}
      <aside className="w-full lg:w-[250px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 px-3 mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">
              Admin Panel
            </span>
          </div>

          <nav
            aria-label="Admin navigation"
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

        <div className="hidden lg:block p-5 border-t border-slate-200 space-y-1.5">
          <div className="px-3 pb-2 mb-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-950 truncate">
              {currentUser?.name || 'Platform Admin'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.email || 'admin@eventra.pk'}
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Events</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 min-w-0">
        {/* Top Breadcrumb Contract Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Admin</span>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-slate-950">
              {activeBreadcrumb}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportRevenueCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Pass Ledger CSV</span>
          </button>
        </div>

        <div className="p-6 max-w-6xl space-y-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* 4-Column Tabular KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Total Digital Pass Revenue
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    ${financials.grossRevenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block font-mono tabular-nums">
                    Platform fee (5%): ${financials.platformFee.toFixed(2)}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Digital Passes Issued
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    {financials.totalPassesIssued}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block tabular-nums">
                    {financials.checkedInPasses} checked in ·{' '}
                    {financials.cancelledCount} cancelled
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Total Organizers
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    {organizers.length}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block tabular-nums">
                    {organizers.filter((o) => o.status === 'Verified').length}{' '}
                    verified accounts
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Registered Users
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    {attendees.length}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block tabular-nums">
                    {attendees.filter((u) => u.status === 'Active').length}{' '}
                    active attendees
                  </span>
                </div>
              </div>

              {/* Recent Digital Pass Payments */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Recent Digital Pass Payments
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('revenue')}
                    className="text-xs font-semibold text-blue-800 hover:underline cursor-pointer"
                  >
                    Open Full Pass Ledger
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-6">Pass Code</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Event &amp; Organizer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {enrichedBookings.slice(0, 6).map((bk) => (
                        <tr
                          key={bk.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-6 font-mono text-xs font-semibold text-blue-800 tabular-nums whitespace-nowrap">
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
                          <td className="py-3 px-4 max-w-[260px]">
                            <span className="text-slate-900 font-medium block truncate">
                              {bk.eventTitle}
                            </span>
                            <span className="text-xs text-slate-500 block truncate">
                              {bk.organizerName}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {bk.status === 'Cancelled' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancelled</span>
                              </span>
                            ) : bk.checkedIn ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Checked In</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Confirmed</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums whitespace-nowrap">
                            {bk.totalAmount === 0 ? 'Free' : `$${bk.totalAmount}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Organizers Quick Snapshot */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Organizers Revenue Summary
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('organizers')}
                    className="text-xs font-semibold text-blue-800 hover:underline cursor-pointer"
                  >
                    Manage All Organizers
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-6">Organizer / Organization</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4 text-right">Events</th>
                        <th className="py-3 px-4 text-right">Seats Booked</th>
                        <th className="py-3 px-6 text-right">Pass Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {organizers.map((org) => (
                        <tr
                          key={org.id}
                          className="h-11 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2.5 px-6">
                            <span className="font-medium text-slate-950">
                              {org.organization || org.name}
                            </span>
                            <span className="text-xs text-slate-500 ml-2">
                              ({org.name})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-600">
                            {org.city || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {org.eventsCount}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {org.totalBookedSeats}
                          </td>
                          <td className="py-2.5 px-6 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums">
                            ${org.grossRevenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ORGANIZERS TAB */}
          {activeTab === 'organizers' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    placeholder="Search organizer name, brand, or email..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                </div>

                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                  {['All', 'Verified', 'Pending', 'Suspended'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrgStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        orgStatusFilter === st
                          ? 'bg-white text-slate-950 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrganizers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    No organizers match your search
                  </p>
                  <p className="text-xs text-slate-500">
                    Try adjusting the status tab or search term.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-5">Organizer</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4 text-right">Events</th>
                        <th className="py-3 px-4 text-right">Seats</th>
                        <th className="py-3 px-4 text-right">Pass Revenue</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredOrganizers.map((org) => (
                        <tr
                          key={org.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-5">
                            <span className="font-semibold text-slate-950 block">
                              {org.organization || org.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {org.name} · {org.city || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            <span className="block">{org.email}</span>
                            <span className="font-mono text-slate-500">
                              {org.phone}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {org.eventsCount}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {org.totalBookedSeats}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums">
                            ${org.grossRevenue.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderAccountStatus(org.status)}
                          </td>
                          <td className="py-3 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {org.status !== 'Verified' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateUserStatus(org.id, 'Verified', org)
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md cursor-pointer"
                                >
                                  <BadgeCheck className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {org.status === 'Suspended' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateUserStatus(org.id, 'Verified', org)
                                  }
                                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateUserStatus(org.id, 'Suspended', org)
                                  }
                                  className="px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 border border-slate-200 rounded-md cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* USERS & ATTENDEES TAB */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search user name, email, or city..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                </div>

                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                  {['All', 'Active', 'Suspended'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUserStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        userStatusFilter === st
                          ? 'bg-white text-slate-950 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    No users found
                  </p>
                  <p className="text-xs text-slate-500">
                    Try clearing the search input or status filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-5">User / Attendee</th>
                        <th className="py-3 px-4">Email &amp; Phone</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">Passes Bought</th>
                        <th className="py-3 px-4 text-right">Pass Spend</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredUsers.map((usr) => (
                        <tr
                          key={usr.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-5">
                            <span className="font-semibold text-slate-950 block">
                              {usr.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {usr.organization || usr.city || 'Attendee'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            <span className="block">{usr.email}</span>
                            <span className="font-mono text-slate-500">
                              {usr.phone || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formatEventDate(usr.joinedAt)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {usr.passesBought}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums">
                            ${usr.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderAccountStatus(usr.status)}
                          </td>
                          <td className="py-3 px-5 text-right whitespace-nowrap">
                            {usr.status === 'Suspended' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateUserStatus(usr.id, 'Active', usr)
                                }
                                className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md cursor-pointer"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateUserStatus(usr.id, 'Suspended', usr)
                                }
                                className="px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 border border-slate-200 rounded-md cursor-pointer"
                              >
                                Suspend
                              </button>
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

          {/* DIGITAL PASS REVENUE TAB */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* 4-Column Financial Breakdown Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Gross Digital Pass Sales
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums mt-2 block">
                    ${financials.grossRevenue.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block tabular-nums">
                    From {financials.confirmedCount} active orders
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Platform Service Fee (5%)
                  </span>
                  <span className="font-mono text-2xl font-bold text-blue-800 tabular-nums mt-2 block">
                    ${financials.platformFee.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Retained platform commission
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Net Organizer Payouts (95%)
                  </span>
                  <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-2 block">
                    ${financials.netOrganizerPayout.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Payable to event hosts
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <span className="text-xs font-medium text-slate-500 block">
                    Cancelled / Voided Passes
                  </span>
                  <span className="font-mono text-2xl font-bold text-red-700 tabular-nums mt-2 block">
                    ${financials.cancelledAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block tabular-nums">
                    {financials.cancelledCount} cancelled bookings
                  </span>
                </div>
              </div>

              {/* Event-Wise Digital Pass Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Event-Wise Digital Pass Earnings
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-6">Event</th>
                        <th className="py-3 px-4">Organizer</th>
                        <th className="py-3 px-4 text-right">Passes Sold</th>
                        <th className="py-3 px-4 text-right">Gross Sales</th>
                        <th className="py-3 px-4 text-right">Fee (5%)</th>
                        <th className="py-3 px-6 text-right">Net Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {financials.perEvent.map((row) => (
                        <tr
                          key={row.id}
                          className="h-11 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2.5 px-6 font-medium text-slate-950 max-w-[260px] truncate">
                            {row.title}
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {row.organizerName}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {row.passesSold}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums">
                            ${row.gross.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs text-blue-800 tabular-nums">
                            ${row.fee.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-6 text-right font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                            ${row.net.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full Pass Transaction Ledger */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      placeholder="Search pass code, buyer, or event..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                    />
                  </div>

                  <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                    {['All', 'Confirmed', 'Checked In', 'Cancelled'].map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setLedgerStatusFilter(st)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            ledgerStatusFilter === st
                              ? 'bg-white text-slate-950 shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-950'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                        <th className="py-3 px-5">Pass Code</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Event</th>
                        <th className="py-3 px-4">Tier</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLedger.map((bk) => (
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
                          <td className="py-3 px-4 text-xs text-slate-700 max-w-[220px] truncate">
                            {bk.eventTitle}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {bk.tierName} × {bk.quantity}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {bk.status === 'Cancelled' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancelled</span>
                              </span>
                            ) : bk.checkedIn ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Checked In</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Confirmed</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-right font-mono text-xs font-semibold text-slate-950 tabular-nums whitespace-nowrap">
                            {bk.totalAmount === 0
                              ? 'Free'
                              : `$${Number(bk.totalAmount).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ALL EVENTS OVERSIGHT TAB */}
          {activeTab === 'events' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events or organizers..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {filteredEvents.length} total events
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                      <th className="py-3 px-5">Event</th>
                      <th className="py-3 px-4">Organizer</th>
                      <th className="py-3 px-4">Date &amp; City</th>
                      <th className="py-3 px-4 text-right">Booked / Cap</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-5 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredEvents.map((ev) => (
                      <tr
                        key={ev.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-5 font-medium text-slate-950 max-w-[240px] truncate">
                          {ev.title}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {ev.organizerName}
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
                            className={`text-xs font-semibold hover:underline cursor-pointer ${
                              ev.status === 'Published'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {ev.status}
                          </button>
                        </td>
                        <td className="py-3 px-5 text-right whitespace-nowrap">
                          {confirmDeleteEventId === ev.id ? (
                            <span className="inline-flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteEvent(ev.id);
                                  setConfirmDeleteEventId(null);
                                }}
                                className="px-2 py-1 font-semibold text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                              >
                                Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEventId(null)}
                                className="px-2 py-1 text-slate-600 bg-slate-100 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteEventId(ev.id)}
                              aria-label={`Remove ${ev.title}`}
                              className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
