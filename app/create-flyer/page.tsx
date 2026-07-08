'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { createFlyer, getUserContests } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { Contest } from '@/types';
import { ArrowLeft, Upload, X, Search, ImageIcon, Sparkles, CheckCircle } from 'lucide-react';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function CreateFlyerInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContestId = searchParams.get('contestId');

  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [flyerTitle, setFlyerTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getUserContests(user.uid).then(c => {
        setContests(c);
        if (preselectedContestId) {
          const found = c.find(ct => ct.id === preselectedContestId);
          if (found) {
            setSelectedContest(found);
            setSearch(found.title);
          }
        }
      });
    }
  }, [user, preselectedContestId]);

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
    if (!user || !imageFile || !selectedContest) return;
    setUploading(true);
    setError('');

    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `flyers/${user.uid}/${Date.now()}_${imageFile.name}`);
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
        flyerTitle: flyerTitle.trim() || undefined,
        description: description.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Flyer upload error:', err);
      setError('Upload failed. Please try again.');
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
        <p className="text-gray-600 mb-8">Your flyer is now live on the homepage.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">View Homepage</Link>
          <button onClick={() => { setSubmitted(false); setImageFile(null); setImagePreview(null); setFlyerTitle(''); setDescription(''); setSelectedContest(null); setSearch(''); }} className="btn-secondary">Create Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 mb-4 shadow-lg animate-float">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold gradient-text mb-2">Create a Contest Flyer</h1>
        <p className="text-gray-600">Create a promotional flyer for one of your contests.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Flyer */}
        <div className="glass rounded-3xl p-6">
          <h2 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Flyer
          </h2>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img src={imagePreview} alt="Flyer preview" className="w-full max-h-80 object-contain bg-gray-50 rounded-2xl" />
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-sm flex-1 justify-center py-2">
                  Replace Image
                </button>
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all">
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
                isDragging ? 'border-purple-500 bg-purple-50/50' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30'
              }`}
            >
              <div className="text-5xl mb-4">🖼️</div>
              <p className="text-purple-700 font-medium mb-1">Drag & drop your flyer here</p>
              <p className="text-gray-500 text-sm mb-4">or click to browse</p>
              <span className="btn-primary text-sm py-2 px-6">Upload Flyer</span>
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

        {/* Choose Contest */}
        <div className="glass rounded-3xl p-6">
          <h2 className="font-bold text-purple-900 mb-4">🏆 Choose Contest</h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedContest(null); }}
              onFocus={() => setShowDropdown(true)}
              className="input-dreamy pl-10"
              placeholder="Search your contests..."
            />
            {showDropdown && search && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-2xl shadow-xl z-20 max-h-52 overflow-y-auto border border-purple-100">
                {filteredContests.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">No contests found</div>
                ) : filteredContests.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedContest(c); setSearch(c.title); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50/50 transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg">{c.bannerEmoji ?? '🏆'}</span>
                    <span>
                      <span className="font-medium text-purple-900">{c.title}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : c.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.status}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedContest && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-green-50/60 border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">{selectedContest.title}</span>
            </div>
          )}
          {contests.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">You haven't created any contests yet. <Link href="/create" className="text-purple-600 hover:underline">Create one first.</Link></p>
          )}
        </div>

        {/* Optional Info */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-purple-900">✨ Optional Information</h2>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Flyer Title <span className="text-gray-400">(optional)</span></label>
            <input type="text" value={flyerTitle} onChange={e => setFlyerTitle(e.target.value)}
              className="input-dreamy" placeholder="e.g. Spring Singing Contest 2025" />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Short Description <span className="text-gray-400">(optional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="input-dreamy h-20 resize-none" placeholder="A short tagline for your flyer..." />
          </div>
        </div>

        {error && <div className="glass rounded-2xl p-4 border border-red-200 text-red-600 text-sm text-center">{error}</div>}

        {uploading && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-700 font-medium">Uploading...</span>
              <span className="text-sm text-purple-600">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !imageFile || !selectedContest}
          className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </span>
          ) : (
            <><Sparkles className="w-5 h-5" /> Publish Flyer</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function CreateFlyerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>}>
      <CreateFlyerInner />
    </Suspense>
  );
}
