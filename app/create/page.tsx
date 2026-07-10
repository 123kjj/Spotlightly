'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createContest } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Sparkles, Trophy, Calendar, Gift, FileText, Image, Upload, X } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [bannerMode, setBannerMode] = useState<'emoji' | 'image'>('emoji');

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

  function handleBannerFile(file: File) {
    const accepted = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!accepted.includes(file.type)) { setError('Please upload PNG, JPG, JPEG, or WEBP.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return; }
    setBannerImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setBannerImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setBannerMode('image');
    setError('');
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
      if (!form.rewardTitle.trim()) { setError('Please provide a reward title.'); return; }
      if (!form.rewardDescription.trim()) { setError('Please provide a reward description.'); return; }
      if (!form.hostEmail.trim()) { setError('Please provide a contact email so winners know how to claim their reward.'); return; }
    }

    setLoading(true);
    try {
      let bannerImageUrl: string | undefined;
      if (bannerMode === 'image' && bannerImageFile) {
        const safeName = bannerImageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const storageRef = ref(storage, `banners/create/${user.uid}/${Date.now()}_${safeName}`);
        const task = uploadBytesResumable(storageRef, bannerImageFile);
        bannerImageUrl = await new Promise<string>((resolve, reject) => {
          task.on('state_changed', () => {}, reject,
            async () => resolve(await getDownloadURL(task.snapshot.ref)));
        });
      }

      const id = await createContest({
        title: form.title,
        description: form.description,
        bannerUrl: bannerImageUrl ?? '',
        bannerEmoji: bannerMode === 'emoji' ? form.bannerEmoji : undefined,
        bannerType: bannerMode,
        bannerImageUrl: bannerImageUrl,
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
        <p className="text-gray-700 mb-6">You need to be signed in to create a contest.</p>
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
        <p className="text-gray-700">Set the stage for something magical ✨</p>
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

          {/* Mode toggle */}
          <div className="flex gap-2 p-1 glass rounded-2xl">
            <button type="button" onClick={() => setBannerMode('emoji')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${bannerMode === 'emoji' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow' : 'text-purple-600 hover:bg-purple-50/50'}`}>
              😊 Emoji
            </button>
            <button type="button" onClick={() => { setBannerMode('image'); fileInputRef.current?.click(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${bannerMode === 'image' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow' : 'text-purple-600 hover:bg-purple-50/50'}`}>
              <Upload className="w-4 h-4" /> Upload Banner
            </button>
          </div>

          {/* Emoji picker */}
          {bannerMode === 'emoji' && (
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-3">Choose an Emoji</label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {BANNER_EMOJIS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => update('bannerEmoji', emoji)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                      form.bannerEmoji === emoji
                        ? 'bg-gradient-to-br from-purple-200 to-pink-200 ring-2 ring-purple-400 scale-110'
                        : 'glass hover:bg-purple-50/50 hover:scale-105'
                    }`}>
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
          )}

          {/* Image upload */}
          {bannerMode === 'image' && (
            <div>
              <p className="text-xs text-gray-500 mb-3">
                📐 <strong>Recommended dimensions:</strong> 1200 × 400 px (3:1 ratio) · PNG, JPG, WEBP · Max 10MB
              </p>
              {bannerImagePreview ? (
                <div>
                  <img src={bannerImagePreview} alt="Banner preview"
                    className="w-full h-40 object-cover rounded-2xl border border-purple-100" />
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-sm flex-1 justify-center py-2">Replace</button>
                    <button type="button" onClick={() => { setBannerImageFile(null); setBannerImagePreview(null); setBannerMode('emoji'); }}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-all">
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/20 transition-all">
                  <Upload className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-purple-700 font-medium text-sm">Click to upload banner image</p>
                  <p className="text-xs text-gray-400 mt-1">1200 × 400 px recommended</p>
                </div>
              )}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerFile(f); }} />
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
                  : 'border-transparent glass text-purple-600'
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
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-base flex-shrink-0">✉️</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The email address associated with your Spotlightly account will be shared only with
                  the winner of this contest if needed to ask questions about or claim the advertised
                  prize.
                </p>
              </div>
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
                  className="input-dreamy h-32 resize-y"
                  placeholder={"Describe the reward in detail...\nPress Enter to start a new line."}
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
                <p className="text-xs text-gray-600 mt-1.5">
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
