import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { Post, Question, Story } from '../../types';
import { CARD_THEMES } from '../../lib/theme';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  Image as ImageIcon,
  Send,
  ShieldCheck
} from 'lucide-react';

interface CommunityFeedProps {
  onOpenQuestionModal: () => void;
  onOpenSendAnon: (targetUser: any) => void;
  onOpenCreateStory: () => void;
  onOpenStoryViewer: (stories: Story[], startIndex: number) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  onOpenQuestionModal,
  onOpenSendAnon,
  onOpenCreateStory,
  onOpenStoryViewer,
  onShowToast
}) => {
  const [feedTab, setFeedTab] = useState<'posts' | 'questions'>('posts');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const currentUser = db.getCurrentUser();
  const profiles = db.getProfiles();
  const posts = db.getPosts();
  const questions = db.getQuestions();
  const allStories = db.getStories();
  const myStories = allStories.filter((s) => s.authorId === currentUser.id);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    db.createPost(newPostContent.trim());
    setNewPostContent('');
    setIsPosting(false);
    onShowToast('Publication partagée avec succès ! 🚀', 'success');
  };

  const handleToggleLike = (postId: string) => {
    db.togglePostLike(postId);
  };

  const handleToggleQuestionLike = (qId: string) => {
    db.toggleQuestionLike(qId);
  };

  const handleSharePost = (content: string) => {
    try {
      navigator.clipboard.writeText(`"${content}" - vu sur VYBZ`);
      onShowToast('Lien de publication copié !', 'info');
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Vibe Avatars Stories Carousel */}
      <div className="p-3 bg-[#14141F] rounded-3xl border border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 min-w-max">
          {/* My Story Add / View */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div 
              onClick={() => {
                if (myStories.length > 0) {
                  const idx = allStories.findIndex((s) => s.id === myStories[0].id);
                  onOpenStoryViewer(allStories, idx >= 0 ? idx : 0);
                } else {
                  onOpenCreateStory();
                }
              }}
              className="relative"
            >
              <img
                src={currentUser.avatarUrl}
                alt="Moi"
                className={`w-14 h-14 rounded-full object-cover p-0.5 group-hover:scale-105 transition-transform ${
                  myStories.length > 0
                    ? 'border-2 border-[#8B5CF6] shadow-md shadow-purple-500/30'
                    : 'border-2 border-dashed border-[#8B5CF6]/60'
                }`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateStory();
                }}
                title="Créer une nouvelle story"
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:scale-110 transition-transform"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-gray-300 font-medium">
              {myStories.length > 0 ? 'Votre story' : 'Votre vibe'}
            </span>
          </div>

          {/* Other Members Stories */}
          {profiles.map((p) => {
            if (p.id === currentUser.id) return null;
            const userStories = allStories.filter((s) => s.authorId === p.id);
            const hasStory = userStories.length > 0;

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (hasStory) {
                    const idx = allStories.findIndex((s) => s.id === userStories[0].id);
                    onOpenStoryViewer(allStories, idx >= 0 ? idx : 0);
                  } else {
                    onOpenSendAnon(p);
                  }
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
                title={hasStory ? `Voir la story de ${p.displayName}` : `Envoyer un mot à ${p.displayName}`}
              >
                <div className={`p-0.5 rounded-full group-hover:scale-105 transition-transform ${
                  hasStory
                    ? 'bg-gradient-to-tr from-[#8B5CF6] via-[#EC4899] to-[#38BDF8] shadow-md shadow-purple-500/20'
                    : 'border border-white/20'
                }`}>
                  <img
                    src={p.avatarUrl}
                    alt={p.displayName}
                    className="w-13 h-13 rounded-full object-cover border-2 border-[#14141F]"
                  />
                </div>
                <span className="text-[11px] text-gray-400 group-hover:text-white transition-colors truncate max-w-[64px]">
                  {p.displayName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Segmented Feed Switcher */}
      <div className="flex p-1 bg-[#14141F] rounded-2xl border border-white/5">
        <button
          onClick={() => setFeedTab('posts')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            feedTab === 'posts'
              ? 'bg-[#8B5CF6] text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Fil d’actualité ({posts.length})
        </button>
        <button
          onClick={() => setFeedTab('questions')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            feedTab === 'questions'
              ? 'bg-[#8B5CF6] text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Questions publiques Q&A ({questions.length})
        </button>
      </div>

      {/* POSTS TAB CONTENT */}
      {feedTab === 'posts' && (
        <div className="space-y-4">
          {/* Quick Post Creator */}
          <form
            onSubmit={handleCreatePost}
            className="p-3.5 bg-[#14141F] rounded-3xl border border-white/10 shadow-lg space-y-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
              />
              <input
                type="text"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Partagez une vibe, une pensée ou une update..."
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenQuestionModal}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#8B5CF6] text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Poser une question</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newPostContent.trim() || isPosting}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Publier</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>

          {/* Posts Feed Items */}
          <div className="space-y-3.5">
            {posts.map((post) => {
              const time = formatTimeAgo(post.createdAt);

              return (
                <div
                  key={post.id}
                  className="p-4 rounded-3xl bg-[#14141F] border border-white/5 shadow-md hover:border-white/10 transition-colors"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.displayName}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white text-xs">
                            {post.author.displayName}
                          </span>
                          {post.author.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          @{post.author.username} · {time}
                        </span>
                      </div>
                    </div>

                    {/* Anonymous action trigger */}
                    {post.authorId !== currentUser.id && (
                      <button
                        onClick={() => onOpenSendAnon(post.author)}
                        className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-purple-300 text-[10px] font-semibold transition-colors"
                      >
                        Envoyer un mot
                      </button>
                    )}
                  </div>

                  {/* Anonymous Question sticker if this post is a response */}
                  {post.anonQuestion && (
                    <div
                      className={`p-3.5 rounded-2xl mb-3 shadow-md ${
                        CARD_THEMES[post.anonQuestion.cardTheme]?.bgGradient || 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      } text-white`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase opacity-80 mb-1">
                        <span>Message anonyme reçu</span>
                        {post.anonQuestion.hint && (
                          <span className="opacity-90">{post.anonQuestion.hint.split('·')[0]}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold leading-snug">
                        "{post.anonQuestion.content}"
                      </p>
                    </div>
                  )}

                  {/* Post Content */}
                  <p className="text-xs text-gray-200 leading-relaxed font-normal mb-3 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Optional Image */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden mb-3 border border-white/5">
                      <img
                        src={post.imageUrl}
                        alt="Image post"
                        className="w-full max-h-72 object-cover"
                      />
                    </div>
                  )}

                  {/* Reaction Bar */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-gray-400 text-xs">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.hasLiked ? 'text-rose-400 font-semibold' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-400' : ''}`}
                      />
                      <span>{post.likesCount}</span>
                    </button>

                    <button
                      onClick={() => onShowToast('Commentaires bientôt disponibles en direct !', 'info')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount}</span>
                    </button>

                    <button
                      onClick={() => handleSharePost(post.content)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Partager</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUESTIONS TAB CONTENT */}
      {feedTab === 'questions' && (
        <div className="space-y-3.5">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C162E] to-[#141423] border border-purple-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Questions communautaires</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Posez une question et recevez des réponses publiques ou anonymes.
              </p>
            </div>
            <button
              onClick={onOpenQuestionModal}
              className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Poser</span>
            </button>
          </div>

          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-3xl bg-[#14141F] border border-white/5 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[#8B5CF6] text-[10px] font-semibold uppercase">
                    {q.category}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    par @{q.user?.username}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {formatTimeAgo(q.createdAt)}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white leading-snug">
                {q.title}
              </h4>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
                <button
                  onClick={() => handleToggleQuestionLike(q.id)}
                  className={`flex items-center gap-1.5 ${
                    q.hasLiked ? 'text-rose-400 font-semibold' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${q.hasLiked ? 'fill-rose-400' : ''}`} />
                  <span>{q.likesCount}</span>
                </button>

                <button
                  onClick={() => onShowToast('Réponse ajoutée au fil des réponses !', 'success')}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                >
                  Répondre à la question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}
