'use client';

import { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { Entry, RejectionReason, REJECTION_REASON_LABELS } from '@/types';

const REASON_ORDER: RejectionReason[] = [
  'sexual_content',
  'violent_repulsive',
  'hateful_abusive',
  'harassment_bullying',
  'harmful_dangerous_acts',
  'suicide_self_harm_eating_disorder',
  'misinformation',
  'child_abuse',
  'promotes_terrorism',
  'spam_misleading',
  'legal_issues',
  'other',
];

interface Props {
  entry: Entry;
  onClose: () => void;
  onConfirm: (reason: RejectionReason, note?: string) => Promise<void>;
}

export default function RejectModal({ entry, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<RejectionReason | ''>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!reason) return;
    setLoading(true);
    try {
      await onConfirm(reason, note || undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl p-6 max-w-lg w-full glow-lavender max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-purple-900">Reject Entry</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-purple-600 mb-4">
          Rejecting "<strong>{entry.entryTitle}</strong>" by {entry.fullName}. Select why this entry was declined:
        </p>

        <div className="space-y-1.5 mb-4">
          {REASON_ORDER.map(r => (
            <label key={r} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-red-50/50 transition-colors">
              <input
                type="radio"
                name="rejection-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-red-500"
              />
              <span className="text-sm text-purple-800">{REJECTION_REASON_LABELS[r]}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Additional notes <span className="text-purple-300">(optional, included in the email)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="input-dreamy h-20 resize-none"
            placeholder="Add any specific details for the entrant..."
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!reason || loading}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Rejecting & emailing...
              </span>
            ) : (
              'Reject & Send Email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
