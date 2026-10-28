import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'demo'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const profiles = db.getProfiles();

  const handleDemoSelect = (userId: string) => {
    db.setCurrentUser(userId);
    const user = db.getCurrentUser();
    onSuccess(user);
    onClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Le nom d’utilisateur doit contenir entre 3 et 20 caractères.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Le pseudonyme ne peut contenir que des lettres, chiffres et tirets bas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const newUser = db.registerUser(displayName.trim(), username.trim(), email.trim());
        setLoading(false);
        onSuccess(newUser);
        onClose();
      } catch (err: any) {
        setLoading(false);
        setError(err?.message || 'Erreur lors de la création du compte.');
      }
    }, 400);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Look up or default to active
      const found = profiles.find((p) => p.username.toLowerCase() === email.toLowerCase() || p.id === 'user_maya');
      setLoading(false);
      if (found) {
        db.setCurrentUser(found.id);
        onSuccess(found);
        onClose();
      } else {
        setError('Identifiants incorrects ou utilisateur introuvable.');
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#14141F] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#F472B6]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#F472B6] p-0.5 shadow-lg shadow-purple-500/20 mb-3">
            <div className="w-full h-full bg-[#0B0B10] rounded-[14px] flex items-center justify-center">
              <span className="font-display font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#F472B6]">
                V
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">VYBZ</h2>
          <p className="text-xs text-gray-400 mt-1">
            Messagerie anonyme & conversations privées en temps réel
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-[#0B0B10] rounded-xl mb-5 border border-white/5">
          <button
            onClick={() => { setMode('demo'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'demo'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tester un profil
          </button>
          <button
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Inscription
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: Fast Demo Profiles Switcher */}
        {mode === 'demo' && (
          <div className="space-y-2.5">
            <div className="text-[11px] text-gray-400 font-medium px-1 flex items-center justify-between">
              <span>CHOISISSEZ UN COMPTE POUR TESTER LE LIVE :</span>
              <span className="text-[#8B5CF6] text-[10px]">Instant Switch</span>
            </div>

            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleDemoSelect(p.id)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1B1B2A] hover:bg-[#232338] border border-white/5 hover:border-purple-500/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={p.avatarUrl}
                      alt={p.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    {p.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1B1B2A]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {p.displayName}
                      </span>
                      {p.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">@{p.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-white transition-colors">
                  <span>Ouvrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}

            <p className="text-[11px] text-gray-500 text-center mt-3 pt-2 border-t border-white/5">
              Astuce : basculez entre Maya et Alexandre pour tester le chat 2-voies instantané !
            </p>
          </div>
        )}

        {/* MODE 2: Sign In */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email ou @pseudo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="maya_vibe ou maya@vybz.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-medium text-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE 3: Sign Up */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nom d’affichage</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="ex. Emma Laroche"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nom d’utilisateur (@unique)</label>
              <div className="relative">
                <span className="text-gray-500 absolute left-3 top-2.5 text-xs font-bold">@</span>
                <input
                  type="text"
                  placeholder="emma_vibe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="emma@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="6 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-medium text-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
          <span>Chiffrement bout-en-bout & RLS</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white underline underline-offset-2"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
