import LegalPageLayout from '@/components/layout/LegalPageLayout';
import { LegalSection, LegalList } from '@/components/layout/LegalSection';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <LegalPageLayout title="Privacy Policy" subtitle={`Last Updated: ${lastUpdated}`} icon="🔒">
      <p className="text-gray-700 mb-8 leading-relaxed">
        This Privacy Policy explains what information Spotlightly collects, how we use it, and how we
        protect it. It works together with our{' '}
        <Link href="/terms" className="font-semibold text-purple-700 hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/guidelines" className="font-semibold text-purple-700 hover:underline">Community Guidelines</Link>.
      </p>

      <LegalSection title="Sign-In with Google">
        <p>
          Spotlightly uses Google Sign-In as the only way to create an account and log in. When you
          sign in, Google shares your name, email address, and profile photo with us, as permitted by
          your Google account settings. We do not have access to your Google password.
        </p>
      </LegalSection>

      <LegalSection title="Information We Collect">
        <LegalList items={[
          'First Name',
          'Age',
          'Email Address (from Google Sign-In)',
          'Contest Submissions',
          'Votes',
          'Reports',
          'Contact form messages',
        ]} />
      </LegalSection>

      <LegalSection title="How We Use Information">
        <LegalList items={[
          'Account creation and sign-in',
          'Contest participation',
          'Voting functionality',
          'Moderation and safety review',
          'Responding to contact form messages and reports',
          'Platform improvement',
        ]} />
      </LegalSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-4 bg-green-50/60 border border-green-100">
          <h3 className="font-bold text-green-700 text-sm mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Public Information
          </h3>
          <p className="text-xs text-green-700 mb-2">Only the following may be displayed publicly:</p>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• First Name</li>
            <li>• Age</li>
            <li>• Contest Entries</li>
          </ul>
        </div>
        <div className="rounded-2xl p-4 bg-red-50/60 border border-red-100">
          <h3 className="font-bold text-red-600 text-sm mb-2 flex items-center gap-2">
            <EyeOff className="w-4 h-4" /> Private Information
          </h3>
          <p className="text-xs text-red-600 mb-2">The following is never publicly displayed:</p>
          <ul className="text-xs text-red-600 space-y-1">
            <li>• Email Address</li>
          </ul>
          <p className="text-xs text-red-600 mt-2">
            Exception: if you win a contest with a reward, your email may be shared with the contest
            creator so they can contact you about claiming your prize.
          </p>
        </div>
      </div>

      <LegalSection title="Cookies and Local Storage">
        <p>
          Spotlightly uses cookies and similar technologies, including browser local storage, to keep
          you signed in and improve your experience. For example, we use local storage to remember
          that you have acknowledged our cookie notice, so it does not appear on every visit.
        </p>
      </LegalSection>

      <LegalSection title="Data Storage">
        <LegalList items={[
          'User data is stored securely using Firebase services.',
          'Contest, entry, vote, and report data is stored in Firebase Firestore.',
        ]} />
      </LegalSection>

      <LegalSection title="Children">
        <LegalList items={[
          'Users under 18 should participate only with the permission of a parent or legal guardian.',
          'During account setup, users under 18 are asked to confirm they have this permission before continuing.',
        ]} />
      </LegalSection>

      <LegalSection title="Your Choices">
        <p>
          You may stop using Spotlightly at any time. To request deletion of your account or data,
          please contact us through our Contact Us / Report an Issue page.
        </p>
      </LegalSection>

      <div className="mt-10 pt-6 border-t border-purple-100 text-center">
        <p className="text-sm text-gray-600">
          Spotlightly is proudly built and supported by{' '}
          <span className="font-semibold gradient-text">Kritical Technolabs LLC</span>.
        </p>
      </div>
    </LegalPageLayout>
  );
}
