'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, User, MessageSquare } from 'lucide-react';
import { submitContactMessage } from '@/lib/firestore';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await submitContactMessage(form);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-700 mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-float">💌</div>
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">Contact Us</h1>
        <p className="text-purple-400">Have a question, concern, or report? We'd love to hear from you.</p>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-10 glow-lavender">
        {submitted ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4 animate-float">✨</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Message Sent!</h2>
            <p className="text-purple-500 mb-6">Thanks for reaching out — we'll get back to you soon.</p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="btn-secondary text-sm"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                    className="input-dreamy pl-10" placeholder="Jane Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                    className="input-dreamy pl-10" placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Subject</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text" required value={form.subject} onChange={e => update('subject', e.target.value)}
                  className="input-dreamy pl-10" placeholder="What's this about?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Message</label>
              <textarea
                required value={form.message} onChange={e => update('message', e.target.value)}
                className="input-dreamy h-36 resize-none" placeholder="Tell us more..."
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /> Send Message</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
