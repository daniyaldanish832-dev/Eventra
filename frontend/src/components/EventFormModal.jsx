import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  COVER_IMAGE_PRESETS,
  EVENT_CATEGORIES,
} from '../data/initialEvents.js';

export default function EventFormModal({ initialEvent, currentUser, onClose, onSave }) {
  const isEditing = Boolean(initialEvent);
  const availableCategories = EVENT_CATEGORIES.filter((c) => c !== 'All Events');

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [category, setCategory] = useState(
    initialEvent?.category || availableCategories[0]
  );
  const [date, setDate] = useState(initialEvent?.date || '2026-12-20');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '10:00');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '17:00');
  const [venue, setVenue] = useState(initialEvent?.venue || '');
  const [city, setCity] = useState(initialEvent?.city || 'Karachi');
  const [price, setPrice] = useState(
    initialEvent?.price !== undefined ? String(initialEvent.price) : '25'
  );
  const [capacity, setCapacity] = useState(
    initialEvent?.capacity !== undefined ? String(initialEvent.capacity) : '150'
  );
  const [status, setStatus] = useState(initialEvent?.status || 'Published');
  const [organizerName, setOrganizerName] = useState(
    initialEvent?.organizerName || currentUser?.name || 'Aptech Event Team'
  );
  const [organizerEmail, setOrganizerEmail] = useState(
    initialEvent?.organizerEmail ||
      currentUser?.email ||
      'events@aptech-studio.org'
  );
  const [coverImage, setCoverImage] = useState(
    initialEvent?.coverImage || COVER_IMAGE_PRESETS[0].url
  );
  const [description, setDescription] = useState(
    initialEvent?.description || ''
  );
  const [agenda, setAgenda] = useState(
    initialEvent?.agenda && initialEvent.agenda.length > 0
      ? initialEvent.agenda
      : [{ time: '10:00 AM', session: 'Registration & Opening Remarks' }]
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!title.trim() || title.trim().length < 4) {
      next.title = 'Event title must be at least 4 characters.';
    }
    if (!date) next.date = 'Select an event date.';
    if (!venue.trim()) next.venue = 'Venue name is required.';
    if (!city.trim()) next.city = 'City is required.';
    if (Number(capacity) < 1 || Number.isNaN(Number(capacity))) {
      next.capacity = 'Capacity must be at least 1.';
    }
    if (Number(price) < 0 || Number.isNaN(Number(price))) {
      next.price = 'Price cannot be negative.';
    }
    if (!description.trim() || description.trim().length < 15) {
      next.description = 'Provide a short event description (15+ characters).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAddAgendaRow = () => {
    setAgenda((prev) => [...prev, { time: '02:00 PM', session: '' }]);
  };

  const handleAgendaChange = (index, field, value) => {
    setAgenda((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveAgendaRow = (index) => {
    setAgenda((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanPrice = Number(price) || 0;
    const cleanAgenda = agenda.filter((a) => a.session.trim().length > 0);

    const payload = {
      ...(initialEvent || {}),
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      city: city.trim(),
      price: cleanPrice,
      capacity: Math.max(initialEvent?.bookedSeats || 0, Number(capacity)),
      bookedSeats: initialEvent?.bookedSeats || 0,
      status,
      organizerName: organizerName.trim(),
      organizerEmail: organizerEmail.trim(),
      coverImage: coverImage.trim() || COVER_IMAGE_PRESETS[0].url,
      description: description.trim(),
      agenda: cleanAgenda,
      tiers:
        initialEvent?.tiers && initialEvent.tiers.length > 0
          ? initialEvent.tiers.map((t, i) =>
              i === 0 ? { ...t, price: cleanPrice } : t
            )
          : [
              {
                name: cleanPrice === 0 ? 'Free Admission' : 'General Admission',
                price: cleanPrice,
                perks: 'Standard event access and digital pass',
              },
            ],
    };

    onSave(payload);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2
              id="event-form-title"
              className="font-display text-lg font-bold text-slate-950"
            >
              {isEditing ? 'Edit Event Details' : 'Create New Event'}
            </h2>
            <p className="text-xs text-slate-500">
              Fill out the event schedule, venue, and ticketing capacity below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event form"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="evt-title"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Event Title
              </label>
              <input
                id="evt-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack Web Engineering Bootcamp"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="evt-category"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Category
              </label>
              <select
                id="evt-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="evt-status"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Publication Status
              </label>
              <select
                id="evt-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              >
                <option value="Published">Published (Visible to Public)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="evt-date"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Date
              </label>
              <input
                id="evt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              />
              {errors.date && (
                <p className="text-xs text-red-600 mt-1">{errors.date}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="evt-start"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Start Time
                </label>
                <input
                  id="evt-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                />
              </div>
              <div>
                <label
                  htmlFor="evt-end"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  End Time
                </label>
                <input
                  id="evt-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="evt-venue"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Venue Name
              </label>
              <input
                id="evt-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Expo Auditorium Hall 2"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
              />
              {errors.venue && (
                <p className="text-xs text-red-600 mt-1">{errors.venue}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="evt-city"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                City
              </label>
              <input
                id="evt-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Karachi"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
              />
              {errors.city && (
                <p className="text-xs text-red-600 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="evt-price"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Ticket Price (USD · 0 for Free)
              </label>
              <input
                id="evt-price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
              />
              {errors.price && (
                <p className="text-xs text-red-600 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="evt-capacity"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Total Seat Capacity
              </label>
              <input
                id="evt-capacity"
                type="number"
                min={initialEvent?.bookedSeats || 1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
              />
              {errors.capacity && (
                <p className="text-xs text-red-600 mt-1">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="evt-org-name"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Organizer Name
              </label>
              <input
                id="evt-org-name"
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
              />
            </div>

            <div>
              <label
                htmlFor="evt-org-email"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Organizer Contact Email
              </label>
              <input
                id="evt-org-email"
                type="email"
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
              />
            </div>
          </div>

          {/* Cover Image Selector */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-2">
              Cover Photograph Preset
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {COVER_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    coverImage === preset.url
                      ? 'border-blue-800 ring-1 ring-blue-800'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                  title={preset.label}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-12 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="evt-desc"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Event Description
            </label>
            <textarea
              id="evt-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize what attendees will experience, speakers, and key takeaways..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Agenda Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">
                Schedule / Agenda Sessions
              </span>
              <button
                type="button"
                onClick={handleAddAgendaRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 hover:text-blue-900 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Session</span>
              </button>
            </div>
            <div className="space-y-2">
              {agenda.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.time}
                    onChange={(e) =>
                      handleAgendaChange(idx, 'time', e.target.value)
                    }
                    placeholder="10:00 AM"
                    className="w-28 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                  <input
                    type="text"
                    value={row.session}
                    onChange={(e) =>
                      handleAgendaChange(idx, 'session', e.target.value)
                    }
                    placeholder="Session title"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800"
                  />
                  {agenda.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAgendaRow(idx)}
                      aria-label="Remove session"
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
