import LegalPageLayout from '@/components/layout/LegalPageLayout';
import { LegalSection, LegalList } from '@/components/layout/LegalSection';

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <LegalPageLayout title="Terms of Service" subtitle={`Last Updated: ${lastUpdated}`} icon="📜">
      <p className="text-purple-700 mb-8 leading-relaxed">
        Welcome to Spotlightly. By using Spotlightly, you agree to the following:
      </p>

      <LegalSection title="Eligibility">
        <LegalList items={[
          'Users may only participate if they meet the contest requirements.',
          'Users under 18 must have permission from a parent or guardian.',
        ]} />
      </LegalSection>

      <LegalSection title="Content Ownership">
        <LegalList items={[
          'Users must own the content they submit or have permission to submit it.',
          'Users are responsible for ensuring their content does not violate copyright laws.',
        ]} />
      </LegalSection>

      <LegalSection title="Prohibited Content">
        <p className="mb-2">Users may not submit:</p>
        <LegalList items={[
          'Illegal content',
          'Harassment or bullying',
          'Hate speech',
          'Inappropriate content',
          'Spam',
          'Misleading content',
          'Content that violates copyright',
        ]} />
      </LegalSection>

      <LegalSection title="Voting">
        <LegalList items={[
          'One vote per user per entry.',
          'Vote manipulation is prohibited.',
          'Spotlightly may remove fraudulent votes.',
        ]} />
      </LegalSection>

      <LegalSection title="Moderation">
        <LegalList items={[
          'Spotlightly reserves the right to remove content that violates the rules.',
          'Spotlightly may suspend or ban users who repeatedly violate policies.',
        ]} />
      </LegalSection>

      <LegalSection title="Contest Prizes and Rewards">
        <p className="mb-3">
          Spotlightly serves solely as a platform that allows contest creators to host contests and participants to submit entries.
        </p>
        <p className="mb-2">Each contest creator is solely responsible for:</p>
        <LegalList items={[
          'Defining the contest rules.',
          'Describing the prize or reward.',
          'Selecting the winner (if applicable under the contest rules).',
          'Delivering the advertised prize or reward to the winner.',
        ]} />
        <p className="mt-3">
          Spotlightly does not sponsor, guarantee, verify, or deliver prizes offered by contest creators.
        </p>
        <p className="mt-2">
          Spotlightly is not responsible or liable if a contest creator fails to deliver a prize, delays delivery, changes the prize, or otherwise does not fulfill the promises made in their contest.
        </p>
        <p className="mt-2">
          Any disputes regarding prizes or rewards are between the contest creator and the participants. Spotlightly may, at its sole discretion, investigate reports of abuse or repeated violations and may remove contests or suspend accounts that violate our policies.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <LegalList items={[
          'Spotlightly is provided as-is.',
          'Spotlightly is not responsible for third-party content or YouTube videos.',
        ]} />
      </LegalSection>
    </LegalPageLayout>
  );
}
