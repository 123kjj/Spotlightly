'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-20 glass border-t border-purple-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 group-hover:animate-sparkle" />
              <div className="absolute inset-0 blur-sm bg-yellow-300 rounded-full opacity-40" />
            </div>
            <span className="text-lg font-bold gradient-text">Spotlightly</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/terms" className="text-purple-700 hover:text-purple-800 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-purple-700 hover:text-purple-800 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/guidelines" className="text-purple-700 hover:text-purple-800 transition-colors">
              Community Guidelines
            </Link>
            <Link href="/contact" className="text-purple-700 hover:text-purple-800 transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-purple-100/50 text-center">
          <p className="text-xs text-purple-300 flex items-center justify-center gap-1.5">
            ✨ &copy; {year} Spotlightly — Where Creativity Takes Center Stage ✨
          </p>
        </div>
      </div>
    </footer>
  );
}
