'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createContest } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Trophy, Calendar, Gift, FileText, Image } from 'lucide-react';
import Link from 'next/link';

const BANNER_EMOJIS = [
  '🏆', '🎬', '🎤', '🎨', '🎭', '🎵', '🎸', '⭐',
  '✨', '🌟', '🔥', '💃', '🕺', '🎮', '📸', '🎙️',
  '🥇', '🌈', '🚀', '💎', '🎉', '🦄', '🐱', '🐶',
];

export default function CreateContestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    bannerUrl: '',
    bannerEmoji: '🏆',
    startDate: '',
    endDate: '',
    rules: '',
    rewardAvailable: false,
    rewardTitle: '',
    rewardDescription: '',
    hostEmail: '',
  });

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after start date.');
      return;
    }

    if (form.rewardAvailable) {
      if (!form.rewardTitle.trim()) {
        setError('Please provide a reward title.');
        return;
      }
      if (!form.rewardDescription.trim()) {
        setError('Please provide a reward description.');
        return;
      }
      if (!form.hostEmail.trim()) {
        setError('Please provide a contact email so winners know how to claim their reward.');
        return;
      }
    }

    setLoading(true);
    try {
      const id = await createContest({
        title: form.title,
        description: form.description,
        bannerUrl: form.bannerUrl,
        bannerEmoji: form.bannerEmoji,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        rules: form.rules,
        rewardAvailable: form.rewardAvailable,
        rewardTitle: form.rewardAvailable ? form.rewardTitle : undefined,
        rewardDescription: form.rewardAvailable ? form.rewardDescription : undefined,
        hostEmail: form.rewardAvailable ? form.hostEmail.trim() : undefined,
        createdBy: user.uid,
      });
      router.push(`/contest/${id}`);
    } catch (err: unknown) {
      console.error('Create contest error:', err);
      const msg = (err as { message?: string })?.message ?? String(err);
      setError(`Error: ${msg}`);
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4 animate-float">🔒</div>
        <h2 className="text-2xl font-bold text-purple-900 mb-3">Sign in required</h2>
        <p className="text-purple-500 mb-6">You need to be signed in to create a contest.</p>
        <Link href="/auth/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 mb-4 shadow-lg animate-float">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold gradient-text mb-2">Create a Contest</h1>
        <p className="text-purple-500">Set the stage for something magical ✨</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Contest Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Contest Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className="input-dreamy"
              placeholder="e.g. Spring Singing Contest 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Description *</label>
            <textarea
              required
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className="input-dreamy h-28 resize-none"
              placeholder="Tell participants what this contest is about..."
            />
          </div>
        </div>

        {/* Banner */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900 flex items-center gap-2">
            <Image className="w-4 h-4" /> Contest Banner
          </h2>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-3">Choose an Emoji</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {BANNER_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => update('bannerEmoji', emoji)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    form.bannerEmoji === emoji
                      ? 'bg-gradient-to-br from-purple-200 to-pink-200 ring-2 ring-purple-400 scale-110'
                      : 'glass hover:bg-purple-50/50 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 flex items-center justify-center text-5xl shadow-inner">
                {form.bannerEmoji}
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Schedule
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Start Date *</label>
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={e => update('startDate', e.target.value)}
                className="input-dreamy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">End Date *</label>
              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={e => update('endDate', e.target.value)}
                className="input-dreamy"
              />
            </div>
          </div>
        </div>

        {/* Reward */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900 flex items-center gap-2">
            <Gift className="w-4 h-4" /> Reward
          </h2>
          <div className="flex gap-3">
            {[true, false].map(val => (
              <label key={String(val)} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl cursor-pointer transition-all border-2 ${
                form.rewardAvailable === val
                  ? 'border-purple-400 bg-purple-50/50 text-purple-700 font-medium'
                  : 'border-transparent glass text-purple-400'
              }`}>
                <input
                  type="radio"
                  name="reward"
                  checked={form.rewardAvailable === val}
                  onChange={() => update('rewardAvailable', val)}
                  className="hidden"
                />
                {val ? '🎁 Yes, there is a reward' : '❌ No reward'}
              </label>
            ))}
          </div>

          {form.rewardAvailable && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Reward Title *</label>
                <input
                  type="text"
                  value={form.rewardTitle}
                  onChange={e => update('rewardTitle', e.target.value)}
                  className="input-dreamy"
                  placeholder="e.g. $500 Gift Card"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Reward Description *</label>
                <textarea
                  value={form.rewardDescription}
                  onChange={e => update('rewardDescription', e.target.value)}
                  className="input-dreamy h-20 resize-none"
                  placeholder="Describe the reward in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Your Contact Email (for winners) *</label>
                <input
                  type="email"
                  value={form.hostEmail}
                  onChange={e => update('hostEmail', e.target.value)}
                  className="input-dreamy"
                  placeholder="you@example.com"
                />
                <p className="text-xs text-purple-400 mt-1.5">
                  This will be shown to winners so they know where to email to claim their reward.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900">📋 Contest Rules</h2>
          <textarea
            required
            value={form.rules}
            onChange={e => update('rules', e.target.value)}
            className="input-dreamy h-36 resize-none"
            placeholder="List the rules participants must follow..."
          />
        </div>

        {error && (
          <div className="glass rounded-2xl p-4 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-4 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Launch Contest
            </>
          )}
        </button>
      </form>
    </div>
  );
}
