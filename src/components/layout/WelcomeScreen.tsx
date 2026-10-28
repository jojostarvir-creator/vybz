import React from 'react';
import { Sparkles, MessageSquare, Shield, ArrowRight, Flame } from 'lucide-react';

interface WelcomeScreenProps {
  onStartSignUp: () => void;
  onStartSignIn: () => void;
  onStartDemo: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSignUp,
  onStartSignIn,
  onStartDemo
}) => {
  return (
    <div className="min-h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#0B0B10] via-[#12121E] to-[#0B0B10] text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#F472B6]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] p-0.5 shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-[#0B0B10] rounded-[10px] flex items-center justify-center">
              <span className="font-display font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">
                V
              </span>
            </div>
          </div>
          <span className="font-display font-extrabold text-lg tracking-wider text-white">
            VYBZ
          </span>
        </div>

        <button
          onClick={onStartDemo}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 transition-colors"
        >
          Démo immédiate
        </button>
      </div>

      {/* Hero Body */}
      <div className="my-auto py-8 relative z-10 space-y-6 text-center">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-medium text-purple-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>La nouvelle génération sociale</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
          Parlez sans filtre.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#38BDF8]">
            Vibrez en toute liberté.
          </span>
        </h1>

        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
          Recevez des messages anonymes sincères, discutez en direct dans un vrai chat privé chiffré et partagez vos pensées avec votre communauté.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 text-left">
          <div className="p-3 rounded-2xl bg-[#151523]/80 border border-white/5 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#8B5CF6] mb-1.5" />
            <h4 className="text-xs font-bold text-white mb-0.5">Boîte Anonyme</h4>
            <p className="text-[11px] text-gray-400">Lien personnel partageable sur Instagram et Snapchat.</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#151523]/80 border border-white/5 backdrop-blur-sm">
            <MessageSquare className="w-4 h-4 text-[#EC4899] mb-1.5" />
            <h4 className="text-xs font-bold text-white mb-0.5">Chat Privé Live</h4>
            <p className="text-[11px] text-gray-400">Messagerie instantanée en temps réel et statuts de lecture.</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#151523]/80 border border-white/5 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-emerald-400 mb-1.5" />
            <h4 className="text-xs font-bold text-white mb-0.5">Anti-Spam & RLS</h4>
            <p className="text-[11px] text-gray-400">Modération stricte, signalement et sécurité PostgreSQL.</p>
          </div>
        </div>
      </div>

      {/* Bottom Action CTAs */}
      <div className="relative z-10 space-y-2.5 pb-2">
        <button
          onClick={onStartSignUp}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#EC4899] text-white font-semibold text-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-600/25"
        >
          <span>Créer un compte</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onStartSignIn}
          className="w-full h-11 rounded-2xl bg-[#181827] hover:bg-[#202033] border border-white/10 text-gray-200 text-xs font-semibold transition-colors"
        >
          Déjà un compte ? Se connecter
        </button>

        <button
          onClick={onStartDemo}
          className="w-full text-center text-[11px] text-gray-400 hover:text-white py-1 transition-colors"
        >
          Ou explorer directement en mode invité →
        </button>
      </div>
    </div>
  );
};
