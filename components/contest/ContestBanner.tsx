'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Contest } from '@/types';
import { useAuth } from '@/lib/auth-context';
import BannerEditModal from './BannerEditModal';

interface Props {
  contest: Contest;
  height?: string;          // e.g. 'h-48' or 'h-64'
  className?: string;
  onBannerUpdated?: (updated: Partial<Contest>) => void;
}

export default function ContestBanner({ contest, height = 'h-48', className = '', onBannerUpdated }: Props) {
  const { user, isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [localContest, setLocalContest] = useState(contest);

  const isOwner = user && (user.uid === localContest.createdBy || isAdmin);

  function handleSaved(updated: Partial<Contest>) {
    setLocalContest(c => ({ ...c, ...updated }));
    onBannerUpdated?.(updated);
  }

  // Determine what background/content to show
  const isImageBanner = localContest.bannerType === 'image' && localContest.bannerImageUrl;
  const bg = localContest.bannerGradient
    ? localContest.bannerGradient
    : localContest.bannerBackgroundColor
    ? localContest.bannerBackgroundColor
    : 'linear-gradient(135deg, #ede9fe, #fce7f3, #dbeafe)';

  return (
    <>
      <div className={`relative ${height} ${className} overflow-hidden`}>
        {isImageBanner ? (
          <img
            src={localContest.bannerImageUrl!}
            alt={localContest.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative"
            style={{ background: bg }}>
            <span className="text-6xl drop-shadow-sm">{localContest.bannerEmoji ?? '🏆'}</span>
            {localContest.bannerText && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/25 py-1.5 text-center">
                <p className="text-white text-sm font-semibold">{localContest.bannerText}</p>
              </div>
            )}
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Edit button — only for owner/admin */}
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); e.preventDefault(); setShowModal(true); }}
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass text-black hover:bg-white/30 transition-all z-10"
            style={{ backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)' }}
          >
            <Pencil className="w-3 h-3" /> Edit Banner
          </button>
        )}
      </div>

      {showModal && (
        <BannerEditModal
          contest={localContest}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
