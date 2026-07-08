'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveFlyers } from '@/lib/firestore';
import { getContest } from '@/lib/firestore';
import { Flyer, Contest } from '@/types';

interface FlyerWithContest extends Flyer {
  contest?: Contest;
}

// Predefined positions around the hero — left column and right column,
// carefully placed so they never overlap the centered hero content or navbar.
const POSITIONS = [
  // Left side
  { top: '8%',  left: '1%',  rotate: -8,  delay: '0s',    duration: '5.5s' },
  { top: '34%', left: '0%',  rotate: 5,   delay: '1.2s',  duration: '6.5s' },
  { top: '62%', left: '2%',  rotate: -4,  delay: '0.4s',  duration: '5s'   },
  // Right side
  { top: '6%',  right: '1%', rotate: 7,   delay: '0.8s',  duration: '6s'   },
  { top: '36%', right: '0%', rotate: -6,  delay: '1.8s',  duration: '5.8s' },
  { top: '64%', right: '2%', rotate: 4,   delay: '0.2s',  duration: '6.2s' },
];

// On mobile we only show 2 flyers (one per side, top only) to keep it clean
const MOBILE_POSITIONS = [
  { top: '6%', left: '0%',  rotate: -5, delay: '0s',   duration: '5.5s' },
  { top: '6%', right: '0%', rotate: 5,  delay: '1s',   duration: '6s'   },
];

export default function FlyerCarousel() {
  const router = useRouter();
  const [flyers, setFlyers] = useState<FlyerWithContest[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    async function load() {
      const raw = await getActiveFlyers();
      // Only show flyers whose contest is active or upcoming
      const enriched = await Promise.all(
        raw.map(async flyer => {
          const contest = await getContest(flyer.contestId);
          return { ...flyer, contest: contest ?? undefined };
        })
      );
      // Filter to active or upcoming contests only
      const filtered = enriched.filter(f =>
        f.contest && (f.contest.status === 'active' || f.contest.status === 'upcoming')
      );
      setFlyers(filtered.slice(0, 6));
    }
    load();
  }, []);

  if (flyers.length === 0) return null;

  const positions = isMobile ? MOBILE_POSITIONS : POSITIONS;
  const visibleFlyers = flyers.slice(0, positions.length);

  return (
    <>
      {visibleFlyers.map((flyer, i) => {
        const pos = positions[i];
        const { rotate, delay, duration, ...posStyles } = pos;

        return (
          <div
            key={flyer.id}
            onClick={() => {
              const dest = flyer.contest?.status === 'ended'
                ? `/contest/${flyer.contestId}/winners`
                : `/contest/${flyer.contestId}`;
              router.push(dest);
            }}
            className="absolute cursor-pointer group"
            style={{
              ...posStyles,
              width: isMobile ? '80px' : '130px',
              transform: `rotate(${rotate}deg)`,
              zIndex: 5,
              animationName: 'flyerFloat',
              animationDuration: duration,
              animationDelay: delay,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:rotate-0 group-hover:z-20"
              style={{
                boxShadow: '0 4px 20px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                transform: 'inherit',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(124,58,237,0.35), 0 0 20px rgba(196,181,253,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <img
                src={flyer.imageUrl}
                alt={flyer.flyerTitle ?? flyer.contest?.title ?? 'Contest Flyer'}
                className="w-full object-cover"
                style={{ aspectRatio: '3/4' }}
              />

              {/* Subtle label at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-center font-semibold leading-tight"
                  style={{ fontSize: isMobile ? '6px' : '9px', lineClamp: 2 }}>
                  {flyer.flyerTitle ?? flyer.contest?.title}
                </p>
              </div>

              {/* Active indicator dot */}
              {flyer.contest?.status === 'active' && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-400 rounded-full border border-white shadow animate-pulse" />
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes flyerFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-10px) rotate(calc(var(--r, 0deg) + 1.5deg)); }
        }
      `}</style>
    </>
  );
}
