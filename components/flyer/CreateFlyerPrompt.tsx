'use client';

import { useRouter } from 'next/navigation';
import { X, ImageIcon } from 'lucide-react';

interface Props {
  contestId: string;
  contestTitle: string;
  onClose: () => void;
}

export default function CreateFlyerPrompt({ contestId, contestTitle, onClose }: Props) {
  const router = useRouter();

  function handleCreateFlyer() {
    onClose();
    router.push(`/create-flyer?contestId=${contestId}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl p-8 max-w-sm w-full glow-lavender text-center animate-rise-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="text-5xl mb-4 animate-float">✨</div>
        <h2 className="text-xl font-extrabold gradient-text mb-2">Your contest has been created!</h2>
        <p className="text-gray-600 text-sm mb-2">
          <strong className="text-purple-900">{contestTitle}</strong> is live.
        </p>
        <p className="text-gray-600 text-sm mb-6">
          Would you like to create a promotional flyer for it?
        </p>

        <div className="flex flex-col gap-3">
          <button onClick={handleCreateFlyer} className="btn-primary w-full justify-center py-3">
            <ImageIcon className="w-4 h-4" /> 📄 Create Flyer
          </button>
          <button onClick={onClose} className="btn-secondary w-full justify-center py-2.5 text-sm">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
