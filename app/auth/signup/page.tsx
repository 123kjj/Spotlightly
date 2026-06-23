'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Star, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await signUp(form.email, form.password, form.name);
      router.push('/');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') setError('This email is already registered.');
      else setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try { await signInWithGoogle(); router.push('/'); }
    catch { setError('Google sign in failed.'); }
    finally { setGoogleLoading(false); }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 glow-lavender">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 mb-4 shadow-lg animate-float">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold gradient-text">Join Spotlightly</h1>
            <p className="text-purple-600 text-sm mt-1">Create your account and start shining ✨</p>
          </div>

          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 glass border-2 border-purple-100 rounded-2xl py-3 mb-4 hover:border-purple-300 transition-all font-medium text-purple-700">
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-purple-100" />
            <span className="text-xs text-purple-300">or</span>
            <div className="flex-1 h-px bg-purple-100" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                  className="input-dreamy pl-10" placeholder="Jane Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                  className="input-dreamy pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => update('password', e.target.value)}
                  className="input-dreamy pl-10 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                <input type={showPw ? 'text' : 'password'} required value={form.confirm} onChange={e => update('confirm', e.target.value)}
                  className="input-dreamy pl-10" placeholder="Repeat password" />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <><Star className="w-4 h-4 fill-white" /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-purple-600 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
