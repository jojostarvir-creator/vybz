import React, { useState } from 'react';
import { db, isRealSupabaseConfigured, configureSupabase, resetSupabaseConfig } from '../../lib/supabase';
import { UserPreferences, UserProfile } from '../../types';
import { 
  X, 
  Shield, 
  Bell, 
  UserX, 
  Database, 
  FileText, 
  LogOut, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'blocked' | 'database' | 'legal'>('privacy');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [prefs, setPrefs] = useState<UserPreferences>(db.getUserPreferences());

  if (!isOpen) return null;

  const blockedUsers = db.getBlockedUsers();

  const handleTogglePref = (key: keyof UserPreferences) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key]
    };
    setPrefs(updated);
    db.updateUserPreferences({ [key]: updated[key] });
    onShowToast('Paramètres mis à jour.', 'info');
  };

  const handleUnblock = (userId: string) => {
    db.unblockUser(userId);
    onShowToast('Utilisateur débloqué.', 'success');
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      onShowToast('Veuillez renseigner l’URL et la clé Supabase.', 'error');
      return;
    }
    configureSupabase(supabaseUrl.trim(), supabaseKey.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131320] border border-white/10 rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
          <h3 className="text-base font-bold font-display text-white">Paramètres</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-white/5">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'privacy' ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Confidentialité & Sécurité
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'blocked' ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Bloqués ({blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'database' ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Supabase / Backend
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'legal' ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Légal & CGU
          </button>
        </div>

        {/* TAB 1: PRIVACY */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181827] border border-white/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Recevoir des messages anonymes</h4>
                  <p className="text-[11px] text-gray-400">Votre lien personnel reste actif</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePref('allowAnonymousMessages')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    prefs.allowAnonymousMessages ? 'bg-[#8B5CF6]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.allowAnonymousMessages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181827] border border-white/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Afficher mon statut en ligne</h4>
                  <p className="text-[11px] text-gray-400">Pastille verte visible dans le chat</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePref('showOnlineStatus')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    prefs.showOnlineStatus ? 'bg-[#8B5CF6]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181827] border border-white/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Filtre anti-spam et harcèlement strict</h4>
                  <p className="text-[11px] text-gray-400">Bloque les messages suspects automatiquement</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePref('strictSpamFilter')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    prefs.strictSpamFilter ? 'bg-[#8B5CF6]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.strictSpamFilter ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181827] border border-white/5">
                <div>
                  <h4 className="text-xs font-semibold text-white">Notifications push</h4>
                  <p className="text-[11px] text-gray-400">Pour les messages privés et anonymes reçus</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePref('pushNotificationsEnabled')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    prefs.pushNotificationsEnabled ? 'bg-[#8B5CF6]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      prefs.pushNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Changer de profil démo (Maya / Alexandre / Sarah)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BLOCKED USERS */}
        {activeTab === 'blocked' && (
          <div className="space-y-3">
            {blockedUsers.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#181827] text-gray-400 text-xs">
                Aucun utilisateur bloqué. Vous pouvez bloquer un utilisateur depuis un chat privé ou un profil.
              </div>
            ) : (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#181827] border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{user.displayName}</h4>
                      <span className="text-[10px] text-gray-400">@{user.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(user.id)}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                  >
                    Débloquer
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SUPABASE BACKEND */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#181827] border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Statut Backend</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isRealSupabaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {isRealSupabaseConfigured ? 'Connecté à Supabase' : 'Moteur Réactif Local Actif'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Le schéma SQL complet avec toutes les tables (profiles, anonymous_messages, conversations, chat_messages, questions, posts, RLS) est généré dans <code className="text-purple-300">supabase/migrations/20250101_initial_schema.sql</code>.
              </p>

              {/* Action: Copy SQL for custom DB */}
              <button
                type="button"
                onClick={() => {
                  const sqlGuide = `-- Exécutez ce script dans l'éditeur SQL de votre base Supabase / PostgreSQL :
-- Le fichier complet se trouve dans: supabase/migrations/20250101_initial_schema.sql`;
                  navigator.clipboard.writeText(sqlGuide);
                  onShowToast('Chemin du script SQL copié : supabase/migrations/20250101_initial_schema.sql', 'success');
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mb-1"
              >
                <FileText className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Voir le script SQL de migration</span>
              </button>
            </div>

            {/* Guide VS Code */}
            <div className="p-3.5 rounded-2xl bg-[#0B0B10] border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Ouvrir ce projet dans VS Code :</span>
              </h4>
              <ol className="text-[11px] text-gray-400 list-decimal list-inside space-y-1">
                <li>Téléchargez le projet via le bouton en haut d’AI Studio ou Git.</li>
                <li>Ouvrez le dossier dans VS Code : <code className="text-purple-300">code .</code></li>
                <li>Installez les paquets : <code className="text-purple-300">npm install</code></li>
                <li>Copiez <code className="text-purple-300">.env.example</code> vers <code className="text-purple-300">.env</code> avec vos clés.</li>
                <li>Lancez : <code className="text-purple-300">npm run dev</code></li>
              </ol>
            </div>

            <form onSubmit={handleSaveSupabase} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  URL de votre projet Supabase :
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Clé publique Anon :
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0B10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors"
                >
                  Connecter mon Supabase
                </button>
                {isRealSupabaseConfigured && (
                  <button
                    type="button"
                    onClick={resetSupabaseConfig}
                    className="px-3 h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: LEGAL & SAFETY */}
        {activeTab === 'legal' && (
          <div className="space-y-3 text-xs text-gray-300 leading-relaxed max-h-80 overflow-y-auto no-scrollbar">
            <h4 className="font-bold text-white text-sm">Engagement de Sécurité & Modération VYBZ</h4>
            <p>
              VYBZ a été conçu selon des principes stricts de confidentialité, de protection contre le cyberharcèlement et de sécurité des communications.
            </p>
            <h5 className="font-semibold text-white">Anonymat et responsabilité :</h5>
            <p>
              L’anonymat des messages envoyés via le lien personnel est protégé au niveau des tables destinataires. Aucun identifiant utilisateur n’est visible ou révélé sans action légale ou modération. Les filtres anti-spam et les règles RLS empêchent la lecture croisée non autorisée.
            </p>
            <h5 className="font-semibold text-white">Signalement et blocage :</h5>
            <p>
              Tout utilisateur a le pouvoir instantané de bloquer un expéditeur ou de signaler tout message abusif. Les messages signalés sont stockés dans la table de modération avec statut d'examen.
            </p>
          </div>
        )}

        {/* Footer Logout / Switch */}
        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Changer de compte / Se déconnecter</span>
          </button>

          <span className="text-[10px] text-gray-500 font-mono">v1.0.0 · VYBZ Mobile</span>
        </div>
      </div>
    </div>
  );
};
