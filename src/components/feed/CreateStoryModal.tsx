import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Plus, Send, Sparkles, X } from 'lucide-react';
import { db } from '../../lib/supabase';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STORY_GRADIENTS = [
  { id: 'purple', name: 'Violet Électrique', class: 'from-[#7C3AED] via-[#6366F1] to-[#1E1B4B]' },
  { id: 'pink', name: 'Rose Néon', class: 'from-[#EC4899] via-[#F43F5E] to-[#4C0519]' },
  { id: 'cyber', name: 'Cyber Noir', class: 'from-[#0F172A] via-[#1E1B4B] to-[#020617]' },
  { id: 'sunset', name: 'Sunset Blaze', class: 'from-[#F97316] via-[#EA580C] to-[#881337]' },
  { id: 'emerald', name: 'Aurora Mint', class: 'from-[#10B981] via-[#059669] to-[#064E3B]' }
];

const PHOTO_PRESETS = [
  { name: 'Tokyo Neon', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sunset Vibe', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cyber Setup', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Party Lights', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Street Art', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' }
];

const STICKER_PRESETS = [
  { type: 'ask_anon' as const, label: 'Message Anonyme', text: 'Posez-moi une question sans filtre 🔮' },
  { type: 'poll' as const, label: 'Sondage', text: 'Vrai ou Faux ? Vous oseriez me le dire en face ? 👀' },
  { type: 'vibe' as const, label: 'Vibe du jour', text: 'Laissez votre meilleure recommandation ✨' }
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [content, setContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(STORY_GRADIENTS[0].class);
  const [photos, setPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSticker, setSelectedSticker] = useState(STICKER_PRESETS[0]);
  const [stickerCustomText, setStickerCustomText] = useState(STICKER_PRESETS[0].text);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentUser = db.getCurrentUser();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos((previous) => {
            const nextPhotos = [...previous, reader.result as string];
            setActivePhotoIndex(nextPhotos.length - 1);
            return nextPhotos;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const handleSelectPresetPhoto = (url: string) => {
    setPhotos((previous) => {
      const nextPhotos = [...previous, url];
      setActivePhotoIndex(nextPhotos.length - 1);
      return nextPhotos;
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((previous) => {
      const nextPhotos = previous.filter((_, photoIndex) => photoIndex !== index);
      setActivePhotoIndex((activeIndex) => {
        if (nextPhotos.length === 0) return 0;
        if (activeIndex > index) return activeIndex - 1;
        return Math.min(activeIndex, nextPhotos.length - 1);
      });
      return nextPhotos;
    });
  };

  const handlePublish = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() && !stickerCustomText.trim() && photos.length === 0) return;

    setIsSubmitting(true);
    db.createStory({
      content: content.trim() || (photos.length > 0 ? '✨ Photo Vibe' : 'Nouvelle story VYBZ ✨'),
      bgGradient: selectedGradient,
      imageUrl: photos.length > 0 ? photos[activePhotoIndex] || photos[0] : undefined,
      images: photos.length > 0 ? photos : undefined,
      stickerType: selectedSticker.type,
      stickerText: stickerCustomText.trim()
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Publishing succeeds even if the celebration animation is unavailable.
    }

    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  const currentPhoto = photos[activePhotoIndex] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#131320] border border-white/10 rounded-3xl p-4 shadow-2xl relative max-h-[94vh] flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold font-display text-white">Créer une Story Photo / Texte</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`w-full aspect-[9/13] rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden mb-3 border border-white/10 ${
            currentPhoto ? 'bg-black' : `bg-gradient-to-br ${selectedGradient}`
          }`}
        >
          {currentPhoto && (
            <>
              <img
                src={currentPhoto}
                alt="Story photo"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/70 z-0" />
            </>
          )}

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-white/40 shadow-sm"
              />
              <div>
                <span className="text-xs font-bold text-white block drop-shadow-sm leading-tight">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-white/80 font-mono">
                  @{currentUser.username} · Maintenant
                </span>
              </div>
            </div>
            {photos.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                {activePhotoIndex + 1}/{photos.length} photo{photos.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="my-auto text-center z-10 px-2">
            <textarea
              rows={2}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={currentPhoto ? 'Légende de la photo...' : 'Tapez votre texte ici...'}
              className="w-full bg-transparent text-center font-display font-extrabold text-lg sm:text-xl text-white placeholder:text-white/60 focus:outline-none resize-none leading-tight drop-shadow-md"
            />
          </div>

          <div className="z-10 p-3 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 text-center shadow-lg">
            <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-purple-300 mb-1">
              <Sparkles className="w-3 h-3 text-[#EC4899]" />
              <span>Sticker Interactif VYBZ</span>
            </div>
            <p className="text-xs font-bold text-white mb-2 leading-snug">{stickerCustomText}</p>
            <div className="py-1 px-3 rounded-xl bg-white/20 text-white/90 text-[11px] font-medium inline-block">
              Répondre anonymement...
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-[#181827] rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Photos de la story ({photos.length})</span>
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Importer photo(s)</span>
              </button>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {photos.map((photo, index) => (
                  <div
                    key={`${index}-${photo.slice(0, 24)}`}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`relative w-12 h-16 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-transform ${
                      activePhotoIndex === index
                        ? 'border-[#8B5CF6] scale-105 shadow-md'
                        : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemovePhoto(index);
                      }}
                      aria-label={`Supprimer la photo ${index + 1}`}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <span className="text-[10px] text-gray-400 block mb-1">
                Ou choisissez une photo prédéfinie :
              </span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPresetPhoto(preset.url)}
                    className="whitespace-nowrap px-2 py-1 rounded-lg bg-black/30 hover:bg-purple-500/20 text-gray-300 hover:text-white text-[10px] border border-white/5 transition-colors"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!currentPhoto && (
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                Couleur de fond :
              </span>
              <div className="flex gap-2">
                {STORY_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.id}
                    type="button"
                    onClick={() => setSelectedGradient(gradient.class)}
                    aria-label={gradient.name}
                    aria-pressed={selectedGradient === gradient.class}
                    className={`flex-1 h-6 rounded-xl bg-gradient-to-br ${gradient.class} border-2 transition-transform ${
                      selectedGradient === gradient.class
                        ? 'border-white scale-110 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
              Choisir un sticker interactif :
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {STICKER_PRESETS.map((sticker) => (
                <button
                  key={sticker.type}
                  type="button"
                  onClick={() => {
                    setSelectedSticker(sticker);
                    setStickerCustomText(sticker.text);
                  }}
                  aria-pressed={selectedSticker.type === sticker.type}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedSticker.type === sticker.type
                      ? 'bg-[#8B5CF6] text-white shadow-sm'
                      : 'bg-[#1C1C2B] text-gray-400 hover:text-white'
                  }`}
                >
                  {sticker.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899] text-white font-semibold text-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
          >
            <span>
              {photos.length > 0
                ? `Publier Story (${photos.length} photo${photos.length > 1 ? 's' : ''})`
                : 'Publier Story'}
            </span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
