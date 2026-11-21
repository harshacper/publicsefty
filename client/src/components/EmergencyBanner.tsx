import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-700 text-white text-xs md:text-sm px-4 py-2 relative flex items-center justify-between border-b border-red-800 shadow-inner">
      <div className="flex items-center space-x-2 md:space-x-3 max-w-7xl mx-auto flex-1 pr-6">
        <span className="flex-shrink-0 bg-red-900/60 p-1 rounded">
          <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
        </span>
        <div className="flex-1">
          <span className="font-bold text-amber-200 uppercase tracking-wide">
            EMERGENCY NOTICE:
          </span>{' '}
          This portal is for non-emergency public complaint registration and tracking.{' '}
          <span className="hidden sm:inline">
            If you are in immediate danger or witnessing an ongoing crime, please contact emergency services immediately.
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3 py-1 rounded-full text-xs shadow transition active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5 fill-current" />
            <span>DIAL 112</span>
          </a>
          <Link
            to="/emergency"
            className="hidden md:inline-block underline text-amber-200 hover:text-white text-xs"
          >
            All Helplines
          </Link>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-red-800/50"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
