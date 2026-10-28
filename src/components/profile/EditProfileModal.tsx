import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { User, X, Check, Camera } from 'lucide-react';

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: UserProfile) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Le nom d’affichage est requis.');
      return;
    }

    const updated = db.updateProfile(user.id, {
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl
    });

    onUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131320] border border-white/10 rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold font-display text-white mb-4">Modifier le profil</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Photo de profil :</label>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#8B5CF6]"
              />
              <div className="flex-1">
                <span className="text-[11px] text-gray-400 block mb-1">
                  Choisissez parmi les avatars ou collez un lien :
                </span>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="URL de photo..."
                  className="w-full p-2 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${
                    avatarUrl === preset ? 'border-[#8B5CF6] scale-110' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Nom d’affichage :</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Biographie :</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez-vous en quelques mots..."
              className="w-full p-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] resize-none"
            />
          </div>

          {error && <p className="text-rose-400 text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </form>
      </div>
    </div>
  );
};
