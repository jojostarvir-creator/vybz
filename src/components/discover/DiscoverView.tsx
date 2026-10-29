import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { Search, Sparkles, MessageCircle, Send, ShieldCheck, UserPlus, Check } from 'lucide-react';

interface DiscoverViewProps {
  onStartChat: (userId: string) => void;
  onSendAnon: (user: UserProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onStartChat,
  onSendAnon,
  onShowToast
}) => {
  const [search, setSearch] = useState('');
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const profiles = db.getProfiles();
  const currentUser = db.getCurrentUser();

  const filtered = profiles.filter((p) => {
    if (p.id === currentUser.id) return false;
    if (!search.trim()) return true;
    return (
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.bio || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleFollow = (userId: string) => {
    if (followedIds.includes(userId)) {
      setFollowedIds(followedIds.filter((id) => id !== userId));
      onShowToast('Abonnement retiré', 'info');
    } else {
      setFollowedIds([...followedIds, userId]);
      onShowToast('Vous suivez désormais cet utilisateur ! ✨', 'success');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C162E] via-[#141424] to-[#0E0E18] border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6]">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-sm font-bold text-white font-display">Découvrir la communauté</h2>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Explorez de nouveaux profils, lancez un chat privé ou envoyez des messages anonymes.
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par @pseudo, nom ou centre d’intérêt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-2xl bg-[#0B0B10] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Profiles Cards */}
      <div className="space-y-3">
        {filtered.map((profile) => {
          const isFollowed = followedIds.includes(profile.id);

          return (
            <div
              key={profile.id}
              className="p-4 rounded-3xl bg-[#14141F] border border-white/5 shadow-md hover:border-white/10 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-purple-500/30"
                    />
                    {profile.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#14141F]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-white text-sm">{profile.displayName}</h4>
                      {profile.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      )}
                    </div>
                    <span className="text-xs text-purple-400 font-mono">@{profile.username}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(profile.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    isFollowed
                      ? 'bg-white/10 text-gray-300 hover:bg-white/15'
                      : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Abonné</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Suivre</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bio */}
              <p className="text-xs text-gray-300 leading-relaxed">
                {profile.bio}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={() => onSendAnon(profile)}
                  className="py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Message anonyme</span>
                </button>

                <button
                  onClick={() => onStartChat(profile.id)}
                  className="py-2 px-3 rounded-xl bg-[#1C1C2B] hover:bg-[#252538] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chatter en privé</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
