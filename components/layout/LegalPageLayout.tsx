'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
}

export default function LegalPageLayout({ title, subtitle, icon, children }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-700 mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="text-center mb-10">
        {icon && <div className="text-5xl mb-4 animate-float">{icon}</div>}
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">{title}</h1>
        {subtitle && <p className="text-purple-400 text-sm">{subtitle}</p>}
      </div>

      <div className="glass rounded-3xl p-6 sm:p-10 glow-lavender">
        {children}
      </div>
    </div>
  );
}
