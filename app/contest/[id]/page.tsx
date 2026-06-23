'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getContest, getApprovedEntries, getUserVotes, deleteContest } from '@/lib/firestore';
import { Contest, Entry } from '@/types';
import { useAuth } from '@/lib/auth-context';
import EntryCard from '@/components/entry/EntryCard';
import { Calendar, Gift, Trophy, Share2, Plus, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ContestPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMsg, setShareMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isOwner = user && contest && (user.uid === contest.createdBy || isAdmin);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this contest? This cannot be undone.')) return;
    setDeleting(true);
    await deleteContest(id);
    router.push('/browse');
  }

  useEffect(() => {
    async function load() {
      const c = await getContest(id);
      if (!c) { router.push('/browse'); return; }
      setContest(c);
      const e = await getApprovedEntries(id);
      setEntries(e);
      if (user) {
        const v = await getUserVotes(user.uid, id);
        setUserVotes(v);
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: contest?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-500">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contest) return null;

  const isActive = contest.status === 'active';
  const isEnded = contest.status === 'ended';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 h-64 md:h-80 bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 flex items-center justify-center">
        <span className="text-9xl drop-shadow-sm">{contest.bannerEmoji ?? '🏆'}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass mb-3 ${
            isActive ? 'text-green-700' : isEnded ? 'text-gray-500' : 'text-blue-700'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : isEnded ? 'bg-gray-400' : 'bg-blue-400'}`} />
            {isActive ? 'Live Now' : isEnded ? 'Contest Ended' : 'Coming Soon'}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg">{contest.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass rounded-3xl p-6">
            <h2 className="font-bold text-purple-900 text-lg mb-3">About this Contest</h2>
            <p className="text-purple-600 leading-relaxed">{contest.description}</p>
          </div>

          {/* Rules */}
          <div className="glass rounded-3xl p-6">
            <h2 className="font-bold text-purple-900 text-lg mb-3">📋 Rules</h2>
            <div className="text-purple-600 leading-relaxed whitespace-pre-wrap text-sm">{contest.rules}</div>
          </div>

          {/* Entries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-purple-900 text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Entries <span className="text-purple-400 font-normal text-base">({entries.length})</span>
              </h2>
              {isActive && (
                <Link href={`/contest/${id}/submit`} className="btn-primary text-sm py-2">
                  <Plus className="w-4 h-4" /> Submit Entry
                </Link>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center">
                <div className="text-4xl mb-3 animate-float">🎬</div>
                <p className="font-semibold text-purple-900 mb-1">No approved entries yet</p>
                <p className="text-sm text-purple-400">
                  {isActive ? 'Be the first to submit!' : 'Check back soon.'}
                </p>
                {isActive && (
                  <Link href={`/contest/${id}/submit`} className="btn-primary mt-4 text-sm">
                    <Plus className="w-4 h-4" /> Submit Entry
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entries.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    contestId={id}
                    hasVoted={userVotes.includes(entry.id)}
                    rank={i + 1}
                    onVoteChange={(entryId, voted) => {
                      setUserVotes(prev =>
                        voted ? [...prev, entryId] : prev.filter(v => v !== entryId)
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="glass rounded-3xl p-5 space-y-3">
            {isActive && (
              <Link href={`/contest/${id}/submit`} className="btn-primary w-full justify-center py-3.5">
                <Plus className="w-5 h-5" /> Submit Your Entry
              </Link>
            )}
            {isEnded && (
              <Link href={`/contest/${id}/winners`} className="btn-primary w-full justify-center py-3.5">
                <Trophy className="w-5 h-5" /> View Winners
              </Link>
            )}
            <div className="relative">
              <button onClick={handleShare} className="btn-secondary w-full justify-center py-3.5">
                <Share2 className="w-5 h-5" /> Share Contest
              </button>
              {shareMsg && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs bg-purple-800 text-white px-3 py-1.5 rounded-lg">
                  {shareMsg}
                </div>
              )}
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-sm font-medium text-red-500 border-2 border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Contest'}
              </button>
            )}
          </div>

          {/* Dates */}
          <div className="glass rounded-3xl p-5">
            <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-400">Start</span>
                <span className="text-purple-700 font-medium">{format(contest.startDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">End</span>
                <span className="text-purple-700 font-medium">{format(contest.endDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Reward */}
          {contest.rewardAvailable && (
            <div className="glass rounded-3xl p-5 glow-gold">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-500" /> Reward
              </h3>
              <p className="font-semibold text-yellow-700 mb-1">{contest.rewardTitle}</p>
              <p className="text-sm text-purple-500 mb-3">{contest.rewardDescription}</p>
              {contest.hostEmail && (
                <div className="pt-3 border-t border-yellow-200/50">
                  <p className="text-xs text-purple-400">
                    💬 Contact{' '}
                    <a href={`mailto:${contest.hostEmail}`} className="font-semibold text-purple-600 hover:underline">
                      {contest.hostEmail}
                    </a>{' '}
                    if you have any questions or would like to receive your prize.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard preview */}
          {entries.length >= 3 && (
            <div className="glass rounded-3xl p-5">
              <h3 className="font-bold text-purple-900 mb-3">🏆 Top Entries</h3>
              {entries.slice(0, 3).map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 py-2">
                  <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-800 truncate">{entry.entryTitle}</p>
                    <p className="text-xs text-purple-400">{entry.firstName}</p>
                  </div>
                  <span className="text-xs font-bold text-pink-500">❤️ {entry.voteCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
