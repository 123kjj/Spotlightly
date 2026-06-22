import LegalPageLayout from '@/components/layout/LegalPageLayout';
import { LegalSection, LegalList } from '@/components/layout/LegalSection';
import { Eye, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <LegalPageLayout title="Privacy Policy" subtitle={`Last Updated: ${lastUpdated}`} icon="🔒">
      <LegalSection title="Information We Collect">
        <LegalList items={[
          'Name',
          'Age',
          'Email Address',
          'Contest Submissions',
          'Votes',
          'Reports',
        ]} />
      </LegalSection>

      <LegalSection title="How We Use Information">
        <LegalList items={[
          'Account creation',
          'Contest participation',
          'Voting functionality',
          'Moderation',
          'Platform improvement',
        ]} />
      </LegalSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-4 bg-green-50/60 border border-green-100">
          <h3 className="font-bold text-green-700 text-sm mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Public Information
          </h3>
          <p className="text-xs text-green-600 mb-2">Only the following may be displayed publicly:</p>
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
          <p className="text-xs text-red-500 mb-2">The following are never publicly displayed:</p>
          <ul className="text-xs text-red-600 space-y-1">
            <li>• Email Address</li>
          </ul>
        </div>
      </div>

      <LegalSection title="Data Storage">
        <LegalList items={[
          'User data is stored securely using Firebase services.',
        ]} />
      </LegalSection>

      <LegalSection title="Children">
        <LegalList items={[
          'Users under 18 should have parent or guardian permission before participating.',
        ]} />
      </LegalSection>
    </LegalPageLayout>
  );
}
