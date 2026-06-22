'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'spotlightly_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Slight delay so it doesn't flash before the page settles
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function handleDismiss() {
    // Treat dismiss as acceptance too, so the banner doesn't reappear every visit
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[60] animate-rise-in">
      <div className="glass rounded-3xl p-5 glow-lavender relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-4 pr-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-purple-700 leading-relaxed">
            Spotlightly uses cookies and similar technologies to keep you signed in and improve your experience.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/privacy"
            className="btn-secondary text-xs py-2 px-4 flex-1 justify-center"
          >
            Learn More
          </Link>
          <button onClick={handleAccept} className="btn-primary text-xs py-2 px-4 flex-1 justify-center">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
