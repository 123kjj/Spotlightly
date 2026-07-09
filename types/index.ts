export type RejectionReason =
  | 'sexual_content'
  | 'violent_repulsive'
  | 'hateful_abusive'
  | 'harassment_bullying'
  | 'harmful_dangerous_acts'
  | 'suicide_self_harm_eating_disorder'
  | 'misinformation'
  | 'child_abuse'
  | 'promotes_terrorism'
  | 'spam_misleading'
  | 'legal_issues'
  | 'other';

export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  sexual_content: 'Sexual content',
  violent_repulsive: 'Violent or repulsive content',
  hateful_abusive: 'Hateful or abusive content',
  harassment_bullying: 'Harassment or bullying',
  harmful_dangerous_acts: 'Harmful or dangerous acts',
  suicide_self_harm_eating_disorder: 'Suicide, self-harm, or eating disorder content',
  misinformation: 'Misinformation',
  child_abuse: 'Child abuse',
  promotes_terrorism: 'Promotes terrorism',
  spam_misleading: 'Spam or misleading',
  legal_issues: 'Legal issues',
  other: 'Other',
};

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  firstName?: string;
  age?: number;
  onboardingComplete?: boolean;
  agreedGuardianPermission?: boolean;
  createdAt: Date;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  bannerEmoji?: string;
  bannerType?: 'image' | 'emoji';
  bannerImageUrl?: string;
  bannerBackgroundColor?: string;
  bannerGradient?: string;
  bannerText?: string;
  startDate: Date;
  endDate: Date;
  rules: string;
  rewardAvailable: boolean;
  rewardTitle?: string;
  rewardDescription?: string;
  hostEmail?: string;
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'ended' | 'upcoming';
}

export interface Entry {
  id: string;
  contestId: string;
  fullName: string;
  firstName: string;
  age: number;
  email: string;
  entryTitle: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  videoTitle: string;
  description?: string;
  voteCount: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: RejectionReason;
  rejectionNote?: string;
  reviewedAt?: Date;
  waiverAccepted: boolean;
  waiverTimestamp: Date;
  submittedBy: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  entryId: string;
  contestId: string;
  userId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  entryId: string;
  contestId: string;
  reportedBy: string;
  reason: 'inappropriate' | 'spam' | 'copyright' | 'harassment' | 'other';
  details?: string;
  createdAt: Date;
  status: 'pending' | 'reviewed';
}
