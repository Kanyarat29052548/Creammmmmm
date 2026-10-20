import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useSite();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.isAnnouncementActive || !settings.announcement || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
          <span className="shrink-0 p-1 bg-white/20 rounded-lg">
            <Megaphone className="w-4 h-4 text-white animate-bounce" />
          </span>
          <span className="font-semibold bg-white/20 text-white text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
            ประกาศ
          </span>
          <p className="truncate font-medium">{settings.announcement}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
