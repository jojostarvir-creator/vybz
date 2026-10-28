import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { Search, X, MessageSquare, ShieldCheck } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectUser
}) => {
  const [search, setSearch] = useState('');
  const currentUser = db.getCurrentUser();
  const profiles = db.getProfiles().filter((p) => p.id !== currentUser.id);

  if (!isOpen) return null;

  const filtered = profiles.filter((p) => {
    if (!search.trim()) return true;
    return (
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#131320] border border-white/10 rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <h3 className="text-base font-bold font-display text-white">Nouveau message privé</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par @pseudo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {filtered.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelectUser(user.id);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#181827] hover:bg-[#202035] border border-white/5 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#181827]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {user.displayName}
                    </span>
                    {user.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">@{user.username}</span>
                </div>
              </div>

              <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-[#8B5CF6] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
