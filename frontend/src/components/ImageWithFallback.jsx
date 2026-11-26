import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackTitle = 'Event Preview',
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200/70 to-slate-100 text-slate-500 p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle}
      >
        <Calendar className="w-8 h-8 text-slate-400 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-slate-600 max-w-[20ch] truncate">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
