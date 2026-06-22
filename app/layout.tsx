import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StarField from '@/components/ui/StarField';
import CookieBanner from '@/components/layout/CookieBanner';

export const metadata: Metadata = {
  title: 'Spotlightly – Where Creativity Takes Center Stage',
  description: 'A platform where creators participate in contests, share their talents, and compete for the top spot.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <AuthProvider>
          <StarField />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-20">
              {children}
            </main>
            <Footer />
          </div>
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
