'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getContests } from '@/lib/firestore';
import { Contest } from '@/types';
import ContestCard from '@/components/contest/ContestCard';
import { Sparkles, Trophy, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContests().then(c => { setContests(c); setLoading(false); });
  }, []);

  return (
    <div className="relative">
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, #fbcfe8, transparent)', animationDelay: '2s' }} />
        <div className="absolute top-40 right-32 w-48 h-48 rounded-full opacity-20 animate-float-slow"
          style={{ background: 'radial-gradient(circle, #bae6fd, transparent)', animationDelay: '1s' }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full mb-8 glow-lavender">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-sparkle" />
            <span className="text-sm font-medium text-purple-700">Where every creator shines</span>
            <Sparkles className="w-4 h-4 text-pink-400 animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">Where Creativity</span>
            <br />
            <span className="text-purple-900">Takes Center Stage</span>
          </h1>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
            A platform where creators can participate in contests, share their talents, and compete for the top spot.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/create" className="btn-primary text-base px-8 py-4">
              <Zap className="w-5 h-5" /> Create Contest
            </Link>
            <Link href="/browse" className="btn-secondary text-base px-8 py-4">
              <Trophy className="w-5 h-5" /> Browse Contests
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { emoji: '🏆', label: 'Active Contests', value: contests.filter(c => c.status === 'active').length },
              { emoji: '✨', label: 'Total Contests', value: contests.length },
              { emoji: '🌟', label: 'Platform', value: 'Free' },
            ].map(stat => (
              <div key={stat.label} className="glass px-6 py-4 rounded-2xl text-center glow-lavender">
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-gray-600 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-purple-900">✨ <span className="gradient-text">Contests</span></h2>
            <p className="text-gray-700 mt-1">Find your stage and shine</p>
          </div>
          <Link href="/browse" className="btn-secondary text-sm py-2 px-5">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4 animate-float">🌟</div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">No contests yet</h3>
            <p className="text-gray-700 mb-6">Be the first to create one!</p>
            <Link href="/create" className="btn-primary"><Zap className="w-4 h-4" /> Create First Contest</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((c, i) => (
              <div key={c.id} className="animate-rise-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <ContestCard contest={c} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
