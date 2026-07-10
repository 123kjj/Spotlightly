'use client';

import { useState } from 'react';
import { Entry } from '@/types';
import { Share2, Flag, ExternalLink, ThumbsUp, Check } from 'lucide-react';
import { voteForEntry, removeVote, reportEntry } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import ReportModal from './ReportModal';

interface Props {
  entry: Entry;
  contestId: string;
  hasVoted: boolean;
  onVoteChange?: (entryId: string, voted: boolean) => void;
  onShare?: (entry: Entry) => void;
  rank?: number;
}

export default function EntryCard({ entry, contestId, hasVoted, onVoteChange, rank }: Props) {
  const { user } = useAuth();
  const [voted, setVoted] = useState(hasVoted);
  const [voteCount, setVoteCount] = useState(entry.voteCount);
  const [voteLoading, setVoteLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  async function handleVote() {
    if (!user) {
      alert('Please sign in to vote!');
      return;
    }
    setVoteLoading(true);
    try {
      if (voted) {
        await removeVote(entry.id, user.uid);
        setVoted(false);
        setVoteCount(c => c - 1);
        onVoteChange?.(entry.id, false);
      } else {
        const success = await voteForEntry(entry.id, contestId, user.uid);
        if (success) {
          setVoted(true);
          setVoteCount(c => c + 1);
          onVoteChange?.(entry.id, true);
        }
      }
    } catch (err) {
      console.error('Vote error:', err);
      alert('Could not register your vote. Please try again in a moment.');
    } finally {
      setVoteLoading(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/contest/${contestId}#entry-${entry.id}`;
    if (navigator.share) {
      await navigator.share({ title: entry.entryTitle, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  }

  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <>
      <div id={`entry-${entry.id}`} className="entry-card glass rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(124,58,237,0.1)' }}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
          {entry.thumbnailUrl ? (
            <img
              src={entry.thumbnailUrl}
              alt={entry.entryTitle}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const id = entry.youtubeId;
                if (id && img.src.includes('maxresdefault')) {
                  img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                } else if (id && img.src.includes('hqdefault')) {
                  img.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                } else if (id && img.src.includes('mqdefault')) {
                  img.src = `https://img.youtube.com/vi/${id}/default.jpg`;
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          ) : entry.youtubeId ? (
            <img
              src={`https://img.youtube.com/vi/${entry.youtubeId}/hqdefault.jpg`}
              alt={entry.entryTitle}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.includes('default.jpg') || img.src.includes('hq') || img.src.includes('mq')) {
                  img.src = `https://img.youtube.com/vi/${entry.youtubeId}/default.jpg`;
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          ) : null}

          {/* Emoji placeholder shown when no thumbnail or image fails */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-5xl opacity-40">🎬</span>
          </div>

          <a
            href={entry.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-10"
          >
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </a>

          {rankEmoji && (
            <div className="absolute top-2 left-2 text-2xl drop-shadow-lg z-10">{rankEmoji}</div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-purple-900 text-sm mb-1 line-clamp-2">{entry.entryTitle}</h3>
          <p className="text-xs text-gray-600 mb-3">
            {entry.firstName} · Age {entry.age}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {/* Vote */}
            <button
              onClick={handleVote}
              disabled={voteLoading}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-60 ${
                voted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-md hover:scale-105'
              }`}
            >
              {voted ? <Check className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
              <span>{voted ? 'Voted' : 'Vote'}</span>
              <span className={voted ? 'text-green-600' : 'text-white/90'}>· {voteCount}</span>
            </button>

            <div className="flex items-center gap-1">
              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-all relative"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
                {shareMsg && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-purple-800 text-white px-2 py-1 rounded-lg whitespace-nowrap">
                    {shareMsg}
                  </span>
                )}
              </button>

              {/* Watch */}
              <a
                href={entry.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-all"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Report */}
              <button
                onClick={() => setShowReport(true)}
                className="p-2 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                title="Report"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal
          entry={entry}
          contestId={contestId}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
