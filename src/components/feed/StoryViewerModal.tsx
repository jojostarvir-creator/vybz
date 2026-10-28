import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { db } from '../../lib/supabase';
import { Story } from '../../types';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  onClose,
  onShowToast
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  if (!isOpen || stories.length === 0) return null;

  const story = stories[activeIndex];
  const author = db.getProfileById(story.authorId);
  const move = (offset: number) => {
    const nextIndex = activeIndex + offset;
    if (nextIndex < 0 || nextIndex >= stories.length) {
      onClose();
      return;
    }
    setActiveIndex(nextIndex);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <div className="relative flex h-[min(80vh,680px)] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#31145E] via-[#161426] to-[#6D1749] p-5 shadow-2xl">
        <div className="flex gap-1">
          {stories.map((item, index) => (
            <span
              key={item.id}
              className={`h-1 flex-1 rounded-full ${index <= activeIndex ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {author?.avatarUrl && (
              <img src={author.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">{author?.displayName || 'Membre VYBZ'}</p>
              <p className="text-[11px] text-white/60">
                {new Date(story.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full bg-black/20 p-2 text-white hover:bg-black/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="whitespace-pre-wrap break-words text-xl font-semibold leading-relaxed text-white">
            {story.content}
          </p>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Story précédente"
            className="rounded-full bg-black/20 p-3 text-white hover:bg-black/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onShowToast('Les réponses aux stories arrivent bientôt.', 'info');
            }}
            className="rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white hover:bg-white/25"
          >
            Répondre
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Story suivante"
            className="rounded-full bg-black/20 p-3 text-white hover:bg-black/40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
