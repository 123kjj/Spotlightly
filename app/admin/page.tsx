'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getAllPendingEntries, approveEntry, rejectEntry, deleteEntry,
  getAllReports, getReviewedEntries, getContest, getUserEmail,
} from '@/lib/firestore';
import { Entry, Report, RejectionReason, REJECTION_REASON_LABELS } from '@/types';
import { Shield, Check, X, Trash2, Flag, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import RejectModal from '@/components/admin/RejectModal';

type Tab = 'pending' | 'reviewed' | 'reports';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<Entry[]>([]);
  const [reviewed, setReviewed] = useState<Entry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Entry | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([getAllPendingEntries(), getReviewedEntries(), getAllReports()]).then(([p, r, rep]) => {
        setPending(p);
        setReviewed(r);
        setReports(rep);
        setLoading(false);
      });
    }
  }, [isAdmin]);

  async function handleApprove(entry: Entry) {
    setApprovingId(entry.id);
    try {
      await approveEntry(entry.id);
      setPending(prev => prev.filter(e => e.id !== entry.id));
      setReviewed(prev => [{ ...entry, status: 'approved', reviewedAt: new Date() }, ...prev]);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleRejectConfirm(reason: RejectionReason, note?: string) {
    if (!rejectTarget) return;
    const entry = rejectTarget;

    await rejectEntry(entry.id, reason, note);

    // Send the notification email (best-effort — don't block the UI on failure)
    try {
      const contest = await getContest(entry.contestId);
      const creatorEmail = contest ? await getUserEmail(contest.createdBy) : null;

      await fetch('/api/send-rejection-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entrantEmail: entry.email,
          entrantName: entry.fullName,
          contestTitle: contest?.title ?? 'Spotlightly Contest',
          entryTitle: entry.entryTitle,
          youtubeUrl: entry.youtubeUrl,
          reason,
          note,
          creatorEmail,
        }),
      });
    } catch (err) {
      console.error('Failed to send rejection email:', err);
    }

    setPending(prev => prev.filter(e => e.id !== entry.id));
    setReviewed(prev => [{ ...entry, status: 'rejected', rejectionReason: reason, rejectionNote: note, reviewedAt: new Date() }, ...prev]);
    setRejectTarget(null);
  }

  async function handleDelete(entryId: string) {
    if (!confirm('Delete this entry permanently?')) return;
    await deleteEntry(entryId);
    setPending(prev => prev.filter(e => e.id !== entryId));
    setReviewed(prev => prev.filter(e => e.id !== entryId));
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold gradient-text">Admin Dashboard</h1>
          <p className="text-purple-600 text-sm">Moderate entries and manage reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { value: 'pending', label: 'Pending Entries', count: pending.length },
          { value: 'reviewed', label: 'Reviewed', count: reviewed.length },
          { value: 'reports', label: 'Reports', count: reports.length },
        ] as { value: Tab; label: string; count: number }[]).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === t.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                : 'glass text-purple-600 hover:bg-purple-50/50'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${tab === t.value ? 'bg-white/20' : 'bg-purple-100 text-purple-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-purple-900">All caught up!</p>
              <p className="text-purple-600 text-sm">No pending submissions.</p>
            </div>
          ) : pending.map(entry => (
            <div key={entry.id} className="glass rounded-3xl p-5">
              <div className="flex items-start gap-4">
                <img
                  src={entry.thumbnailUrl}
                  alt={entry.entryTitle}
                  className="w-32 h-20 rounded-2xl object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${entry.youtubeId}/hqdefault.jpg`; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-purple-900 text-lg">{entry.entryTitle}</h3>
                      <p className="text-sm text-purple-700 mt-0.5">
                        {entry.fullName} · Age {entry.age} · {entry.email}
                      </p>
                      <p className="text-xs text-purple-300 mt-1">
                        Contest: <Link href={`/contest/${entry.contestId}`} className="hover:underline">{entry.contestId}</Link>
                        {' · '}Submitted {format(entry.createdAt, 'MMM d, yyyy')}
                      </p>
                      {entry.description && (
                        <p className="text-sm text-purple-600 mt-2 line-clamp-2">{entry.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={entry.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl glass text-purple-600 hover:text-purple-600 transition-colors" title="Watch video">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleApprove(entry)}
                        disabled={approvingId === entry.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50">
                        <Check className="w-4 h-4" /> {approvingId === entry.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button onClick={() => setRejectTarget(entry)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium">
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => handleDelete(entry.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors text-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reviewed' && (
        <div className="space-y-4">
          {reviewed.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-semibold text-purple-900">Nothing reviewed yet</p>
              <p className="text-purple-600 text-sm">Approved and rejected entries will show up here.</p>
            </div>
          ) : reviewed.map(entry => (
            <div key={entry.id} className="glass rounded-3xl p-5">
              <div className="flex items-start gap-4">
                <img
                  src={entry.thumbnailUrl}
                  alt={entry.entryTitle}
                  className="w-32 h-20 rounded-2xl object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${entry.youtubeId}/hqdefault.jpg`; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {entry.status === 'approved' ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                        {entry.reviewedAt && (
                          <span className="text-xs text-purple-300">{format(entry.reviewedAt, 'MMM d, yyyy h:mm a')}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-purple-900 text-lg">{entry.entryTitle}</h3>
                      <p className="text-sm text-purple-700 mt-0.5">
                        {entry.fullName} · Age {entry.age} · {entry.email}
                      </p>
                      {entry.status === 'rejected' && entry.rejectionReason && (
                        <div className="mt-2 p-3 rounded-xl bg-red-50/70 border border-red-100">
                          <p className="text-xs font-semibold text-red-600">
                            Reason: {REJECTION_REASON_LABELS[entry.rejectionReason]}
                          </p>
                          {entry.rejectionNote && (
                            <p className="text-xs text-red-500 mt-1">"{entry.rejectionNote}"</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={entry.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl glass text-purple-600 hover:text-purple-600 transition-colors" title="Watch video">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDelete(entry.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors text-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">🕊️</div>
              <p className="font-semibold text-purple-900">No reports</p>
              <p className="text-purple-600 text-sm">Everything looks clean!</p>
            </div>
          ) : reports.map(report => (
            <div key={report.id} className="glass rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Flag className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-red-500 capitalize">{report.reason.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Entry: <Link href={`/contest/${report.contestId}#entry-${report.entryId}`} className="hover:underline text-purple-700">
                      View Entry
                    </Link>
                  </p>
                  {report.details && <p className="text-sm text-purple-700 mt-1">"{report.details}"</p>}
                  <p className="text-xs text-purple-300 mt-1">{format(report.createdAt, 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          entry={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </div>
  );
}
