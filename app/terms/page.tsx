import LegalPageLayout from '@/components/layout/LegalPageLayout';
import Link from 'next/link';

interface Section {
  title: string;
  body: string[];
  list?: string[];
}

const SECTIONS: Section[] = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By creating an account, accessing, or using Spotlightly ("Spotlightly," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the platform.',
    ],
  },
  {
    title: '2. Changes to These Terms',
    body: [
      'We may update these Terms from time to time to reflect changes in our platform, legal requirements, or business practices. When we make material changes, we will update the "Last Updated" date at the top of this page. Continued use of Spotlightly after changes are posted means you accept the updated Terms.',
    ],
  },
  {
    title: '3. About Spotlightly',
    body: [
      'Spotlightly is a technology platform that allows contest creators to host video contests and participants to submit YouTube video entries, receive votes from the community, and compete for recognition and prizes offered by contest creators.',
      'Spotlightly does not store videos directly — it displays YouTube thumbnails, titles, and links to content hosted on YouTube.',
    ],
  },
  {
    title: '4. Eligibility and Age Requirements',
    body: [
      'You must be able to form a legally binding contract to use Spotlightly. There is no strict minimum age to participate, but users under 18 must follow the parental/guardian permission requirements described below.',
    ],
  },
  {
    title: '5. Parent or Legal Guardian Permission for Users Under 18',
    body: [
      'Users under the age of 18 should participate on Spotlightly only with the knowledge and permission of a parent or legal guardian. During account setup, users under 18 will be asked to confirm they have this permission before they can continue using the platform.',
    ],
  },
  {
    title: '6. User Accounts',
    body: [
      'You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it. You agree to provide accurate information during account setup, including your first name and age.',
    ],
  },
  {
    title: '7. Google Sign-In Authentication',
    body: [
      'Spotlightly uses Google Sign-In as the sole method of authentication. By signing in with Google, you authorize Spotlightly to access basic profile information (such as your name, email address, and profile photo) as permitted by Google and necessary to operate your Spotlightly account.',
    ],
  },
  {
    title: '8. User Responsibilities',
    body: [
      'You agree to use Spotlightly honestly and respectfully, to provide accurate information, and to comply with these Terms, our Community Guidelines, and all applicable laws.',
    ],
  },
  {
    title: '9. Contest Creator Responsibilities',
    body: ['If you create a contest, you are solely responsible for:'],
    list: [
      'Defining clear and fair contest rules.',
      'Accurately describing any prize or reward offered.',
      'Selecting winners fairly, in accordance with your stated rules.',
      'Delivering any advertised prize or reward to the winner in a timely manner.',
      'Responding to questions from participants about your contest.',
    ],
  },
  {
    title: '10. Contest Participant Responsibilities',
    body: ['If you submit an entry to a contest, you agree to:'],
    list: [
      'Follow the specific rules set by the contest creator.',
      'Submit only content you own or have permission to share.',
      'Provide accurate information in your submission, including your name, age, and contact email.',
      'Accept that contest outcomes are determined by the contest creator and/or community votes, as described in the contest rules.',
    ],
  },
  {
    title: '11. Contest Rules',
    body: [
      'Each contest has its own rules, set by the contest creator. Spotlightly does not write, approve, or guarantee the fairness of individual contest rules beyond requiring compliance with these Terms and our Community Guidelines.',
    ],
  },
  {
    title: '12. Submission Review and Moderation',
    body: [
      'Spotlightly may review, approve, reject, edit, hide, or remove any submission, contest, comment, or account that violates these Terms, our Community Guidelines, or applicable law. Submissions are not displayed publicly until approved.',
    ],
  },
  {
    title: '13. Content Ownership',
    body: [
      'You retain ownership of the content you submit. By submitting an entry, you confirm that you own the content or have obtained all necessary permissions to share it.',
    ],
  },
  {
    title: '14. License to Display User Content',
    body: [
      'By submitting an entry, you grant Spotlightly a non-exclusive, worldwide, royalty-free license to display your submission\'s title, thumbnail, and YouTube link on the platform for the purpose of operating contests and showcasing entries.',
    ],
  },
  {
    title: '15. Copyright and Intellectual Property',
    body: [
      'You must own or have permission to submit any video, music, artwork, footage of other people, or other copyrighted material included in your entry. Submitting content that infringes on someone else\'s rights is a violation of these Terms.',
    ],
  },
  {
    title: '16. Reporting Copyright Infringement',
    body: [
      'If you believe content on Spotlightly infringes your copyright, please contact us through our Contact Us / Report an Issue page with details of the content and your claim. We will review and respond to legitimate reports.',
    ],
  },
  {
    title: '17. Community Guidelines',
    body: [
      'All users must follow our Community Guidelines, which describe acceptable and unacceptable behavior on the platform in more detail. Our Community Guidelines are incorporated into these Terms by reference.',
    ],
  },
  {
    title: '18. Prohibited Conduct',
    body: ['You may not use Spotlightly to:'],
    list: [
      'Submit illegal, harassing, hateful, sexually explicit, or otherwise inappropriate content.',
      'Spam, mislead, or deceive other users.',
      'Impersonate another person or entity.',
      'Attempt to manipulate votes or contest outcomes.',
      'Submit content that violates copyright or other intellectual property rights.',
      'Interfere with the operation or security of the platform.',
    ],
  },
  {
    title: '19. Voting Rules',
    body: [
      'Each registered user may cast one vote per entry. Votes are recorded and displayed publicly as a vote count. Voting is the primary method used to help determine contest outcomes, subject to each contest\'s specific rules.',
    ],
  },
  {
    title: '20. Fraud, Vote Manipulation, and Multiple Accounts',
    body: [
      'Creating multiple accounts to cast additional votes, using bots or automated tools to vote, or otherwise attempting to manipulate vote counts is strictly prohibited. Spotlightly may remove fraudulent votes and may suspend accounts involved in vote manipulation.',
    ],
  },
  {
    title: '21. Contest Winners',
    body: [
      'Winners are determined according to each contest\'s specific rules, which typically rely on community vote counts. Spotlightly displays winners on a dedicated Winners page once a contest has ended, based on the data available at that time.',
    ],
  },
  {
    title: '22. Prize and Reward Disclaimer',
    body: [
      'Spotlightly serves solely as a platform that allows contest creators to host contests and participants to submit entries.',
      'Each contest creator is solely responsible for defining contest rules, describing the prize or reward, selecting the winner, and delivering the advertised prize or reward to the winner.',
      'Spotlightly does not sponsor, guarantee, verify, or deliver prizes offered by contest creators, unless explicitly stated otherwise for a specific contest.',
      'Spotlightly is not responsible or liable if a contest creator fails to deliver a prize, delays delivery, changes the prize, or otherwise does not fulfill the promises made in their contest.',
      'Any disputes regarding prizes or rewards are between the contest creator and the participants. Spotlightly may, at its sole discretion, investigate reports of abuse or repeated violations and may remove contests or suspend accounts that violate our policies.',
    ],
  },
  {
    title: '23. Platform Role Disclaimer',
    body: [
      'Spotlightly is only a technology platform that connects contest creators and participants. We do not organize, sponsor, or operate individual contests ourselves, and we are not a party to the arrangement between a contest creator and a participant.',
    ],
  },
  {
    title: '24. Third-Party Services (Including YouTube and Firebase)',
    body: [
      'Spotlightly relies on third-party services, including YouTube (for video hosting and playback) and Firebase (for authentication and data storage). Your use of these services is also subject to their own terms and policies. Spotlightly is not responsible for outages, changes, or issues caused by these third-party services.',
    ],
  },
  {
    title: '25. User-Generated Content Disclaimer',
    body: [
      'Spotlightly does not create or endorse user-submitted content. Views, opinions, and material expressed in submissions belong solely to the individuals who created them, and do not represent the views of Spotlightly.',
    ],
  },
  {
    title: '26. Removal of Content',
    body: [
      'We reserve the right to remove any content — including contests, entries, comments, or profile information — that we determine, in our sole discretion, violates these Terms, our Community Guidelines, or applicable law.',
    ],
  },
  {
    title: '27. Account Suspension and Termination',
    body: [
      'Spotlightly may suspend or permanently ban accounts, without prior notice, for serious or repeated violations of these Terms or our Community Guidelines.',
    ],
  },
  {
    title: '28. Reporting Abuse',
    body: [
      'Spotlightly may investigate reports of abuse, fraud, spam, copyright infringement, vote manipulation, impersonation, or inappropriate content. Use the report button on any entry, or our Contact Us / Report an Issue page, to flag content or behavior for review.',
    ],
  },
  {
    title: '29. Privacy and Data Collection',
    body: [
      'Our collection and use of your information is described in our Privacy Policy, which is incorporated into these Terms by reference.',
    ],
  },
  {
    title: '30. Cookies and Local Storage',
    body: [
      'Spotlightly uses cookies and similar technologies, including browser local storage, to keep you signed in and improve your experience. See our Privacy Policy for more detail.',
    ],
  },
  {
    title: '31. Security',
    body: [
      'We take reasonable measures to protect your information, but no platform can guarantee perfect security. You are responsible for keeping your Google account credentials secure.',
    ],
  },
  {
    title: '32. Disclaimer of Warranties',
    body: [
      'Spotlightly is provided "as is" and "as available," without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
    ],
  },
  {
    title: '33. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, Spotlightly is not responsible or liable for user-generated content, contest outcomes, prize disputes, technical issues, or third-party service outages. Users participate in contests at their own discretion and risk.',
    ],
  },
  {
    title: '34. Indemnification',
    body: [
      'You agree to indemnify and hold harmless Spotlightly and its operator, Kritical Technolabs LLC, from any claims, damages, or expenses arising from your use of the platform, your content, or your violation of these Terms.',
    ],
  },
  {
    title: '35. Platform Availability and Maintenance',
    body: [
      'We strive to keep Spotlightly available and functioning smoothly, but we do not guarantee uninterrupted access. The platform may be unavailable at times due to maintenance, updates, or factors outside our control.',
    ],
  },
  {
    title: '36. Changes to the Platform',
    body: [
      'We may add, change, or remove features of Spotlightly at any time, with or without notice, as we continue to improve the platform.',
    ],
  },
  {
    title: '37. Governing Law',
    body: [
      'These Terms are governed by the laws applicable to Kritical Technolabs LLC\'s jurisdiction of operation, without regard to conflict-of-law principles.',
    ],
  },
  {
    title: '38. Dispute Resolution',
    body: [
      'If a dispute arises regarding these Terms or your use of Spotlightly, we encourage you to contact us first through our Contact Us / Report an Issue page so we can try to resolve the issue informally.',
    ],
  },
  {
    title: '39. Severability',
    body: [
      'If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.',
    ],
  },
  {
    title: '40. Entire Agreement',
    body: [
      'These Terms, together with our Privacy Policy and Community Guidelines, constitute the entire agreement between you and Spotlightly regarding your use of the platform.',
    ],
  },
  {
    title: '41. Contact Information',
    body: [
      'If you have questions about these Terms, please reach out through our Contact Us / Report an Issue page.',
    ],
  },
];

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <LegalPageLayout title="Terms of Service" subtitle={`Last Updated: ${lastUpdated}`} icon="📜">
      <p className="text-gray-700 mb-8 leading-relaxed">
        Welcome to Spotlightly. These Terms of Service are written to be easy to understand while
        clearly explaining how the platform works, what we expect from you, and the protections that
        apply to everyone who uses Spotlightly. Please read them carefully. They work together with
        our{' '}
        <Link href="/privacy" className="font-semibold text-purple-700 hover:underline">Privacy Policy</Link>
        {' '}and{' '}
        <Link href="/guidelines" className="font-semibold text-purple-700 hover:underline">Community Guidelines</Link>.
      </p>

      {SECTIONS.map(section => (
        <div key={section.title} className="mb-8 last:mb-0">
          <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0" />
            {section.title}
          </h2>
          <div className="text-gray-700 text-sm leading-relaxed space-y-2">
            {section.body.map((para, i) => <p key={i}>{para}</p>)}
            {section.list && (
              <ul className="space-y-1.5 ml-1 pt-1">
                {section.list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1.5 text-xs flex-shrink-0">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}

      <div className="mt-10 pt-6 border-t border-purple-100 text-center">
        <p className="text-sm text-gray-600">
          Spotlightly is proudly built and supported by{' '}
          <span className="font-semibold gradient-text">Kritical Technolabs LLC</span>.
        </p>
      </div>
    </LegalPageLayout>
  );
}
