import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile, Conversation } from '../../types';
import { MessageSquarePlus, Search, ShieldCheck } from 'lucide-react';

interface ConversationListProps {
  onSelectConversation: (convId: string) => void;
  onOpenNewChat: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onOpenNewChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const conversations = db.getConversations();

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const nameMatch = c.otherMember.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const usernameMatch = c.otherMember.username.toLowerCase().includes(searchQuery.toLowerCase());
    const messageMatch = c.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || usernameMatch || messageMatch;
  });

  return (
    <div className="space-y-3">
      {/* Search & New Chat Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-2xl bg-[#14141F] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>

        <button
          onClick={onOpenNewChat}
          aria-label="Nouvelle conversation"
          className="h-10 px-3.5 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-95 shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau chat</span>
        </button>
      </div>

      {/* Conversations Items */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-[#14141F] border border-white/5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mb-2">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">Aucune conversation trouvée</h4>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Démarrez une discussion privée avec un autre membre de VYBZ.
          </p>
          <button
            onClick={onOpenNewChat}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Lancer un chat privé
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredConversations.map((c) => {
            const timeAgo = formatTimeAgo(c.lastMessage?.createdAt || c.updatedAt);
            const hasUnread = (c.unreadCount || 0) > 0;

            return (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left ${
                  hasUnread
                    ? 'bg-[#1C172E] border border-purple-500/30'
                    : 'bg-[#14141F] hover:bg-[#1A1A28] border border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div className="relative shrink-0">
                    <img
                      src={c.otherMember.avatarUrl}
                      alt={c.otherMember.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                    {c.otherMember.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#14141F]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-white text-sm truncate">
                          {c.otherMember.displayName}
                        </span>
                        {c.otherMember.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">{timeAgo}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${hasUnread ? 'text-purple-200 font-semibold' : 'text-gray-400'}`}>
                        {c.lastMessage ? c.lastMessage.content : 'Nouvelle conversation'}
                      </p>
                      {hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}
