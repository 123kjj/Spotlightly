import Link from 'next/link';
import { ArrowLeft, Sparkles, Trophy, ShieldCheck, Building2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-8 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-float">🌟</div>
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">About Spotlightly</h1>
        <p className="text-gray-700 text-sm">Where creativity takes center stage</p>
      </div>

      <div className="space-y-6">
        {/* Our Mission */}
        <div className="glass rounded-3xl p-6 sm:p-8 glow-lavender">
          <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" /> Our Mission
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Spotlightly was created to give creators a place to share their talents, participate in contests, and celebrate creativity.
          </p>
        </div>

        {/* What is Spotlightly */}
        <div className="glass rounded-3xl p-6 sm:p-8 glow-lavender">
          <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> What is Spotlightly?
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Spotlightly is a contest platform where participants submit YouTube videos, receive votes from the community, and compete for top placements.
          </p>
        </div>

        {/* Safety & Fairness */}
        <div className="glass rounded-3xl p-6 sm:p-8 glow-lavender">
          <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" /> Safety & Fairness
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            We review submissions, provide reporting tools, and strive to maintain a positive environment for all participants.
          </p>
        </div>

        {/* Powered By */}
        <div className="glass rounded-3xl p-6 sm:p-8 text-center glow-gold">
          <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center justify-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" /> Powered By
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Spotlightly is proudly built and supported by{' '}
            <span className="font-semibold gradient-text">Kritical Technolabs LLC</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
