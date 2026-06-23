import LegalPageLayout from '@/components/layout/LegalPageLayout';
import { LegalSection } from '@/components/layout/LegalSection';
import Link from 'next/link';
import { Flag } from 'lucide-react';

const ALLOWED = ['Original content', 'Creativity', 'Respectful behavior', 'Positive competition'];
const NOT_ALLOWED = ['Harassment', 'Hate speech', 'Copyright infringement', 'Spam', 'Offensive content', 'Impersonation'];

export default function GuidelinesPage() {
  return (
    <LegalPageLayout title="Community Guidelines" icon="🌟">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Our Goal</p>
        <p className="text-lg text-purple-800 font-medium">
          Create a safe, welcoming, and creative environment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-green-50/60 border border-green-100">
          <h3 className="font-bold text-green-700 mb-3">Allowed</h3>
          <ul className="space-y-2">
            {ALLOWED.map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-green-700">
                <span>✅</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-5 bg-red-50/60 border border-red-100">
          <h3 className="font-bold text-red-600 mb-3">Not Allowed</h3>
          <ul className="space-y-2">
            {NOT_ALLOWED.map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-red-600">
                <span>❌</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LegalSection title="Reporting">
        <p>Users can report content that violates these guidelines using the report button on any entry.</p>
      </LegalSection>

      <LegalSection title="Violations">
        <p>Spotlightly may remove content or suspend accounts that violate these guidelines.</p>
      </LegalSection>

      <div className="mt-8 pt-6 border-t border-purple-100 text-center">
        <p className="text-sm text-purple-600 mb-3">See something that doesn't belong?</p>
        <Link href="/contact" className="btn-primary inline-flex text-sm py-2.5">
          <Flag className="w-4 h-4" /> Report an Issue
        </Link>
      </div>
    </LegalPageLayout>
  );
}
