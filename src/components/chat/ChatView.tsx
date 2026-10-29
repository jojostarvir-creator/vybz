import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile, ChatMessage } from '../../types';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  ShieldAlert, 
  UserX, 
  Smile, 
  Sparkles,
  Bot,
  Lock
} from 'lucide-react';

interface ChatViewProps {
  conversationId: string;
  onBack: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👀', '✨', '⚡'];

export const ChatView: React.FC<ChatViewProps> = ({
  conversationId,
  onBack,
  onShowToast
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = db.getCurrentUser();
  const conv = db.getConversations().find((c) => c.id === conversationId);
  const otherMember = conv?.otherMember || db.getProfiles()[1];
  const messages = db.getChatMessages(conversationId);
  const isRevealed = db.isUserRevealed(otherMember.id);
  const ghostInfo = db.getGhostInfo(otherMember);
  const displayName = isRevealed ? otherMember.displayName : ghostInfo.ghostName;
  const hasPendingRevealRequest = db.hasPendingIdentityRevealRequest(otherMember.id);
  const hasIncomingRevealRequest = db.getPendingIdentityRevealRequest(otherMember.id);
  const hasSharedIdentity = db.hasApprovedIdentityRevealRequest(otherMember.id);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    db.markConversationRead(conversationId);
  }, [messages.length, conversationId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const sent = db.sendChatMessage(conversationId, inputText.trim());
    if (sent) {
      setInputText('');
      
      // Simulate other user typing and responding after 1.8 seconds if desired
      if (otherMember.id === 'user_alex' || otherMember.id === 'user_maya') {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const smartReplies = [
              'Carrément d’accord avec toi ! ✨',
              'Haha c’est exactement ça 😂',
              'Trop hâte de voir ce que ça donne sur mobile !',
              'Yes ! Tu as reçu d’autres messages anonymes ?',
              'On se cale un vocal un peu plus tard ?'
            ];
            const randomReply = smartReplies[Math.floor(Math.random() * smartReplies.length)];
            
            // Send as other user
            const currentActiveId = db.getCurrentUser().id;
            db.setCurrentUser(otherMember.id);
            db.sendChatMessage(conversationId, randomReply);
            db.setCurrentUser(currentActiveId);
          }, 1500);
        }, 1000);
      }
    }
  };

  const handleSimulateReply = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const currentActiveId = db.getCurrentUser().id;
      db.setCurrentUser(otherMember.id);
      db.sendChatMessage(conversationId, `Message test en temps réel envoyé depuis le compte de ${displayName} ! 🚀`);
      db.setCurrentUser(currentActiveId);
      onShowToast(`Réponse reçue de ${displayName}`, 'info');
    }, 1000);
  };

  const handleRequestReveal = () => {
    const requested = db.requestIdentityReveal(otherMember.id);
    onShowToast(
      requested
        ? 'Demande enregistrée dans cette démo locale. La personne doit donner son accord.'
        : 'Une demande est déjà en attente ou cette identité est déjà partagée.',
      'info'
    );
  };

  const handleConsentToReveal = () => {
    if (db.consentToRevealIdentity(otherMember.id)) {
      onShowToast('Tu as accepté de partager ton identité avec cette personne.', 'success');
    } else {
      onShowToast('Cette demande n’est plus disponible.', 'error');
    }
  };

  const handleBlock = () => {
    db.blockUser(otherMember.id);
    setShowMenu(false);
    onShowToast(`${displayName} a été bloqué(e).`, 'info');
    onBack();
  };

  const handleReport = () => {
    db.reportContent({
      targetType: 'chat_message',
      targetId: conversationId,
      reportedUserId: otherMember.id,
      reason: 'Signalement de chat privé'
    });
    setShowMenu(false);
    onShowToast('Conversation signalée à l’équipe de sécurité.', 'info');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0E0E17] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#141422] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            aria-label="Retour"
            className="p-1.5 -ml-1 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {isRevealed ? (
              <img
                src={otherMember.avatarUrl}
                alt={otherMember.displayName}
                className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-950 flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
            )}

            <div>
              <p className="font-semibold text-white text-xs">{displayName}</p>
              <p className="text-[10px] text-gray-400">
                {isRevealed ? 'Identité partagée avec consentement' : 'Identité masquée jusqu’à son accord'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isRevealed ? (
            <span className="px-2 py-1 text-[10px] font-semibold text-emerald-400">Accord donné ✓</span>
          ) : hasSharedIdentity ? (
            <span className="px-2 py-1 text-[10px] text-emerald-400">Identité partagée ✓</span>
          ) : hasIncomingRevealRequest ? (
            <button
              onClick={handleConsentToReveal}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-bold"
            >
              Partager mon identité
            </button>
          ) : hasPendingRevealRequest ? (
            <span className="px-2 py-1 text-[10px] text-gray-400">En attente d’accord</span>
          ) : (
            <button
              onClick={handleRequestReveal}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[10px] font-bold"
            >
              Demander l’accord
            </button>
          )}

          {/* Quick test reply generator */}
          <button
            onClick={handleSimulateReply}
            title={`Simuler réponse instantanée de ${displayName}`}
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Bot className="w-3 h-3" />
            <span className="hidden sm:inline">Simuler réponse</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#1B1B2C] border border-white/10 rounded-2xl p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleBlock}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Bloquer {displayName}</span>
                </button>
                <button
                  onClick={handleReport}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors text-left"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Signaler la discussion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {/* Safe Encryption Notice */}
        <div className="text-center my-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400">
            <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
            <span>Chat privé chiffré de bout en bout</span>
          </div>
        </div>

        {messages.map((m) => {
          const isMe = m.senderId === currentUser.id;
          const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed relative shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-tr-none'
                    : 'bg-[#1C1C2B] text-gray-200 border border-white/5 rounded-tl-none'
                }`}
              >
                <p className="break-words font-medium">{m.content}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    isMe ? 'text-purple-200' : 'text-gray-400'
                  }`}
                >
                  <span>{time}</span>
                  {isMe && (
                    <span>
                      {m.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                      ) : m.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-purple-200" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-purple-200" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 italic py-1 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-ping" />
            </div>
            <span>{displayName} écrit un message...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reaction bar */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-[#141422] border-t border-white/5 flex items-center justify-around">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#141422] border-t border-white/10 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message pour ${displayName}...`}
          className="flex-1 h-10 px-3.5 rounded-2xl bg-[#0B0B10] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-500/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
