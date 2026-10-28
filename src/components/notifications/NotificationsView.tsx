import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { NotificationItem } from '../../types';
import { 
  Bell, 
  MessageSquare, 
  Sparkles, 
  Heart, 
  HelpCircle, 
  CheckCheck,
  ArrowRight
} from 'lucide-react';

interface NotificationsViewProps {
  onOpenConversation: (convId: string) => void;
  onOpenInbox: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenConversation,
  onOpenInbox,
  onShowToast
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const notifications = db.getNotifications();

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (item: NotificationItem) => {
    db.markNotificationAsRead(item.id);

    if (item.data?.conversationId) {
      onOpenConversation(item.data.conversationId);
    } else if (item.data?.anonMessageId || item.type === 'anonymous_message') {
      onOpenInbox();
    }
  };

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead();
    onShowToast('Toutes les notifications sont marquées comme lues', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[#14141F] border border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-[#8B5CF6] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">Notifications</h3>
            <p className="text-[11px] text-gray-400">
              {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes les notifications sont lues'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-[#8B5CF6] hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Tout marquer lu</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-[#14141F] border border-white/5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mb-2">
            <Bell className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">Aucune notification</h4>
          <p className="text-xs text-gray-400 mt-1">
            Les interactions, messages anonymes et chats apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const time = formatTimeAgo(item.createdAt);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !item.isRead
                    ? 'bg-[#1A162B] border-purple-500/30 shadow-md'
                    : 'bg-[#14141F] hover:bg-[#1A1A28] border-white/5'
                }`}
              >
                {/* Icon based on type */}
                <div className="shrink-0 mt-0.5">
                  {item.type === 'anonymous_message' && (
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-[#8B5CF6] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'chat_message' && (
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'reaction' && (
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-rose-400" />
                    </div>
                  )}
                  {item.type === 'question_answer' && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0">{time}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-snug truncate">
                    {item.body}
                  </p>
                </div>

                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#EC4899] shrink-0 self-center" />
                )}
              </div>
            );
          })}
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
