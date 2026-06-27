'use client';

import { useEffect, useState } from 'react';
import { getContests } from '@/lib/firestore';
import { Contest } from '@/types';
import ContestCard from '@/components/contest/ContestCard';
import { Search, Filter } from 'lucide-react';

type Filter = 'all' | 'active' | 'ended' | 'upcoming';

export default function BrowsePage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    getContests().then(c => { setContests(c); setLoading(false); });
  }, []);

  const filtered = contests.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const filterTabs: { value: Filter; label: string; emoji: string }[] = [
    { value: 'all', label: 'All', emoji: '✨' },
    { value: 'active', label: 'Live Now', emoji: '🟢' },
    { value: 'upcoming', label: 'Coming Soon', emoji: '🔵' },
    { value: 'ended', label: 'Ended', emoji: '🏆' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="gradient-text">Browse Contests</span>
        </h1>
        <p className="text-gray-700 text-lg">Discover competitions and showcase your creativity</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dreamy pl-11"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'glass text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-purple-900 mb-2">No contests found</h3>
          <p className="text-gray-700">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-6">{filtered.length} contest{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <div key={c.id} className="animate-rise-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <ContestCard contest={c} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
