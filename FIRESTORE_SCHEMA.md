# Spotlightly Firestore Schema

## Collections

### `users/{uid}`
```
{
  uid: string,
  email: string,
  displayName: string | null,
  photoURL: string | null,
  isAdmin: boolean,          // Manually set in Firebase Console for admins
  createdAt: Timestamp
}
```

### `contests/{contestId}`
```
{
  title: string,
  description: string,
  bannerUrl: string,
  startDate: Timestamp,
  endDate: Timestamp,
  rules: string,
  rewardAvailable: boolean,
  rewardTitle?: string,
  rewardDescription?: string,
  createdBy: string (uid),
  createdAt: Timestamp
}
```

### `entries/{entryId}`
```
{
  contestId: string,
  fullName: string,
  firstName: string,
  age: number,
  email: string,
  entryTitle: string,
  youtubeUrl: string,
  youtubeId: string,
  thumbnailUrl: string,
  videoTitle: string,
  description?: string,
  voteCount: number,
  status: 'pending' | 'approved' | 'rejected',
  waiverAccepted: boolean,
  waiverTimestamp: Timestamp,
  submittedBy: string (uid),
  createdAt: Timestamp
}
```

### `votes/{userId}_{entryId}`
```
{
  entryId: string,
  contestId: string,
  userId: string,
  createdAt: Timestamp
}
```
Note: Document ID is `{userId}_{entryId}` to enforce one vote per user per entry.

### `reports/{reportId}`
```
{
  entryId: string,
  contestId: string,
  reportedBy: string (uid),
  reason: 'inappropriate' | 'spam' | 'copyright' | 'harassment' | 'other',
  details?: string,
  status: 'pending' | 'reviewed',
  createdAt: Timestamp
}
```

## Firestore Indexes Required

Create these composite indexes in Firebase Console:

1. `entries` collection:
   - contestId ASC, status ASC, voteCount DESC
   - contestId ASC, status ASC, createdAt DESC
   - status ASC, createdAt DESC

2. `votes` collection:
   - userId ASC, contestId ASC

3. `reports` collection:
   - createdAt DESC

## Making a User an Admin

In Firebase Console → Firestore → users collection → find user document → set `isAdmin: true`
