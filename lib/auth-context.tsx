'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  onboardingComplete: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadUserDoc(firebaseUser: FirebaseUser) {
    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
    const data = snap.data();
    setIsAdmin(data?.isAdmin === true);
    setOnboardingComplete(data?.onboardingComplete === true);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserDoc(firebaseUser);
      } else {
        setIsAdmin(false);
        setOnboardingComplete(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function ensureUserDoc(firebaseUser: FirebaseUser) {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: false,
        onboardingComplete: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function signInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(cred.user);
    await loadUserDoc(cred.user);
  }

  async function logOut() {
    await signOut(auth);
  }

  async function refreshUserDoc() {
    if (user) await loadUserDoc(user);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, onboardingComplete, signInWithGoogle, logOut, refreshUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
