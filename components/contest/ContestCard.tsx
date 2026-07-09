'use client';

import Link from 'next/link';
import { Contest } from '@/types';
import { Calendar, Trophy, ArrowRight, Crown } from 'lucide-react';
import { format } from 'date-fns';
import ContestBanner from './ContestBanner';

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
  const destination = isEnded ? `/contest/${contest.id}/winners` : `/contest/${contest.id}`;

  return (
    <Link
      href={destination}
      className="contest-card glass rounded-3xl overflow-hidden group cursor-pointer block"
      style={{ boxShadow: '0 4px 24px rgba(124,58,237,0.1)' }}
    >
      {/* Banner */}
      <div className="relative">
        <ContestBanner contest={contest} height="h-48" />

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color} glass z-10`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Reward badge */}
        {contest.rewardAvailable && (
          <div className="absolute top-3 right-20 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 glass z-10">
            <Crown className="w-3 h-3" /> Reward
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-purple-900 mb-2 line-clamp-1 group-hover:gradient-text transition-all">
          {contest.title}
        </h3>
        <p className="text-sm text-gray-700 line-clamp-2 mb-4 leading-relaxed">
          {contest.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
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
          <span className="btn-primary text-sm py-2.5 w-full justify-center pointer-events-none">
            Enter Contest <ArrowRight className="w-4 h-4" />
          </span>
        )}
        {isEnded && (
          <span className="btn-secondary text-sm py-2.5 w-full justify-center pointer-events-none">
            <Trophy className="w-4 h-4" /> See Winners
          </span>
        )}
        {isUpcoming && (
          <span className="btn-secondary text-sm py-2.5 w-full justify-center pointer-events-none">
            Learn More <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </Link>
  );
}
