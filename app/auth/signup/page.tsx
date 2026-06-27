'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Sign up and login are now the same single Google Sign-In flow.
export default function SignUpRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/login');
  }, []);
  return null;
}
