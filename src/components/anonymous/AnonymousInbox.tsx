import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { AnonymousMessage } from '../../types';
import { CARD_THEMES } from '../../lib/theme';
import { MessageSquare, Sparkles, Trash2, Flag, Eye, CheckCircle2, Share2, Send } from 'lucide-react';

interface AnonymousInboxProps {
  onOpenShareModal: () => void;
  onOpenSendModalToSelf?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnonymousInbox: React.FC<AnonymousInboxProps> = ({
  onOpenShareModal,
  onOpenSendModalToSelf,
  onShowToast
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'answered'>('all');
  const [activeHintMessage, setActiveHintMessage] = useState<AnonymousMessage | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<AnonymousMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportingMessage, setReportingMessage] = useState<AnonymousMessage | null>(null);
  const [reportReason, setReportReason] = useState('spam');

  const messages = db.getAnonymousMessages();

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'answered') return m.isAnswered;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleCardClick = (m: AnonymousMessage) => {
    if (!m.isRead) {
      db.markAnonymousMessageRead(m.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    db.deleteAnonymousMessage(msgId);
    onShowToast('Message supprimé.', 'info');
  };

  const handleOpenReply = (e: React.MouseEvent, m: AnonymousMessage) => {
    e.stopPropagation();
    if (!m.isRead) db.markAnonymousMessageRead(m.id);
    setReplyingMessage(m);
    setReplyText(m.answerText || '');
  };

  const handlePublishReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessage || !replyText.trim()) return;

    db.replyToAnonymousMessage(replyingMessage.id, replyText.trim(), true);
    setReplyingMessage(null);
    setReplyText('');
    onShowToast('Réponse publiée sur votre profil et le fil communautaire ! ✨', 'success');
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMessage) return;

    db.reportContent({
      targetType: 'anonymous_message',
      targetId: reportingMessage.id,
      reason: reportReason,
      details: 'Signalement utilisateur depuis la boîte de réception'
    });

    setReportingMessage(null);
    onShowToast('Message signalé à l’équipe de modération.', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Stats */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1E1430] to-[#141423] border border-purple-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">Boîte Anonyme</h2>
              <p className="text-[11px] text-gray-400">
                {unreadCount > 0 ? `${unreadCount} nouveau(x) mot(s) non lu(s)` : 'Tous vos messages sont à jour'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenShareModal}
            className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partager mon lien</span>
          </button>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex p-1 bg-[#0B0B10]/80 rounded-xl border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tous ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'unread' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Non lus ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('answered')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'answered' ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Répondus ({messages.filter((m) => m.isAnswered).length})
          </button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-[#14141F] border border-white/5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mb-3">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Aucun message pour l’instant</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 mb-4">
            Partagez votre lien secret sur Instagram, Snapchat, TikTok ou WhatsApp pour recevoir des confidences !
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={onOpenShareModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Copier mon lien VYBZ
            </button>
            {onOpenSendModalToSelf && (
              <button
                onClick={onOpenSendModalToSelf}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-semibold transition-colors"
              >
                Tester un envoi à moi-même
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredMessages.map((msg) => {
            const theme = CARD_THEMES[msg.cardTheme] || CARD_THEMES.purple_gradient;
            const timeAgo = formatTimeAgo(msg.createdAt);

            return (
              <div
                key={msg.id}
                onClick={() => handleCardClick(msg)}
                className={`p-4 rounded-2xl ${theme.bgGradient} ${theme.textColor} shadow-md border ${theme.borderColor} relative transition-transform hover:-translate-y-0.5 cursor-pointer`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.accentBadge}`}>
                      {msg.promptTag || 'Anonyme'}
                    </span>
                    {!msg.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-black/40" />
                    )}
                  </div>
                  <span className="text-[11px] opacity-75">{timeAgo}</span>
                </div>

                {/* Message text */}
                <p className="text-sm font-medium leading-relaxed mb-3">
                  "{msg.content}"
                </p>

                {/* Already answered snippet */}
                {msg.isAnswered && msg.answerText && (
                  <div className="mb-3 p-2.5 rounded-xl bg-black/35 backdrop-blur-sm border border-white/10 text-xs">
                    <span className="text-[10px] uppercase font-bold text-purple-300 block mb-0.5">
                      Votre réponse publique :
                    </span>
                    <p className="text-gray-200 font-normal">"{msg.answerText}"</p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
                  <div className="flex items-center gap-2">
                    {msg.hint && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHintMessage(msg);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Indice</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleOpenReply(e, msg)}
                      className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{msg.isAnswered ? 'Modifier réponse' : 'Répondre'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportingMessage(msg);
                      }}
                      title="Signaler un contenu abusif"
                      className="p-1.5 rounded-lg hover:bg-black/25 text-white/70 hover:text-rose-300 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, msg.id)}
                      title="Supprimer le message"
                      className="p-1.5 rounded-lg hover:bg-black/25 text-white/70 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clue / Hint Modal */}
      {activeHintMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#161625] border border-purple-500/30 rounded-3xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 text-[#8B5CF6] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-display text-white">Indice de l’expéditeur</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Cet indice a été choisi volontairement par l’auteur sans révéler son identité :
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0B0B10] border border-white/10 text-purple-300 text-sm font-semibold mb-5">
              {activeHintMessage.hint}
            </div>

            <button
              onClick={() => setActiveHintMessage(null)}
              className="w-full py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors"
            >
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* Story-Style Reply Modal */}
      {replyingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131320] border border-white/10 rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-white">Répondre au message</h3>
              <button
                onClick={() => setReplyingMessage(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Sticker Preview */}
            <div className={`p-4 rounded-2xl ${CARD_THEMES[replyingMessage.cardTheme]?.bgGradient} text-white mb-4 shadow-lg`}>
              <span className="text-[10px] font-bold uppercase opacity-80 block mb-1">
                Message anonyme reçu :
              </span>
              <p className="text-sm font-medium">"{replyingMessage.content}"</p>
            </div>

            <form onSubmit={handlePublishReply} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Votre réponse publique :
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse ici... Elle apparaîtra sur votre fil et profil !"
                  className="w-full p-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                <span>Cette réponse sera visible par vos abonnés dans le fil communautaire.</span>
              </div>

              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publier ma réponse</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#151523] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold font-display text-white mb-1">Signaler ce message</h3>
            <p className="text-xs text-gray-400 mb-4">
              Aidez-nous à garder VYBZ bienveillant et sécurisé.
            </p>

            <form onSubmit={handleReport} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Motif :</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="spam">Spam ou publicité non désirée</option>
                  <option value="harassment">Harcèlement ou propos intimidants</option>
                  <option value="hate_speech">Incitation à la haine ou discrimination</option>
                  <option value="inappropriate">Contenu explicite ou inapproprié</option>
                  <option value="other">Autre motif</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingMessage(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold hover:bg-white/15"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
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
