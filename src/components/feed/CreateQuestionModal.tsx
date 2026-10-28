import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { Question } from '../../types';
import { HelpCircle, Sparkles, X, Send } from 'lucide-react';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { id: Question['category']; label: string }[] = [
  { id: 'general', label: 'Général' },
  { id: 'confession', label: 'Confession' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'tech', label: 'Tech & Créa' },
  { id: 'deep', label: 'Pensées profondes' }
];

export const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Question['category']>('general');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez formuler votre question.');
      return;
    }

    db.createQuestion(title.trim(), category);
    setTitle('');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131320] border border-white/10 rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-[#8B5CF6] flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">Poser une question</h3>
            <p className="text-xs text-gray-400">Demandez l’avis à toute la communauté</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Catégorie :
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'bg-[#8B5CF6] text-white shadow-sm'
                      : 'bg-[#1C1C2B] text-gray-400 hover:text-white hover:bg-[#252538]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Votre question :
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Quelle est la plus belle leçon que la vie vous ait apprise récemment ?"
              className="w-full p-3 rounded-2xl bg-[#0B0B10] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] resize-none"
            />
          </div>

          {error && (
            <p className="text-rose-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publier la question</span>
          </button>
        </form>
      </div>
    </div>
  );
};
