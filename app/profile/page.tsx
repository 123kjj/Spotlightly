'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Mail, Calendar, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass rounded-3xl p-8 glow-lavender">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-24 h-24 rounded-full ring-4 ring-purple-200 shadow-xl animate-float mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-purple-200 shadow-xl animate-float mb-4">
              {user.displayName?.[0] ?? user.email?.[0] ?? '?'}
            </div>
          )}
          <h1 className="text-2xl font-extrabold gradient-text">{user.displayName ?? 'Creator'}</h1>
          <p className="text-purple-600 text-sm mt-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Spotlightly Member
          </p>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50/50">
            <User className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600">Display Name</p>
              <p className="text-sm font-semibold text-purple-900">{user.displayName ?? 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50/50">
            <Mail className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600">Email</p>
              <p className="text-sm font-semibold text-purple-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50/50">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600">User ID</p>
              <p className="text-sm font-mono text-purple-700 truncate">{user.uid}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-purple-100 flex gap-3">
          <Link href="/browse" className="btn-primary flex-1 justify-center">Browse Contests</Link>
          <Link href="/create" className="btn-secondary flex-1 justify-center">Create Contest</Link>
        </div>
      </div>
    </div>
  );
}
