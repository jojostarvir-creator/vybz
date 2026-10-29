import React from 'react';
import { UserProfile } from '../../types';
import { Bell, Smartphone, Monitor, Sparkles, ShieldCheck } from 'lucide-react';

interface TopAppBarProps {
  currentUser: UserProfile;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  isStandalone?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentUser,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenAuth,
  isDeviceFrame,
  onToggleDeviceFrame,
  isStandalone = false
}) => {
  return (
    <header className="h-14 px-4 bg-[#0B0B10]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/20">
          <div className="w-full h-full bg-[#0B0B10] rounded-[6px] flex items-center justify-center">
            <span className="font-display font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]">
              V
            </span>
          </div>
        </div>
        <span className="font-display font-extrabold text-base tracking-wider text-white">
          VYBZ
        </span>
      </div>

      {/* Zone 2: Active User indicator / Switcher */}
      <button
        onClick={onOpenAuth}
        title="Changer de profil de test"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
      >
        <img
          src={currentUser.avatarUrl}
          alt=""
          className="w-5 h-5 rounded-full object-cover border border-purple-500/40"
        />
        <span className="text-[11px] font-semibold text-gray-200 max-w-[80px] truncate">
          {currentUser.displayName.split(' ')[0]}
        </span>
        <span className="text-[9px] text-[#8B5CF6] font-medium hidden sm:inline">Changer</span>
      </button>

      {/* Zone 3: Actions (Notifications & Device Frame Toggle) */}
      <div className="flex items-center gap-1">
        {/* Viewport Frame Toggle (Phone shell vs responsive) */}
        {!isStandalone && (
          <button
            onClick={onToggleDeviceFrame}
            title={isDeviceFrame ? 'Passer en plein écran' : 'Afficher le cadre smartphone'}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            {isDeviceFrame ? (
              <Monitor className="w-4 h-4 text-purple-400" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EC4899] ring-2 ring-[#0B0B10]" />
          )}
        </button>
      </div>
    </header>
  );
};
