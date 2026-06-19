'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { submitEntry, validateYouTubeUrl } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Video, User, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';

const WAIVER_TEXT = `I confirm that I created this video or have permission to submit it. I understand that approved submissions may be displayed publicly on Spotlightly. I confirm that the content follows contest rules and does not contain harmful, offensive, illegal, or copyrighted material. If I am under 18 years old, I have parent or guardian permission to participate.`;

export default function SubmitEntryPage() {
  const { id: contestId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    age: '',
    email: '',
    entryTitle: '',
    youtubeUrl: '',
    description: '',
  });
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [youtubeStatus, setYoutubeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [youtubeData, setYoutubeData] = useState<{ videoId: string; thumbnail: string; title: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function checkYouTube(url: string) {
    if (!url) { setYoutubeStatus('idle'); return; }
    setYoutubeStatus('checking');
    const result = await validateYouTubeUrl(url);
    if (result.valid && result.videoId && result.thumbnail && result.title) {
      setYoutubeStatus('valid');
      setYoutubeData({ videoId: result.videoId, thumbnail: result.thumbnail, title: result.title });
      if (!form.entryTitle) update('entryTitle', result.title);
    } else {
      setYoutubeStatus('invalid');
      setYoutubeData(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!waiverAccepted) { setError('Please accept the waiver to continue.'); return; }
    if (youtubeStatus !== 'valid' || !youtubeData) { setError('Please enter a valid YouTube URL.'); return; }

    setLoading(true);
    setError('');
    try {
      await submitEntry({
        contestId,
        fullName: form.fullName,
        firstName: form.fullName.split(' ')[0],
        age: parseInt(form.age),
        email: form.email,
        entryTitle: form.entryTitle,
        youtubeUrl: form.youtubeUrl,
        youtubeId: youtubeData.videoId,
        thumbnailUrl: youtubeData.thumbnail,
        videoTitle: youtubeData.title,
        description: form.description || undefined,
        waiverAccepted: true,
        waiverTimestamp: new Date(),
        submittedBy: user.uid,
      });
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4 animate-float">🔒</div>
        <h2 className="text-2xl font-bold text-purple-900 mb-3">Sign in required</h2>
        <p className="text-purple-500 mb-6">You need to be signed in to submit an entry.</p>
        <Link href="/auth/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-4 animate-float">🌟</div>
        <h2 className="text-3xl font-extrabold gradient-text mb-3">Entry Submitted!</h2>
        <p className="text-purple-600 mb-2">Your entry is now <strong>pending review</strong>.</p>
        <p className="text-sm text-purple-400 mb-8">Once approved by an admin, it will appear publicly in the contest.</p>
        <Link href={`/contest/${contestId}`} className="btn-primary">
          View Contest
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 mb-4 shadow-lg animate-float">
          <Video className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold gradient-text mb-2">Submit Your Entry</h1>
        <p className="text-purple-500">Share your YouTube video and enter the competition ✨</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900 flex items-center gap-2">
            <User className="w-4 h-4" /> Your Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-purple-700 mb-2">Full Name *</label>
              <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)}
                className="input-dreamy" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Age *</label>
              <input type="number" required min={1} max={120} value={form.age} onChange={e => update('age', e.target.value)}
                className="input-dreamy" placeholder="25" />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Email *</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                className="input-dreamy" placeholder="jane@example.com" />
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900 flex items-center gap-2">
            <Video className="w-4 h-4" /> Your Video
          </h2>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">YouTube URL *</label>
            <div className="relative">
              <input
                type="url"
                required
                value={form.youtubeUrl}
                onChange={e => { update('youtubeUrl', e.target.value); setYoutubeStatus('idle'); }}
                onBlur={e => checkYouTube(e.target.value)}
                className="input-dreamy pr-10"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {youtubeStatus === 'checking' && <Loader className="w-4 h-4 text-purple-400 animate-spin" />}
                {youtubeStatus === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {youtubeStatus === 'invalid' && <AlertCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
            {youtubeStatus === 'invalid' && (
              <p className="text-xs text-red-500 mt-1">⚠️ Could not validate this URL. Make sure the video is public and the URL is correct.</p>
            )}
          </div>

          {/* Video preview */}
          {youtubeStatus === 'valid' && youtubeData && (
            <div className="flex gap-3 p-3 rounded-2xl bg-green-50/50 border border-green-200">
              <img src={youtubeData.thumbnail} alt="" className="w-24 h-16 rounded-xl object-cover" />
              <div>
                <p className="text-xs text-green-600 font-medium">✓ Video verified</p>
                <p className="text-sm text-purple-800 font-semibold line-clamp-2 mt-1">{youtubeData.title}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Entry Title *</label>
            <input type="text" required value={form.entryTitle} onChange={e => update('entryTitle', e.target.value)}
              className="input-dreamy" placeholder="Give your entry a title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Description <span className="text-purple-300">(optional)</span></label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              className="input-dreamy h-24 resize-none" placeholder="Tell us more about your video..." />
          </div>
        </div>

        {/* Waiver */}
        <div className="glass rounded-3xl p-6">
          <h2 className="font-bold text-purple-900 flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" /> Waiver & Agreement
          </h2>
          <div className="bg-purple-50/50 rounded-2xl p-4 text-sm text-purple-600 leading-relaxed mb-4">
            {WAIVER_TEXT}
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={waiverAccepted}
              onChange={e => setWaiverAccepted(e.target.checked)}
              className="mt-1 accent-purple-600 w-4 h-4"
            />
            <span className="text-sm text-purple-700 group-hover:text-purple-900 transition-colors">
              I have read and agree to the above waiver and terms.
            </span>
          </label>
        </div>

        {error && (
          <div className="glass rounded-2xl p-4 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !waiverAccepted || youtubeStatus !== 'valid'}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <><Sparkles className="w-5 h-5" /> Submit Entry</>
          )}
        </button>
      </form>
    </div>
  );
}
