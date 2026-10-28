import React from 'react';
import { Home, Sparkles, MessageCircle, Compass, User } from 'lucide-react';

export type TabDestination = 'feed' | 'inbox' | 'chat' | 'discover' | 'profile';

interface BottomTabBarProps {
  activeTab: TabDestination;
  onTabChange: (tab: TabDestination) => void;
  anonUnreadCount: number;
  chatUnreadCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  anonUnreadCount,
  chatUnreadCount
}) => {
  const tabs: { id: TabDestination; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'feed',
      label: 'Fil',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'inbox',
      label: 'Anonymes',
      icon: <Sparkles className="w-5 h-5" />,
      badge: anonUnreadCount
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      badge: chatUnreadCount
    },
    {
      id: 'discover',
      label: 'Découvrir',
      icon: <Compass className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav className="h-16 bg-[#0E0E18]/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 items-center px-1 shrink-0 z-40 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] w-full py-1 relative transition-transform active:scale-90"
          >
            <div className="relative">
              <div
                className={`transition-colors duration-200 ${
                  isActive ? 'text-[#8B5CF6]' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.icon}
              </div>

              {/* Badge */}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#EC4899] to-[#E11D48] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0E0E18] animate-in zoom-in-75">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              ) : null}
            </div>

            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                isActive ? 'text-[#8B5CF6] font-semibold' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>

            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#8B5CF6] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
