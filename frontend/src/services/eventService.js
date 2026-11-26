import {
  INITIAL_BOOKINGS,
  INITIAL_EVENTS,
  INITIAL_USERS,
} from '../data/initialEvents';

const STORAGE_KEYS = {
  EVENTS: 'eventra_mern_events_v1',
  BOOKINGS: 'eventra_mern_bookings_v1',
  USER: 'eventra_mern_user_v1',
  USERS: 'eventra_mern_users_v1',
};

/**
 * MERN Stack Integration Guide:
 * Replace localStorage operations below with fetch('/api/...') or axios calls
 * to your Express + MongoDB backend endpoints:
 *   GET    /api/events
 *   POST   /api/events
 *   PUT    /api/events/:id
 *   DELETE /api/events/:id
 *   GET    /api/bookings
 *   POST   /api/bookings
 *   PATCH  /api/bookings/:id/checkin
 *   PATCH  /api/bookings/:id/cancel
 *   POST   /api/auth/login
 *   POST   /api/auth/register
 */

export function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EVENTS;
  } catch {
    return INITIAL_EVENTS;
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch {
    // Ignore storage quota errors
  }
}

export function generateTicketCode() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `EVT-2026-${digits}`;
}

export function formatEventDate(dateStr) {
  if (!dateStr) return 'TBD';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hourRaw, minute = '00'] = timeStr.split(':');
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) return timeStr;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 || 12;
  return `${normalized}:${minute} ${suffix}`;
}
