'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Star, User, Sparkles } from 'lucide-react';

export default function SetupPage() {
  const { user, loading, onboardingComplete, refreshUserDoc } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedGuardian, setAgreedGuardian] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isMinor = age !== '' && parseInt(age) < 18 && parseInt(age) > 0;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && onboardingComplete) {
      router.push('/');
    }
  }, [user, loading, onboardingComplete]);

  const requiredChecksOk = agreedTerms && agreedPrivacy && (!isMinor || agreedGuardian);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError('Please enter a valid age.');
      return;
    }
    if (!agreedTerms || !agreedPrivacy) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if (isMinor && !agreedGuardian) {
      setError('Please confirm you have permission from a parent or legal guardian.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        age: ageNum,
        agreedTermsAt: serverTimestamp(),
        agreedPrivacyAt: serverTimestamp(),
        agreedGuardianPermission: isMinor ? true : false,
        onboardingComplete: true,
      });
      await refreshUserDoc();
      router.push('/');
    } catch (err: unknown) {
      console.error('Setup error:', err);
      setError('Something went wrong saving your profile. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 glow-lavender">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg animate-float">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold gradient-text">Welcome to Spotlightly!</h1>
            <p className="text-gray-600 text-sm mt-1">Let's finish setting up your account ✨</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="input-dreamy pl-10"
                  placeholder="Jane"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Age</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={e => setAge(e.target.value)}
                className="input-dreamy"
                placeholder="25"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="mt-1 accent-purple-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="font-semibold text-purple-700 hover:underline">
                    Terms of Service
                  </Link>.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedPrivacy}
                  onChange={e => setAgreedPrivacy(e.target.checked)}
                  className="mt-1 accent-purple-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  I agree to the{' '}
                  <Link href="/privacy" target="_blank" className="font-semibold text-purple-700 hover:underline">
                    Privacy Policy
                  </Link>.
                </span>
              </label>

              {isMinor && (
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <input
                    type="checkbox"
                    checked={agreedGuardian}
                    onChange={e => setAgreedGuardian(e.target.checked)}
                    className="mt-1 accent-purple-600 w-4 h-4"
                  />
                  <span className="text-sm text-amber-800">
                    I confirm that I have permission from my parent or legal guardian to participate on Spotlightly.
                  </span>
                </label>
              )}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !requiredChecksOk}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Star className="w-4 h-4 fill-white" /> Continue to Spotlightly</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
