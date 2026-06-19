'use client';

import { useState } from 'react';
import { Entry } from '@/types';
import { X, Flag } from 'lucide-react';
import { reportEntry } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';

const REASONS = [
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
] as const;

interface Props {
  entry: Entry;
  contestId: string;
  onClose: () => void;
}

export default function ReportModal({ entry, contestId, onClose }: Props) {
  const { user } = useAuth();
  const [reason, setReason] = useState<typeof REASONS[number]['value'] | ''>('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!user || !reason) return;
    setLoading(true);
    await reportEntry({
      entryId: entry.id,
      contestId,
      reportedBy: user.uid,
      reason: reason as 'inappropriate' | 'spam' | 'copyright' | 'harassment' | 'other',
      details: details || undefined,
    });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl p-6 max-w-md w-full glow-lavender">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-purple-900">Report Entry</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-purple-900">Report Submitted</p>
            <p className="text-sm text-purple-500 mt-1">Our team will review this entry.</p>
            <button onClick={onClose} className="btn-primary mt-4 text-sm">Close</button>
          </div>
        ) : (
          <>
            {!user && (
              <p className="text-sm text-red-500 mb-4">Please sign in to report an entry.</p>
            )}
            <p className="text-sm text-purple-600 mb-4">
              Report "<strong>{entry.entryTitle}</strong>" for:
            </p>
            <div className="space-y-2 mb-4">
              {REASONS.map(r => (
                <label key={r.value} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-purple-50/50 transition-colors">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-purple-600"
                  />
                  <span className="text-sm text-purple-800">{r.label}</span>
                </label>
              ))}
            </div>
            {reason === 'other' && (
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Please describe the issue..."
                className="input-dreamy h-24 resize-none mb-4"
              />
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!reason || !user || loading}
                className="btn-primary text-sm flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
