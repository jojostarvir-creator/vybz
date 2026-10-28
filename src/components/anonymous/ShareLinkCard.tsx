import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Copy, Check, Sparkles, ExternalLink, Share2, Instagram } from 'lucide-react';

interface ShareLinkCardProps {
  user: UserProfile;
  onOpenTestSend: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareLinkCard: React.FC<ShareLinkCardProps> = ({
  user,
  onOpenTestSend,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://vybz.app/u/${user.username}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShowToast('Lien copié dans le presse-papier ! ✨', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Lien : ' + shareUrl, 'info');
    }
  };

  const handleStoryStickerCopy = () => {
    try {
      navigator.clipboard.writeText(`🔥 Envoyez-moi des vérités anonymes : ${shareUrl}`);
      onShowToast('Texte pour Story Instagram / Snapchat copié !', 'success');
    } catch {}
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C162E] via-[#141424] to-[#0E0E18] border border-purple-500/30 shadow-xl relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F472B6]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-purple-300">
                Lien Anonyme Personnel
              </h3>
              <p className="text-[11px] text-gray-400">Prêt pour vos réseaux sociaux</p>
            </div>
          </div>

          <button
            onClick={onOpenTestSend}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Tester l’envoi</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Link Field */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B0B10] border border-white/10 mb-3">
          <span className="text-xs text-purple-400 font-mono truncate flex-1 pl-2">
            vybz.app/u/{user.username}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Social Quick Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleStoryStickerCopy}
            className="py-2 px-3 rounded-xl bg-[#201A33] hover:bg-[#282142] border border-purple-500/20 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Instagram className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>Coller en Story</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-2 px-3 rounded-xl bg-[#1A1A28] hover:bg-[#232336] border border-white/5 text-gray-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Partager le lien</span>
          </button>
        </div>
      </div>
    </div>
  );
};
