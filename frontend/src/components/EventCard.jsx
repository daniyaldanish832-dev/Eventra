import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatEventDate, formatTime12h } from '../services/eventService.js';

export default function EventCard({ event, onSelect }) {
  const seatsLeft = Math.max(0, event.capacity - event.bookedSeats);
  const fillPercent = Math.min(
    100,
    Math.round((event.bookedSeats / Math.max(1, event.capacity)) * 100)
  );
  const isSoldOut = seatsLeft === 0;
  const isLowSeats = !isSoldOut && seatsLeft <= 15;

  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors duration-150 hover:border-slate-300">
      {/* 4:3 Image Frame */}
      <button
        type="button"
        onClick={() => onSelect(event)}
        className="block w-full aspect-[4/3] overflow-hidden bg-slate-100 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
      >
        <ImageWithFallback
          src={event.coverImage}
          alt={event.title}
          fallbackTitle={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </button>

      {/* Card Body */}
      <div className="flex-1 flex flex-col p-5 sm:p-6">
        {/* Zero-Pill Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 mb-2">
          <span className="text-slate-700">{event.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {formatEventDate(event.date)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {formatTime12h(event.startTime)}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-slate-950 leading-snug mb-2 group-hover:text-blue-800 transition-colors">
          <button
            type="button"
            onClick={() => onSelect(event)}
            className="text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {event.title}
          </button>
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {event.venue}, {event.city}
          </span>
        </div>

        {/* Capacity Bar & Price Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span
              className={`font-medium tabular-nums ${
                isSoldOut
                  ? 'text-red-700'
                  : isLowSeats
                    ? 'text-amber-700'
                    : 'text-slate-600'
              }`}
            >
              {isSoldOut
                ? 'Sold Out'
                : `${seatsLeft} of ${event.capacity} seats left`}
            </span>
            <span className="font-mono text-slate-500 tabular-nums">
              {fillPercent}% filled
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isSoldOut
                  ? 'bg-red-600'
                  : isLowSeats
                    ? 'bg-amber-500'
                    : 'bg-blue-800'
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 block">Starts from</span>
              <span className="font-mono text-lg font-semibold text-slate-950 tabular-nums">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelect(event)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-900 bg-slate-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              <span>{isSoldOut ? 'View Details' : 'View & Book'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
