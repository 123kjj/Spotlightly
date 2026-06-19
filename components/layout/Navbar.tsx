'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Star } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogOut() {
    await logOut();
    router.push('/');
    setProfileOpen(false);
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse Contests' },
    { href: '/create', label: 'Create Contest' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass" style={{ borderBottom: '1px solid rgba(196,181,253,0.3)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Star className="w-7 h-7 text-yellow-400 fill-yellow-400 group-hover:animate-sparkle" />
              <div className="absolute inset-0 blur-sm bg-yellow-300 rounded-full opacity-40" />
            </div>
            <span className="text-xl font-bold gradient-text">Spotlightly</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 glass px-4 py-2 rounded-full hover:glow-lavender transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                      {user.displayName?.[0] ?? user.email?.[0] ?? '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-purple-800 max-w-28 truncate">
                    {user.displayName ?? user.email}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-purple-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-lg overflow-hidden z-50" style={{ border: '1px solid rgba(196,181,253,0.4)' }}>
                    <Link href="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-purple-700 hover:bg-purple-50/50 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-purple-700 hover:bg-purple-50/50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogOut}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50/50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm py-2 px-5">Log In</Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2 px-5">
                  <Sparkles className="w-4 h-4" /> Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-xl glass" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5 text-purple-700" /> : <Menu className="w-5 h-5 text-purple-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-purple-100/50 px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50/50 transition-colors">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-purple-700 hover:bg-purple-50/50">
                <User className="w-4 h-4" /> Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-purple-700 hover:bg-purple-50/50">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              <button onClick={() => { handleLogOut(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50/50 w-full">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2 flex-1 justify-center">Log In</Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2 flex-1 justify-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
