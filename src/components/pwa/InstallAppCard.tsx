import React, { useState } from 'react';
import { Download, Share } from 'lucide-react';
import { isIosDevice } from '../../lib/usePwaInstall';

interface InstallAppCardProps {
  installed: boolean;
  canPromptInstall: boolean;
  onInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InstallAppCard: React.FC<InstallAppCardProps> = ({
  installed,
  canPromptInstall,
  onInstall,
  onShowToast
}) => {
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  const handleInstall = async () => {
    if (installed) return;

    if (canPromptInstall) {
      try {
        const outcome = await onInstall();
        if (outcome === 'accepted') {
          onShowToast('VYBZ va être ajoutée à votre écran d’accueil.', 'success');
        }
      } catch {
        onShowToast('L’installation de VYBZ n’a pas pu démarrer. Réessayez depuis le menu du navigateur.', 'error');
      }
      return;
    }

    if (isIosDevice()) {
      setShowIosInstructions(true);
      return;
    }

    onShowToast(
      'Ouvrez le menu de votre navigateur, puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».',
      'info'
    );
  };

  return (
    <>
      <section className="p-4 rounded-3xl bg-gradient-to-r from-[#211638] to-[#171321] border border-purple-400/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white">Installer VYBZ</h3>
            <p className="text-[11px] text-gray-400">Ajoutez l’application à votre écran d’accueil</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          disabled={installed}
          className="shrink-0 px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:bg-white/10 disabled:text-gray-400 text-white text-xs font-bold transition-colors"
        >
          {installed ? 'Installée' : 'Installer'}
        </button>
      </section>

      {showIosInstructions && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="presentation"
          onClick={() => setShowIosInstructions(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="w-full max-w-sm p-5 rounded-3xl bg-[#131320] border border-white/10 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-11 h-11 mb-4 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <Share className="w-5 h-5" />
            </div>
            <h2 id="ios-install-title" className="text-base font-bold text-white">
              Ajouter VYBZ à l’écran d’accueil
            </h2>
            <ol className="mt-3 space-y-3 text-sm text-gray-300">
              <li>1. Touchez le bouton Partager en bas de Safari.</li>
              <li>2. Faites défiler le menu, puis touchez « Sur l’écran d’accueil ».</li>
              <li>3. Touchez « Ajouter » pour terminer.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold transition-colors"
            >
              Compris
            </button>
          </section>
        </div>
      )}
    </>
  );
};
