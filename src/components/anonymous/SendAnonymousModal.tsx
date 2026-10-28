import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/supabase';
import { CardThemeId, UserProfile } from '../../types';
import { CARD_THEMES } from '../../lib/theme';
import { Send, Sparkles, Shield, AlertCircle, X, HelpCircle, Check } from 'lucide-react';

interface SendAnonymousModalProps {
  recipient: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

const PROMPT_TEMPLATES = [
  { tag: 'Vérité', text: 'Une chose que tu n’as jamais osé dire en public ?' },
  { tag: 'Compliment', text: 'Ce qui te rend vraiment unique selon moi...' },
  { tag: 'Crush', text: 'Si je te disais que quelqu’un a un crush secret sur toi ? 👀' },
  { tag: 'Première impression', text: 'La toute première impression que j’ai eue de toi...' },
  { tag: 'Question cash', text: 'Sois 100% honnête : si tu devais changer un choix récent ?' }
];

const HINT_OPTIONS = [
  'Envoyé depuis un iPhone · Paris',
  'Envoyé depuis Android · Lyon',
  'Signe astro : Scorpion ♏',
  'On s’est déjà croisés en vrai ✨',
  'Quelqu’un de ton cercle professionnel 💼',
  'Aucun indice (mystère total)'
];

export const SendAnonymousModal: React.FC<SendAnonymousModalProps> = ({
  recipient,
  isOpen,
  onClose,
  onSent
}) => {
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<CardThemeId>('purple_gradient');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('Vérité');
  const [selectedHint, setSelectedHint] = useState<string>(HINT_OPTIONS[0]);
  const [showHintPicker, setShowHintPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentThemeConfig = CARD_THEMES[selectedTheme];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Veuillez écrire un message.');
      return;
    }

    if (content.length < 5) {
      setError('Votre message est un peu trop court (5 caractères min).');
      return;
    }

    setIsSubmitting(true);

    const result = db.sendAnonymousMessage({
      recipientId: recipient.id,
      content: content.trim(),
      cardTheme: selectedTheme,
      promptTag: selectedPrompt,
      hint: selectedHint === 'Aucun indice (mystère total)' ? undefined : selectedHint
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Impossible d’envoyer le message.');
      return;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8B5CF6', '#EC4899', '#38BDF8', '#F59E0B']
      });
    } catch {}

    setIsSuccess(true);
    if (onSent) onSent();

    setTimeout(() => {
      setIsSuccess(false);
      setContent('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#12121C] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-in zoom-in duration-300">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">Message envoyé !</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Votre mot secret a été glissé dans la boîte anonyme de @{recipient.username}.
              Votre identité reste 100% confidentielle.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={recipient.avatarUrl}
                alt={recipient.displayName}
                className="w-12 h-12 rounded-full object-cover border border-purple-500/40"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-white text-sm">{recipient.displayName}</h3>
                  <span className="text-[11px] text-gray-400 font-mono">@{recipient.username}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-purple-400">
                  <Shield className="w-3 h-3" />
                  <span>Envoi anonyme sécurisé</span>
                </div>
              </div>
            </div>

            {/* Quick Inspiration Tags */}
            <div className="mb-3">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">
                Idées de questions / thèmes :
              </span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {PROMPT_TEMPLATES.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => {
                      setSelectedPrompt(item.tag);
                      setContent(item.text);
                    }}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selectedPrompt === item.tag
                        ? 'bg-[#8B5CF6] text-white shadow-sm'
                        : 'bg-[#1C1C2B] text-gray-300 hover:text-white hover:bg-[#252538]'
                    }`}
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Card Canvas */}
            <div
              className={`p-4 rounded-2xl ${currentThemeConfig.bgGradient} ${currentThemeConfig.textColor} shadow-lg transition-all duration-300 relative mb-4 border ${currentThemeConfig.borderColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full backdrop-blur-md ${currentThemeConfig.accentBadge}`}>
                  {selectedPrompt}
                </span>
                <span className="text-[10px] opacity-75 font-mono">vybz.app/u/{recipient.username}</span>
              </div>

              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={600}
                placeholder={`Écris ton message anonyme pour ${recipient.displayName} ici...`}
                className="w-full bg-transparent resize-none text-sm placeholder-white/60 focus:outline-none leading-relaxed font-medium"
              />

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[10px] opacity-80">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Indice : {selectedHint.split('·')[0]}</span>
                </div>
                <span className="font-mono">{content.length}/600</span>
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Style de la carte :
                </span>
                <span className="text-[11px] text-gray-300 font-medium">
                  {currentThemeConfig.name}
                </span>
              </div>
              <div className="flex gap-2">
                {Object.values(CARD_THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`flex-1 h-7 rounded-xl ${theme.bgGradient} border-2 transition-transform ${
                      selectedTheme === theme.id ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Clue / Hint Picker Accordion */}
            <div className="mb-4 bg-[#181827] rounded-xl p-3 border border-white/5">
              <button
                type="button"
                onClick={() => setShowHintPicker(!showHintPicker)}
                className="w-full flex items-center justify-between text-left text-xs font-medium text-gray-300"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Laisser un indice secret ?</span>
                </div>
                <span className="text-[11px] text-[#8B5CF6]">
                  {showHintPicker ? 'Masquer' : 'Modifier'}
                </span>
              </button>

              {showHintPicker && (
                <div className="mt-2.5 space-y-1.5 pt-2 border-t border-white/5">
                  {HINT_OPTIONS.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => {
                        setSelectedHint(hint);
                        setShowHintPicker(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedHint === hint
                          ? 'bg-[#8B5CF6]/20 text-white font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{hint}</span>
                      {selectedHint === hint && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSend}
              disabled={isSubmitting || !content.trim()}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899] text-white font-semibold text-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Envoyer anonymement</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-500 text-center mt-3">
              Protégé par les filtres de sécurité VYBZ · Harcèlement et spam strictement interdits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
