import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { CARD_THEMES } from '../../lib/theme';
import { 
  Settings, 
  Edit3, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  MessageSquare, 
  Heart,
  ExternalLink
} from 'lucide-react';
import { ShareLinkCard } from '../anonymous/ShareLinkCard';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenSettings: () => void;
  onOpenTestSend: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenEditProfile,
  onOpenSettings,
  onOpenTestSend,
  onShowToast
}) => {
  const [profileTab, setProfileTab] = useState<'posts' | 'received'>('posts');
  const currentUser = db.getCurrentUser();
  const anonMessages = db.getAnonymousMessages();
  const myPosts = db.getPosts().filter((p) => p.authorId === currentUser.id);

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-[#14141F] border border-white/5 relative overflow-hidden shadow-xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-32 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/40 p-0.5"
            />
            {currentUser.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#14141F]" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEditProfile}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
            <button
              onClick={onOpenSettings}
              aria-label="Paramètres"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Identity */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg font-bold font-display text-white">{currentUser.displayName}</h2>
            {currentUser.isVerified && (
              <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
            )}
          </div>
          <span className="text-xs text-purple-400 font-mono">@{currentUser.username}</span>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          {currentUser.bio}
        </p>

        {/* Metric stats (Strict anti-slop: clean, unboxed figures with tabular numbers) */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center">
          <div>
            <span className="block text-base font-bold text-white font-mono tabular-nums">
              {anonMessages.length}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Messages reçus</span>
          </div>
          <div>
            <span className="block text-base font-bold text-white font-mono tabular-nums">
              {currentUser.followersCount || 1420}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Abonnés</span>
          </div>
          <div>
            <span className="block text-base font-bold text-white font-mono tabular-nums">
              {currentUser.followingCount || 312}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Abonnements</span>
          </div>
        </div>
      </div>

      {/* Shareable Link Card */}
      <ShareLinkCard
        user={currentUser}
        onOpenTestSend={onOpenTestSend}
        onShowToast={onShowToast}
      />

      {/* Profile Publications & Answers */}
      <div className="space-y-3">
        <div className="flex p-1 bg-[#14141F] rounded-2xl border border-white/5">
          <button
            onClick={() => setProfileTab('posts')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              profileTab === 'posts' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mes publications ({myPosts.length})
          </button>
          <button
            onClick={() => setProfileTab('received')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              profileTab === 'received' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Réponses aux messages
          </button>
        </div>

        {profileTab === 'posts' && (
          <div className="space-y-3">
            {myPosts.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#14141F] border border-white/5 text-xs text-gray-400">
                Vous n’avez pas encore publié. Partagez votre première réponse depuis la boîte anonyme !
              </div>
            ) : (
              myPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-3xl bg-[#14141F] border border-white/5 space-y-2.5"
                >
                  {post.anonQuestion && (
                    <div
                      className={`p-3 rounded-2xl ${
                        CARD_THEMES[post.anonQuestion.cardTheme]?.bgGradient || 'bg-purple-600'
                      } text-white`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-80 block mb-0.5">
                        Question anonyme :
                      </span>
                      <p className="text-xs font-medium">"{post.anonQuestion.content}"</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-200 leading-relaxed font-medium">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3.5 h-3.5 fill-rose-400" />
                      <span>{post.likesCount} j’aime</span>
                    </span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {profileTab === 'received' && (
          <div className="space-y-3">
            {anonMessages.filter((m) => m.isAnswered).map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-3xl bg-[#14141F] border border-white/5 space-y-2"
              >
                <div className={`p-3 rounded-2xl ${CARD_THEMES[m.cardTheme]?.bgGradient} text-white text-xs`}>
                  <p className="font-semibold">"{m.content}"</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#0B0B10] border border-white/5 text-xs text-purple-300">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Votre réponse :</span>
                  <p>{m.answerText}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
