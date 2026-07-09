'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { createFlyer, getContests } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { Contest } from '@/types';
import { ArrowLeft, Upload, X, Search, Sparkles, CheckCircle } from 'lucide-react';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function CreateFlyerInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContestId = searchParams.get('contestId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 — image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2 — contest
  const [contests, setContests] = useState<Contest[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  // Step 3 — submit
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Load ALL active contests on the platform (not just user's)
  useEffect(() => {
    getContests().then(all => {
      const active = all.filter(c => c.status === 'active');
      setContests(active);
      if (preselectedContestId) {
        const found = active.find(c => c.id === preselectedContestId);
        if (found) { setSelectedContest(found); setSearch(found.title); }
      }
    });
  }, [preselectedContestId]);

  function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setError('Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const filteredContests = contests.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!imageFile) { setError('Please upload a flyer image.'); return; }
    if (!selectedContest) { setError('Please select a contest to connect this flyer to.'); return; }

    setUploading(true);
    setError('');

    try {
      const bucket = storage.app.options.storageBucket;
      console.log('Storage bucket in use:', bucket);
      console.log('User UID:', user.uid);
      console.log('Env var:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

      const storageRef = ref(storage, `flyers/${user.uid}/${Date.now()}_${imageFile.name}`);
      console.log('Upload path:', storageRef.fullPath);
      console.log('Upload bucket:', storageRef.bucket);

      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      const imageUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
        );
      });

      await createFlyer({
        contestId: selectedContest.id,
        creatorUid: user.uid,
        imageUrl,
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Flyer upload error:', err);
      const msg = (err as { message?: string; code?: string })?.message ?? String(err);
      const code = (err as { code?: string })?.code ?? '';
      setError(`Upload failed: ${code} — ${msg}`);
    } finally {
      setUploading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4 animate-float">🔒</div>
        <h2 className="text-2xl font-bold text-purple-900 mb-3">Sign in required</h2>
        <Link href="/auth/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-4 animate-float">🎉</div>
        <h2 className="text-3xl font-extrabold gradient-text mb-3">Flyer Published!</h2>
        <p className="text-gray-600 mb-2">Your flyer is now live on the homepage.</p>
        <p className="text-gray-500 text-sm mb-8">Linked to: <strong className="text-purple-800">{selectedContest?.title}</strong></p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn-primary">View Homepage</Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setImageFile(null);
              setImagePreview(null);
              setSelectedContest(null);
              setSearch('');
              setUploadProgress(0);
            }}
            className="btn-secondary"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-float">📄</div>
        <h1 className="text-3xl font-extrabold gradient-text mb-2">Create a Contest Flyer</h1>
        <p className="text-gray-600">Upload a flyer and connect it to an active contest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Step 1: Upload Flyer ── */}
        <div className="glass rounded-3xl p-6">
          <h2 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" /> 1. Upload Flyer
          </h2>

          {imagePreview ? (
            <div>
              <img
                src={imagePreview}
                alt="Flyer preview"
                className="w-full max-h-80 object-contain bg-gray-50/50 rounded-2xl border border-purple-100"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-sm flex-1 justify-center py-2"
                >
                  Replace Image
                </button>
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/20'
              }`}
            >
              <div className="text-5xl mb-3">🖼️</div>
              <p className="text-purple-700 font-medium mb-1">Drag & drop your flyer here</p>
              <p className="text-gray-500 text-sm mb-4">or click to browse</p>
              <span className="btn-primary text-sm py-2 px-6 pointer-events-none">Upload Flyer</span>
              <p className="text-xs text-gray-400 mt-3">PNG, JPG, JPEG, WEBP · Max 10MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {/* ── Step 2: Connect to Contest ── */}
        <div className="glass rounded-3xl p-6">
          <h2 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" /> 2. Connect to Contest
          </h2>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedContest(null); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className="input-dreamy pl-10"
              placeholder="Search active contests..."
            />

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-2xl shadow-xl z-20 max-h-52 overflow-y-auto border border-purple-100">
                {filteredContests.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    {contests.length === 0 ? 'No active contests right now.' : 'No contests match your search.'}
                  </div>
                ) : filteredContests.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => { setSelectedContest(c); setSearch(c.title); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50/50 transition-colors flex items-center gap-3 border-b border-purple-50 last:border-0"
                  >
                    <span className="text-xl">{c.bannerEmoji ?? '🏆'}</span>
                    <span className="font-medium text-purple-900 truncate">{c.title}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">Live</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedContest && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-green-50/60 border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">{selectedContest.title}</span>
              <button
                type="button"
                onClick={() => { setSelectedContest(null); setSearch(''); }}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Error / Progress / Submit ── */}
        {error && (
          <div className="glass rounded-2xl p-4 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {uploading && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-700 font-medium">Uploading flyer...</span>
              <span className="text-sm text-purple-600">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </span>
          ) : (
            <><Sparkles className="w-5 h-5" /> Submit Flyer</>
          )}
        </button>

      </form>
    </div>
  );
}

export default function CreateFlyerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    }>
      <CreateFlyerInner />
    </Suspense>
  );
}
