'use client';

import Link from 'next/link';
import { Contest } from '@/types';
import { Calendar, Trophy, ArrowRight, Crown } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  contest: Contest;
}

export default function ContestCard({ contest }: Props) {
  const isActive = contest.status === 'active';
  const isEnded = contest.status === 'ended';
  const isUpcoming = contest.status === 'upcoming';

  const statusConfig = {
    active: { label: 'Live Now', color: 'bg-green-100 text-green-700', dot: 'bg-green-400 animate-pulse' },
    ended: { label: 'Ended', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
    upcoming: { label: 'Coming Soon', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  };

  const status = statusConfig[contest.status];

  return (
    <div className="contest-card glass rounded-3xl overflow-hidden group cursor-pointer" style={{ boxShadow: '0 4px 24px rgba(124,58,237,0.1)' }}>
      {/* Banner */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 flex items-center justify-center">
        <span className="text-7xl group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
          {contest.bannerEmoji ?? '🏆'}
        </span>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color} glass`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Reward badge */}
        {contest.rewardAvailable && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 glass">
            <Crown className="w-3 h-3" /> Reward
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-purple-900 mb-2 line-clamp-1 group-hover:gradient-text transition-all">
          {contest.title}
        </h3>
        <p className="text-sm text-purple-600 line-clamp-2 mb-4 leading-relaxed">
          {contest.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-purple-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {isEnded
              ? `Ended ${format(contest.endDate, 'MMM d, yyyy')}`
              : isUpcoming
              ? `Starts ${format(contest.startDate, 'MMM d, yyyy')}`
              : `Ends ${format(contest.endDate, 'MMM d, yyyy')}`}
          </span>
        </div>

        {isActive && (
          <Link href={`/contest/${contest.id}`} className="btn-primary text-sm py-2.5 w-full justify-center">
            Enter Contest <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {isEnded && (
          <Link href={`/contest/${contest.id}/winners`} className="btn-secondary text-sm py-2.5 w-full justify-center">
            <Trophy className="w-4 h-4" /> View Winners
          </Link>
        )}
        {isUpcoming && (
          <Link href={`/contest/${contest.id}`} className="btn-secondary text-sm py-2.5 w-full justify-center">
            Learn More <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
