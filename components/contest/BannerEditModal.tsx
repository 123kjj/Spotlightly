'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Smile } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { updateContestBanner } from '@/lib/firestore';
import { Contest } from '@/types';
import { useAuth } from '@/lib/auth-context';

const PASTEL_COLORS = [
  '#fce7f3', '#ede9fe', '#dbeafe', '#dcfce7', '#fef9c3',
  '#ffedd5', '#f0fdf4', '#f0f9ff', '#fdf4ff', '#fff7ed',
];

const GRADIENTS = [
  'linear-gradient(135deg, #fce7f3, #ede9fe)',
  'linear-gradient(135deg, #ede9fe, #dbeafe)',
  'linear-gradient(135deg, #fce7f3, #fed7aa)',
  'linear-gradient(135deg, #dbeafe, #dcfce7)',
  'linear-gradient(135deg, #fef9c3, #fce7f3)',
  'linear-gradient(135deg, #c4b5fd, #fbcfe8)',
  'linear-gradient(135deg, #bae6fd, #c4b5fd)',
  'linear-gradient(135deg, #fbcfe8, #fed7aa)',
];

const EMOJI_OPTIONS = [
  '🏆','🎬','🎤','🎨','🎭','🎵','🎸','⭐','✨','🌟','🔥',
  '💃','🕺','🎮','📸','🎙️','🥇','🌈','🚀','💎','🎉','🦄',
  '🐱','🐶','🎯','🎪','🎠','🌸','🦋','🌺','🎆','🎇','🪄',
  '🎭','🎨','🖌️','🎼','🎹','🥁','🎺','🎻','🪕','🎲','🃏',
];

interface Props {
  contest: Contest;
  onClose: () => void;
  onSaved: (updated: Partial<Contest>) => void;
}

export default function BannerEditModal({ contest, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'image' | 'emoji'>(
    contest.bannerType === 'image' ? 'image' : 'emoji'
  );

  // Image tab state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    contest.bannerType === 'image' ? (contest.bannerImageUrl ?? null) : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Emoji tab state
  const [emoji, setEmoji] = useState(contest.bannerEmoji ?? '🏆');
  const [bgColor, setBgColor] = useState(contest.bannerBackgroundColor ?? '#ede9fe');
  const [gradient, setGradient] = useState(contest.bannerGradient ?? '');
  const [bannerText, setBannerText] = useState(contest.bannerText ?? '');
  const [useGradient, setUseGradient] = useState(!!contest.bannerGradient);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) { setError('Please upload PNG, JPG, JPEG, or WEBP.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return; }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  // Emoji banner live preview background
  const previewBg = useGradient && gradient ? gradient : bgColor;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      if (tab === 'image') {
        let imageUrl = contest.bannerImageUrl ?? '';
        if (imageFile) {
          const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
          const storageRef = ref(storage, `banners/${contest.id}/${Date.now()}_${safeName}`);
          const task = uploadBytesResumable(storageRef, imageFile);
          imageUrl = await new Promise<string>((resolve, reject) => {
            task.on('state_changed',
              s => setUploadProgress(Math.round(s.bytesTransferred / s.totalBytes * 100)),
              reject,
              async () => resolve(await getDownloadURL(task.snapshot.ref))
            );
          });
        }
        if (!imageUrl) { setError('Please upload an image.'); setSaving(false); return; }
        await updateContestBanner(contest.id, {
          bannerType: 'image',
          bannerImageUrl: imageUrl,
        });
        onSaved({ bannerType: 'image', bannerImageUrl: imageUrl });
      } else {
        await updateContestBanner(contest.id, {
          bannerType: 'emoji',
          bannerEmoji: emoji,
          bannerBackgroundColor: useGradient ? undefined : bgColor,
          bannerGradient: useGradient ? gradient : undefined,
          bannerText: bannerText.trim() || undefined,
        });
        onSaved({
          bannerType: 'emoji',
          bannerEmoji: emoji,
          bannerBackgroundColor: useGradient ? undefined : bgColor,
          bannerGradient: useGradient ? gradient : undefined,
          bannerText: bannerText.trim() || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      console.error('Banner save error:', err);
      setError('Failed to save banner. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto glow-lavender">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100/50">
          <h2 className="font-bold text-purple-900 text-lg">Edit Banner</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tab switcher */}
          <div className="flex gap-2 p-1 glass rounded-2xl">
            <button
              onClick={() => setTab('image')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === 'image' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow' : 'text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Upload Image
            </button>
            <button
              onClick={() => setTab('emoji')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === 'emoji' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow' : 'text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              <Smile className="w-4 h-4" /> Emoji Banner
            </button>
          </div>

          {/* ── IMAGE TAB ── */}
          {tab === 'image' && (
            <div className="space-y-4">
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-sm flex-1 justify-center py-2">Replace</button>
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-sm text-red-500 border border-red-200 hover:bg-red-50">
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    📐 <strong>Recommended:</strong> 1200 × 400 px (3:1 ratio) · PNG, JPG, WEBP · Max 10MB
                  </p>
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-purple-500 bg-purple-50/50' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/20'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-700 font-medium mb-1">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-400">1200 × 400 px recommended</p>
                  </div>
                </>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPTED.join(',')} className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          )}

          {/* ── EMOJI TAB ── */}
          {tab === 'emoji' && (
            <div className="space-y-4">
              {/* Live preview */}
              <div className="relative h-36 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: previewBg }}>
                <span className="text-7xl drop-shadow-md">{emoji}</span>
                {bannerText && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/30 py-1.5 text-center">
                    <p className="text-white text-sm font-semibold">{bannerText}</p>
                  </div>
                )}
                <p className="absolute top-2 right-2 text-xs text-white/60 bg-black/20 px-2 py-0.5 rounded-full">Preview</p>
              </div>

              {/* Emoji picker */}
              <div>
                <p className="text-sm font-medium text-purple-700 mb-2">Choose Emoji</p>
                <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} type="button" onClick={() => setEmoji(e)}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${emoji === e ? 'bg-purple-100 ring-2 ring-purple-400 scale-110' : 'hover:bg-purple-50'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-purple-700">Background</p>
                  <label className="flex items-center gap-2 text-xs text-purple-600 cursor-pointer">
                    <input type="checkbox" checked={useGradient} onChange={e => setUseGradient(e.target.checked)} className="accent-purple-600" />
                    Use gradient
                  </label>
                </div>

                {useGradient ? (
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g} type="button" onClick={() => setGradient(g)}
                        className={`h-10 rounded-xl transition-all ${gradient === g ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'}`}
                        style={{ background: g }} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {PASTEL_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setBgColor(c)}
                        className={`w-8 h-8 rounded-full transition-all ${bgColor === c ? 'ring-2 ring-purple-500 scale-110' : 'hover:scale-110'}`}
                        style={{ background: c }} />
                    ))}
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 border-purple-200 p-0.5" title="Custom color" />
                  </div>
                )}
              </div>

              {/* Banner text */}
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Banner Text <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={bannerText} onChange={e => setBannerText(e.target.value)}
                  className="input-dreamy" placeholder="e.g. Enter Now! · Ends July 31"
                  maxLength={60} />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
