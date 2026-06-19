'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  hue: number;
}

interface Sparkle {
  id: number;
  top: string;
  left: string;
  fontSize: number;
  delay: string;
  duration: string;
}

interface Cloud {
  id: number;
  top: string;
  left: string;
  opacity: number;
  width: number;
  height: number;
  delay: string;
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2,
        delay: `${Math.random() * 4}s`,
        duration: `${2 + Math.random() * 3}s`,
        hue: 40 + Math.random() * 20,
      }))
    );

    setSparkles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: 8 + Math.random() * 10,
        delay: `${Math.random() * 3}s`,
        duration: `${1.5 + Math.random() * 2.5}s`,
      }))
    );

    setClouds(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: `${5 + Math.random() * 50}%`,
        left: `${Math.random() * 90}%`,
        opacity: 0.3 + Math.random() * 0.3,
        width: 200 * (0.5 + Math.random() * 1),
        height: 80 * (0.5 + Math.random() * 1),
        delay: `${i * 1.5}s`,
      }))
    );
  }, []);

  // Render nothing on the server — stars appear after hydration
  if (stars.length === 0) return <div className="fixed inset-0 pointer-events-none z-0" />;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: `hsl(${star.hue}, 90%, 70%)`,
            animationName: 'twinkle',
            animationDuration: star.duration,
            animationDelay: star.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {sparkles.map(s => (
        <div
          key={`sparkle-${s.id}`}
          className="absolute text-yellow-300"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.fontSize,
            animationName: 'twinkle',
            animationDuration: s.duration,
            animationDelay: s.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            opacity: 0.6,
          }}
        >
          ✦
        </div>
      ))}

      {clouds.map(cloud => (
        <div
          key={`cloud-${cloud.id}`}
          className="absolute rounded-full"
          style={{
            top: cloud.top,
            left: cloud.left,
            width: cloud.width,
            height: cloud.height,
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
            opacity: cloud.opacity,
            animationName: 'float-slow',
            animationDuration: '8s',
            animationDelay: cloud.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
}
