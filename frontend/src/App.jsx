import React, { useEffect, useMemo, useState } from 'react';
import { CalendarX2, CheckCircle2, Search, X } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import EventCard from './components/EventCard.jsx';
import EventDetailModal from './components/EventDetailModal.jsx';
import MyTicketsView from './components/MyTicketsView.jsx';
import OrganizerDashboard from './components/OrganizerDashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import EventFormModal from './components/EventFormModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import Footer from './components/Footer.jsx';
import { EVENT_CATEGORIES } from './data/initialEvents.js';
import {
  generateTicketCode,
  loadBookings,
  loadCurrentUser,
  loadEvents,
  loadUsers,
  saveBookings,
  saveCurrentUser,
  saveEvents,
  saveUsers,
} from './services/eventService.js';

export default function App() {
  const [activeView, setActiveView] = useState('events');
  const [events, setEvents] = useState(() => loadEvents());
  const [bookings, setBookings] = useState(() => loadBookings());
  const [users, setUsers] = useState(() => loadUsers());
  const [currentUser, setCurrentUser] = useState(() => loadCurrentUser());

  // Explore catalog filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('date');

  // Active modals
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const publishedEvents = useMemo(
    () => events.filter((ev) => ev.status === 'Published'),
    [events]
  );

  const availableCities = useMemo(() => {
    const cities = Array.from(new Set(publishedEvents.map((ev) => ev.city)));
    return ['All Cities', ...cities];
  }, [publishedEvents]);

  const filteredPublicEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = publishedEvents.filter((ev) => {
      const matchesCategory =
        selectedCategory === 'All Events' || ev.category === selectedCategory;
      const matchesCity =
        selectedCity === 'All Cities' || ev.city === selectedCity;
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q) ||
        ev.organizerName.toLowerCase().includes(q);
      return matchesCategory && matchesCity && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'popular') return b.bookedSeats - a.bookedSeats;
      return a.date.localeCompare(b.date);
    });
  }, [publishedEvents, searchQuery, selectedCategory, selectedCity, sortBy]);

  const totalSeatsBooked = useMemo(
    () => events.reduce((sum, ev) => sum + Number(ev.bookedSeats || 0), 0),
    [events]
  );

  const selectedEvent = useMemo(
    () => events.find((ev) => ev.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const activeTicketCount = useMemo(
    () => bookings.filter((b) => b.status === 'Confirmed').length,
    [bookings]
  );

  // Booking handler
  const handleConfirmBooking = ({
    eventId,
    tierName,
    quantity,
    totalAmount,
    attendeeName,
    attendeeEmail,
    attendeePhone,
  }) => {
    const targetEvent = events.find((ev) => ev.id === eventId);
    if (!targetEvent) return null;

    const newBooking = {
      id: `bk-${Date.now()}`,
      ticketCode: generateTicketCode(),
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventTime: targetEvent.startTime,
      venue: targetEvent.venue,
      city: targetEvent.city,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      tierName,
      quantity,
      totalAmount,
      status: 'Confirmed',
      checkedIn: false,
      bookedAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              bookedSeats: Math.min(ev.capacity, ev.bookedSeats + quantity),
            }
          : ev
      )
    );
    showToast(`Ticket issued: ${newBooking.ticketCode}`);
    return newBooking;
  };

  const handleCancelBooking = (bookingId) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target || target.status === 'Cancelled') return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'Cancelled' } : b
      )
    );
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === target.eventId
          ? {
              ...ev,
              bookedSeats: Math.max(0, ev.bookedSeats - target.quantity),
            }
          : ev
      )
    );
    showToast(`Registration ${target.ticketCode} cancelled.`);
  };

  // Organizer Event CRUD handlers
  const handleSaveEvent = (payload) => {
    if (payload.id) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === payload.id ? payload : ev))
      );
      showToast(`Updated "${payload.title}".`);
    } else {
      const created = {
        ...payload,
        id: `evt-${Date.now()}`,
        bookedSeats: 0,
      };
      setEvents((prev) => [created, ...prev]);
      showToast(`Created "${created.title}".`);
    }
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    const target = events.find((e) => e.id === eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (target) showToast(`Deleted "${target.title}".`);
  };

  const handleToggleEventStatus = (eventId) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              status: ev.status === 'Published' ? 'Draft' : 'Published',
            }
          : ev
      )
    );
  };

  const handleDuplicateEvent = (ev) => {
    const copy = {
      ...ev,
      id: `evt-${Date.now()}`,
      title: `${ev.title} (Copy)`,
      bookedSeats: 0,
      status: 'Draft',
    };
    setEvents((prev) => [copy, ...prev]);
    showToast(`Duplicated "${ev.title}" as Draft.`);
  };

  const handleToggleCheckIn = (bookingId) => {
    setBookings((prev) =>
      prev.map((bk) =>
        bk.id === bookingId ? { ...bk, checkedIn: !bk.checkedIn } : bk
      )
    );
  };

  const handleWalkInRegister = ({
    eventId,
    attendeeName,
    attendeeEmail,
    attendeePhone,
  }) => {
    const targetEvent = events.find((ev) => ev.id === eventId);
    if (!targetEvent) return;

    const walkInBooking = {
      id: `bk-${Date.now()}`,
      ticketCode: generateTicketCode(),
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventTime: targetEvent.startTime,
      venue: targetEvent.venue,
      city: targetEvent.city,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      tierName: 'Walk-In Pass',
      quantity: 1,
      totalAmount: targetEvent.price,
      status: 'Confirmed',
      checkedIn: true,
      bookedAt: new Date().toISOString(),
    };

    setBookings((prev) => [walkInBooking, ...prev]);
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              bookedSeats: Math.min(ev.capacity, ev.bookedSeats + 1),
            }
          : ev
      )
    );
    showToast(`Walk-in checked in: ${walkInBooking.ticketCode}`);
  };

  const handleUpdateUserStatus = (userId, nextStatus, fallbackRecord) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === userId);
      if (exists) {
        return prev.map((u) =>
          u.id === userId ? { ...u, status: nextStatus } : u
        );
      }
      if (!fallbackRecord) return prev;
      return [
        {
          id: userId,
          name: fallbackRecord.name,
          email: fallbackRecord.email,
          phone: fallbackRecord.phone || '—',
          role: fallbackRecord.role || 'Attendee',
          organization: fallbackRecord.organization || '',
          city: fallbackRecord.city || '—',
          status: nextStatus,
          joinedAt: fallbackRecord.joinedAt || new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ];
    });
    showToast(`Account status updated to ${nextStatus}.`);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('events-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHostModal={() => {
          setEditingEvent(null);
          setShowEventForm(true);
        }}
        onOpenAuthModal={() => setShowAuthModal(true)}
        currentUser={currentUser}
        onSignOut={() => {
          setCurrentUser(null);
          if (activeView === 'admin') {
            setActiveView('events');
          }
          showToast('Signed out.');
        }}
        ticketCount={activeTicketCount}
      />

      <main className="flex-1">
        {activeView === 'events' && (
          <>
            <HeroSection
              onBrowseClick={scrollToCatalog}
              onOpenOrganizer={() => setActiveView('organizer')}
              totalEvents={publishedEvents.length}
              totalSeatsBooked={totalSeatsBooked}
            />

            {/* Events Discovery Section */}
            <section
              id="events-catalog"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                    Upcoming Events
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">
                    Select an event to inspect the full schedule, compare pass
                    tiers, and reserve seats instantly.
                  </p>
                </div>

                {/* Search + City + Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search events, venues, hosts..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                    />
                  </div>

                  <select
                    aria-label="Filter by city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  >
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Sort events"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  >
                    <option value="date">Soonest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Interactive Category Filter Buttons */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 border-b border-slate-200"
                role="tablist"
                aria-label="Filter events by category"
              >
                {EVENT_CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-950'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Event Cards Grid */}
              {filteredPublicEvents.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                  <CalendarX2
                    className="w-10 h-10 text-slate-400 mx-auto mb-3"
                    strokeWidth={1.5}
                  />
                  <h3 className="font-display text-lg font-semibold text-slate-950 mb-1">
                    No events match your filters
                  </h3>
                  <p className="text-sm text-slate-600 mb-5">
                    Try clearing your search query or switching back to all
                    categories and cities.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Events');
                      setSelectedCity('All Cities');
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPublicEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      onSelect={(item) => setSelectedEventId(item.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Editorial Workflow Proof Section */}
            <section className="bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="max-w-2xl mb-10">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
                    Built for end-to-end event operations
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mt-2">
                    Every workflow from event creation to gate check-in runs in
                    clean, structured modules ready to connect with your Node,
                    Express, and MongoDB API routes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950 mb-2">
                      01. Publish Events &amp; Pass Tiers
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Define dates, venues, seat capacities, agendas, and free
                      or paid pass tiers through a validated organizer builder.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950 mb-2">
                      02. Instant Digital Registration
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Attendees reserve seats in under two minutes and receive a
                      printable pass with a unique verification code.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950 mb-2">
                      03. Live Gate Check-In &amp; Export
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Track real-time seat utilization, mark attendees checked
                      in at the door, handle walk-ins, and download CSV rosters.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === 'tickets' && (
          <MyTicketsView
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onExploreEvents={() => setActiveView('events')}
          />
        )}

        {activeView === 'organizer' && (
          <OrganizerDashboard
            events={events}
            bookings={bookings}
            onCreateEventClick={() => {
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            onEditEventClick={(ev) => {
              setEditingEvent(ev);
              setShowEventForm(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onToggleEventStatus={handleToggleEventStatus}
            onDuplicateEvent={handleDuplicateEvent}
            onToggleCheckIn={handleToggleCheckIn}
            onWalkInRegister={handleWalkInRegister}
            onBackToPublic={() => setActiveView('events')}
          />
        )}

        {activeView === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            events={events}
            bookings={bookings}
            users={users}
            onUpdateUserStatus={handleUpdateUserStatus}
            onToggleEventStatus={handleToggleEventStatus}
            onDeleteEvent={handleDeleteEvent}
            onBackToPublic={() => setActiveView('events')}
            onSignOut={() => {
              setCurrentUser(null);
              setActiveView('events');
              showToast('Signed out of Admin Panel.');
            }}
          />
        )}
      </main>

      {activeView !== 'organizer' && activeView !== 'admin' && (
        <Footer
          onNavigate={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenHostModal={() => {
            setEditingEvent(null);
            setShowEventForm(true);
          }}
        />
      )}

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          currentUser={currentUser}
          onClose={() => setSelectedEventId(null)}
          onConfirmBooking={handleConfirmBooking}
          onViewTickets={() => setActiveView('tickets')}
        />
      )}

      {showEventForm && (
        <EventFormModal
          initialEvent={editingEvent}
          currentUser={currentUser}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            if (user.role !== 'Admin') {
              setUsers((prev) => {
                const exists = prev.some(
                  (u) => u.email.toLowerCase() === user.email.toLowerCase()
                );
                if (exists) return prev;
                return [
                  {
                    id: `usr-${Date.now()}`,
                    name: user.name,
                    email: user.email,
                    phone: '—',
                    role: user.role,
                    organization:
                      user.role === 'Organizer' ? user.name : 'Registered User',
                    city: 'Karachi',
                    status: user.role === 'Organizer' ? 'Verified' : 'Active',
                    joinedAt: new Date().toISOString().slice(0, 10),
                  },
                  ...prev,
                ];
              });
            }
            showToast(`Signed in as ${user.name} (${user.role})`);
            if (user.role === 'Admin') {
              setActiveView('admin');
            } else if (user.role === 'Organizer') {
              setActiveView('organizer');
            }
          }}
        />
      )}

      {/* Non-intrusive Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-950 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium border border-slate-800"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            aria-label="Dismiss notification"
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
