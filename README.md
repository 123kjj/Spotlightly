# ✨ Spotlightly

A dreamy celestial contest platform where creators participate in video contests, vote, and celebrate winners.

## Tech Stack
- **Next.js 15** (App Router) + TypeScript
- **Firebase Auth** (Email/Password + Google)
- **Firebase Firestore** (Database)
- **Tailwind CSS** (Dreamy glassmorphism theme)
- **canvas-confetti** (Winners celebration)
- **framer-motion**, **lucide-react**

## Quick Start

### 1. Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google providers
4. Create a **Firestore Database** (start in production mode)
5. Go to Project Settings → Your Apps → Add Web App → copy config

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Fill in your Firebase config values
```

### 3. Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy Firestore Rules
In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

### 5. Set Up Admin
1. Create an account on the platform
2. In Firebase Console → Firestore → `users` collection
3. Find your user document → Add field `isAdmin: true`
4. The Admin Dashboard will appear in your profile dropdown

## Features
- 🎨 Dreamy celestial UI with glassmorphism, stars, sparkles
- 🔐 Email/Password + Google Authentication
- 🏆 Contest creation with rewards, rules, schedules
- 🎬 YouTube video submission with URL validation
- ✅ Entry moderation workflow (pending → approved/rejected)
- ❤️ One-vote-per-user voting system (real-time counts)
- 🥇🥈🥉 Winners page with confetti celebration
- 🚩 Entry reporting system
- 🛡️ Admin dashboard for moderation
- 📱 Mobile-first responsive design

## Pages
- `/` — Homepage with hero + contest grid
- `/browse` — Browse & filter all contests
- `/create` — Create a new contest
- `/contest/[id]` — Contest detail + entries
- `/contest/[id]/submit` — Submit a YouTube entry
- `/contest/[id]/winners` — Winners podium with confetti
- `/auth/login` — Sign in
- `/auth/signup` — Create account
- `/profile` — User profile
- `/admin` — Admin moderation dashboard

## Firestore Indexes Required
Create these in Firebase Console → Firestore → Indexes:

| Collection | Fields |
|-----------|--------|
| entries | contestId ASC, status ASC, voteCount DESC |
| entries | contestId ASC, status ASC, createdAt DESC |
| entries | status ASC, createdAt DESC |
| votes | userId ASC, contestId ASC |

## Project Structure
```
spotlightly/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider + Navbar + StarField
│   ├── globals.css         # Dreamy celestial theme + animations
│   ├── page.tsx            # Homepage
│   ├── browse/page.tsx     # Browse contests
│   ├── create/page.tsx     # Create contest
│   ├── contest/[id]/
│   │   ├── page.tsx        # Contest detail
│   │   ├── submit/page.tsx # Submit entry
│   │   └── winners/page.tsx# Winners celebration
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── profile/page.tsx
│   └── admin/page.tsx
├── components/
│   ├── layout/Navbar.tsx
│   ├── ui/StarField.tsx
│   ├── contest/ContestCard.tsx
│   └── entry/
│       ├── EntryCard.tsx
│       └── ReportModal.tsx
├── lib/
│   ├── firebase.ts         # Firebase initialization
│   ├── firestore.ts        # All DB helpers + YouTube validation
│   └── auth-context.tsx    # Auth React context
├── types/index.ts          # TypeScript types
├── firestore.rules         # Security rules
└── FIRESTORE_SCHEMA.md     # Schema documentation
```
