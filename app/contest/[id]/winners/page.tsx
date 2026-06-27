'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getContest, getApprovedEntries } from '@/lib/firestore';
import { Contest, Entry } from '@/types';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Trophy, ExternalLink, ArrowLeft } from 'lucide-react';

function WinnerCard({ entry, place, size = 'normal' }: { entry: Entry; place: 1 | 2 | 3; size?: 'large' | 'normal' }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const colors = {
    1: 'from-yellow-100 to-amber-100 border-yellow-300 glow-gold',
    2: 'from-gray-100 to-slate-100 border-gray-300',
    3: 'from-orange-50 to-amber-50 border-orange-200',
  };

  return (
    <div className={`glass rounded-3xl overflow-hidden border-2 ${colors[place]} ${size === 'large' ? 'scale-105' : ''} transition-all`}>
      <div className="relative">
        <img
          src={entry.thumbnailUrl}
          alt={entry.entryTitle}
          className="w-full aspect-video object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${entry.youtubeId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 text-3xl drop-shadow-lg">{medals[place]}</div>
        <a
          href={entry.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20"
        >
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </a>
      </div>
      <div className="p-4 text-center">
        <p className="font-bold text-purple-900 line-clamp-2 mb-1">{entry.entryTitle}</p>
        <p className="text-sm text-gray-700 mb-2">{entry.firstName} · Age {entry.age}</p>
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm font-bold">
          ❤️ {entry.voteCount} votes
        </div>
      </div>
    </div>
  );
}

export default function WinnersPage() {
  const { id: contestId } = useParams<{ id: string }>();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const confettiFired = useRef(false);

  useEffect(() => {
    async function load() {
      const c = await getContest(contestId);
      if (!c) { router.push('/browse'); return; }
      setContest(c);
      const e = await getApprovedEntries(contestId);
      setEntries(e);
      setLoading(false);
    }
    load();
  }, [contestId]);

  useEffect(() => {
    if (!loading && entries.length > 0 && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors: ['#c4b5fd', '#fbcfe8', '#fbbf24', '#bae6fd'] });
        setTimeout(() => confetti({ particleCount: 60, spread: 70, origin: { y: 0.5, x: 0.2 } }), 400);
        setTimeout(() => confetti({ particleCount: 60, spread: 70, origin: { y: 0.5, x: 0.8 } }), 600);
      }, 500);
    }
  }, [loading, entries]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const [first, second, third] = entries;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <Link href={`/contest/${contestId}`} className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-700 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Contest
      </Link>

      {/* Header */}
      <div className="text-center mb-12">
        {/* Giant star */}
        <div className="relative inline-block mb-6">
          <div className="text-8xl animate-float drop-shadow-2xl">⭐</div>
          <div className="absolute inset-0 blur-xl bg-yellow-300/50 rounded-full" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold gradient-text-gold mb-3">
          {contest?.title}
        </h1>
        <p className="text-xl text-gray-700 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Contest Winners
          <Trophy className="w-5 h-5 text-yellow-500" />
        </p>

        {contest?.rewardAvailable && contest.hostEmail && (
          <div className="inline-flex flex-col items-center gap-1 glass rounded-2xl px-6 py-4 mt-6 glow-gold">
            <p className="text-sm font-semibold text-purple-900">
              🎁 {contest.rewardTitle}
            </p>
            <p className="text-sm text-gray-700">
              Contact{' '}
              <a href={`mailto:${contest.hostEmail}?subject=Spotlightly — ${contest.title}`}
                className="font-semibold text-purple-700 hover:underline">
                {contest.hostEmail}
              </a>{' '}
              if you have any questions or would like to receive your prize.
            </p>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl">
          <div className="text-5xl mb-4">🤔</div>
          <p className="text-xl font-bold text-purple-900">No winners yet</p>
          <p className="text-gray-700 mt-2">There are no approved entries for this contest.</p>
        </div>
      ) : (
        <>
          {/* Podium: 2nd | 1st | 3rd */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
            {/* 2nd */}
            <div className="md:order-1 md:mb-8">
              {second ? <WinnerCard entry={second} place={2} /> : (
                <div className="glass rounded-3xl p-8 text-center text-purple-300">
                  <div className="text-4xl mb-2">🥈</div>
                  <p className="text-sm">No 2nd place</p>
                </div>
              )}
            </div>

            {/* 1st — center, elevated */}
            <div className="md:order-2">
              {first ? <WinnerCard entry={first} place={1} size="large" /> : (
                <div className="glass rounded-3xl p-8 text-center text-purple-300">
                  <div className="text-4xl mb-2">🥇</div>
                  <p className="text-sm">No winner yet</p>
                </div>
              )}
            </div>

            {/* 3rd */}
            <div className="md:order-3 md:mb-16">
              {third ? <WinnerCard entry={third} place={3} /> : (
                <div className="glass rounded-3xl p-8 text-center text-purple-300">
                  <div className="text-4xl mb-2">🥉</div>
                  <p className="text-sm">No 3rd place</p>
                </div>
              )}
            </div>
          </div>

          {/* Remaining entries */}
          {entries.length > 3 && (
            <div>
              <h2 className="text-xl font-bold text-purple-900 mb-4">All Participants</h2>
              <div className="space-y-3">
                {entries.slice(3).map((entry, i) => (
                  <div key={entry.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="text-lg font-bold text-purple-600 w-8 text-center">#{i + 4}</div>
                    <img src={entry.thumbnailUrl} alt="" className="w-16 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-purple-900 truncate">{entry.entryTitle}</p>
                      <p className="text-xs text-gray-600">{entry.firstName} · {entry.voteCount} votes</p>
                    </div>
                    <a href={entry.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full hover:bg-purple-50 text-purple-600 hover:text-purple-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sparkle decoration */}
      <div className="text-center mt-12 text-4xl space-x-4 animate-pulse">
        ✨ 🌟 ✨ 🌟 ✨
      </div>
    </div>
  );
}
