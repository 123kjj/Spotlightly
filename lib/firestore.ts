import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy,
  increment, serverTimestamp, Timestamp, setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Contest, Entry, Vote, Report, RejectionReason, Flyer } from '@/types';

// ── Contests ──────────────────────────────────────────────────────────────────

export async function createContest(data: Omit<Contest, 'id' | 'createdAt' | 'status'>) {
  // Firestore rejects `undefined` field values outright, so strip any out first
  // (e.g. optional reward fields left blank when rewardAvailable is false).
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );

  const ref = await addDoc(collection(db, 'contests'), {
    ...cleanData,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getContests(): Promise<Contest[]> {
  const snap = await getDocs(query(collection(db, 'contests'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => firestoreContestToContest(d.id, d.data()));
}

export async function deleteContest(id: string) {
  await deleteDoc(doc(db, 'contests', id));
}

export async function updateContestDescription(id: string, description: string) {
  await updateDoc(doc(db, 'contests', id), { description });
}

export async function updateContestRules(id: string, rules: string) {
  await updateDoc(doc(db, 'contests', id), { rules });
}

export async function updateContestDates(id: string, startDate: Date, endDate: Date) {
  await updateDoc(doc(db, 'contests', id), {
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
  });
}

export async function getUserEmail(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data().email as string) ?? null : null;
}

export async function getContest(id: string): Promise<Contest | null> {
  const snap = await getDoc(doc(db, 'contests', id));
  if (!snap.exists()) return null;
  return firestoreContestToContest(snap.id, snap.data());
}

function firestoreContestToContest(id: string, data: Record<string, unknown>): Contest {
  const now = new Date();
  const startDate = (data.startDate as Timestamp).toDate();
  const endDate = (data.endDate as Timestamp).toDate();
  let status: Contest['status'] = 'upcoming';
  if (now >= startDate && now <= endDate) status = 'active';
  if (now > endDate) status = 'ended';
  return {
    id,
    title: data.title as string,
    description: data.description as string,
    bannerUrl: data.bannerUrl as string,
    bannerEmoji: data.bannerEmoji as string | undefined,
    startDate,
    endDate,
    rules: data.rules as string,
    rewardAvailable: data.rewardAvailable as boolean,
    rewardTitle: data.rewardTitle as string | undefined,
    rewardDescription: data.rewardDescription as string | undefined,
    hostEmail: data.hostEmail as string | undefined,
    createdBy: data.createdBy as string,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    status,
  };
}

// ── Entries ───────────────────────────────────────────────────────────────────

export async function submitEntry(data: Omit<Entry, 'id' | 'createdAt' | 'voteCount' | 'status'>) {
  // Firestore rejects `undefined` field values outright, so strip any out first
  // (e.g. an optional `description` left blank by the entrant).
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );

  const ref = await addDoc(collection(db, 'entries'), {
    ...cleanData,
    waiverTimestamp: Timestamp.fromDate(data.waiverTimestamp),
    voteCount: 0,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getApprovedEntries(contestId: string): Promise<Entry[]> {
  const snap = await getDocs(
    query(collection(db, 'entries'),
      where('contestId', '==', contestId),
      where('status', '==', 'approved'),
      orderBy('voteCount', 'desc'))
  );
  return snap.docs.map(d => firestoreEntryToEntry(d.id, d.data()));
}

export async function getAllEntries(contestId: string): Promise<Entry[]> {
  const snap = await getDocs(
    query(collection(db, 'entries'), where('contestId', '==', contestId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => firestoreEntryToEntry(d.id, d.data()));
}

export async function approveEntry(entryId: string) {
  await updateDoc(doc(db, 'entries', entryId), {
    status: 'approved',
    reviewedAt: serverTimestamp(),
  });
}

export async function rejectEntry(
  entryId: string,
  reason: RejectionReason,
  note?: string
) {
  await updateDoc(doc(db, 'entries', entryId), {
    status: 'rejected',
    rejectionReason: reason,
    rejectionNote: note ?? null,
    reviewedAt: serverTimestamp(),
  });
}

export async function getReviewedEntries(): Promise<Entry[]> {
  const [approvedSnap, rejectedSnap] = await Promise.all([
    getDocs(query(collection(db, 'entries'), where('status', '==', 'approved'))),
    getDocs(query(collection(db, 'entries'), where('status', '==', 'rejected'))),
  ]);
  const all = [...approvedSnap.docs, ...rejectedSnap.docs].map(d => firestoreEntryToEntry(d.id, d.data()));
  return all.sort((a, b) => (b.reviewedAt?.getTime() ?? 0) - (a.reviewedAt?.getTime() ?? 0));
}

export async function deleteEntry(entryId: string) {
  await deleteDoc(doc(db, 'entries', entryId));
}

function firestoreEntryToEntry(id: string, data: Record<string, unknown>): Entry {
  return {
    id,
    contestId: data.contestId as string,
    fullName: data.fullName as string,
    firstName: data.firstName as string,
    age: data.age as number,
    email: data.email as string,
    entryTitle: data.entryTitle as string,
    youtubeUrl: data.youtubeUrl as string,
    youtubeId: data.youtubeId as string,
    thumbnailUrl: data.thumbnailUrl as string,
    videoTitle: data.videoTitle as string,
    description: data.description as string | undefined,
    voteCount: data.voteCount as number,
    status: data.status as Entry['status'],
    rejectionReason: data.rejectionReason as RejectionReason | undefined,
    rejectionNote: (data.rejectionNote as string | undefined) ?? undefined,
    reviewedAt: data.reviewedAt ? (data.reviewedAt as Timestamp).toDate() : undefined,
    waiverAccepted: data.waiverAccepted as boolean,
    waiverTimestamp: (data.waiverTimestamp as Timestamp)?.toDate() ?? new Date(),
    submittedBy: data.submittedBy as string,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

// ── Votes ─────────────────────────────────────────────────────────────────────

export async function voteForEntry(entryId: string, contestId: string, userId: string): Promise<boolean> {
  const voteId = `${userId}_${entryId}`;
  const voteRef = doc(db, 'votes', voteId);
  const existing = await getDoc(voteRef);
  if (existing.exists()) return false; // already voted

  await setDoc(voteRef, {
    entryId, contestId, userId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'entries', entryId), { voteCount: increment(1) });
  return true;
}

export async function removeVote(entryId: string, userId: string) {
  const voteId = `${userId}_${entryId}`;
  await deleteDoc(doc(db, 'votes', voteId));
  await updateDoc(doc(db, 'entries', entryId), { voteCount: increment(-1) });
}

export async function getUserVotes(userId: string, contestId: string): Promise<string[]> {
  const snap = await getDocs(
    query(collection(db, 'votes'),
      where('userId', '==', userId),
      where('contestId', '==', contestId))
  );
  return snap.docs.map(d => (d.data() as Vote).entryId);
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function reportEntry(data: Omit<Report, 'id' | 'createdAt' | 'status'>) {
  await addDoc(collection(db, 'reports'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function getAllReports(): Promise<Report[]> {
  const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      entryId: data.entryId,
      contestId: data.contestId,
      reportedBy: data.reportedBy,
      reason: data.reason,
      details: data.details,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      status: data.status,
    } as Report;
  });
}

export async function getAllPendingEntries(): Promise<Entry[]> {
  const snap = await getDocs(
    query(collection(db, 'entries'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => firestoreEntryToEntry(d.id, d.data()));
}

// ── Flyers ────────────────────────────────────────────────────────────────────

export async function createFlyer(data: Omit<Flyer, 'id' | 'createdAt'>) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, 'flyers'), {
    ...cleanData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getActiveFlyers(): Promise<Flyer[]> {
  const snap = await getDocs(
    query(collection(db, 'flyers'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      contestId: data.contestId,
      creatorUid: data.creatorUid,
      imageUrl: data.imageUrl,
      flyerTitle: data.flyerTitle,
      description: data.description,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    } as Flyer;
  });
}

export async function getUserContests(uid: string): Promise<Contest[]> {
  const snap = await getDocs(
    query(collection(db, 'contests'), where('createdBy', '==', uid), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => firestoreContestToContest(d.id, d.data()));
}

export async function deleteFlyer(flyerId: string) {
  await deleteDoc(doc(db, 'flyers', flyerId));
}

// ── Contact Messages ────────────────────────────────────────────────────────

export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await addDoc(collection(db, 'contactMessages'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'new',
  });
}

// ── Video URL Validation (YouTube, TikTok, Instagram) ──────────────────────

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram';

export interface VideoData {
  valid: boolean;
  platform?: VideoPlatform;
  videoId?: string;
  thumbnail?: string;
  title?: string;
}

export function detectPlatform(url: string): VideoPlatform | null {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/instagram\.com/.test(url)) return 'instagram';
  return null;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export async function validateVideoUrl(url: string): Promise<VideoData> {
  const platform = detectPlatform(url);
  if (!platform) return { valid: false };

  try {
    if (platform === 'youtube') {
      const videoId = extractYouTubeId(url);
      if (!videoId) return { valid: false };
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!res.ok) return { valid: false };
      const data = await res.json();
      return {
        valid: true,
        platform,
        videoId,
        thumbnail: getYouTubeThumbnail(videoId),
        title: data.title,
      };
    }

    if (platform === 'tiktok') {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      if (!res.ok) return { valid: false };
      const data = await res.json();
      return {
        valid: true,
        platform,
        videoId: url, // TikTok doesn't expose a simple numeric ID publicly
        thumbnail: data.thumbnail_url ?? `https://placehold.co/480x270/c4b5fd/7c3aed?text=TikTok`,
        title: data.title ?? 'TikTok Video',
      };
    }

    if (platform === 'instagram') {
      const igPattern = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/;
      const match = url.match(igPattern);
      if (!match) return { valid: false };
      return {
        valid: true,
        platform,
        videoId: match[2],
        thumbnail: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
            <defs>
              <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#f09433"/>
                <stop offset="25%" style="stop-color:#e6683c"/>
                <stop offset="50%" style="stop-color:#dc2743"/>
                <stop offset="75%" style="stop-color:#cc2366"/>
                <stop offset="100%" style="stop-color:#bc1888"/>
              </linearGradient>
            </defs>
            <rect width="480" height="270" fill="url(#ig)" rx="12"/>
            <text x="240" y="155" font-size="80" text-anchor="middle" dominant-baseline="middle">📸</text>
            <text x="240" y="220" font-size="18" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui">Instagram Video</text>
          </svg>
        `),
        title: 'Instagram Video',
      };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Keep old name as alias so existing code doesn't break
export const validateYouTubeUrl = validateVideoUrl;
