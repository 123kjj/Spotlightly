'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Pages that don't require onboarding to be complete first.
const EXEMPT_PATHS = ['/setup', '/auth/login', '/auth/signup', '/terms', '/privacy', '/guidelines', '/about', '/contact'];

export default function OnboardingGuard() {
  const { user, loading, onboardingComplete } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (onboardingComplete) return;
    if (EXEMPT_PATHS.some(p => pathname.startsWith(p))) return;

    router.push('/setup');
  }, [user, loading, onboardingComplete, pathname]);

  return null;
}
