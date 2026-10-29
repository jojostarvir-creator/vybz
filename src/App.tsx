/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './lib/supabase';
import { UserProfile } from './types';
import { TabDestination, BottomTabBar } from './components/layout/BottomTabBar';
import { TopAppBar } from './components/layout/TopAppBar';
import { AuthModal } from './components/auth/AuthModal';
import { AnonymousInbox } from './components/anonymous/AnonymousInbox';
import { SendAnonymousModal } from './components/anonymous/SendAnonymousModal';
import { ConversationList } from './components/chat/ConversationList';
import { ChatView } from './components/chat/ChatView';
import { NewChatModal } from './components/chat/NewChatModal';
import { ProfileView } from './components/profile/ProfileView';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { NotificationsView } from './components/notifications/NotificationsView';
import { InstallAppCard } from './components/pwa/InstallAppCard';
import { Toast, ToastProps } from './components/ui/Toast';
import { usePwaInstall } from './lib/usePwaInstall';
import { Wifi, Battery, X } from 'lucide-react';

export default function App() {
  const pwaInstall = usePwaInstall();

  // Global Store Synchronization
  const [, setTick] = useState(0);
  useEffect(() => {
    return db.subscribe(() => setTick((t) => t + 1));
  }, []);

  const currentUser = db.getCurrentUser();
  const anonMessages = db.getAnonymousMessages();
  const notifications = db.getNotifications();
  const conversations = db.getConversations();

  const unreadAnonCount = anonMessages.filter((m) => !m.isRead).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // App Navigation & Modals State
  const [activeTab, setActiveTab] = useState<TabDestination>('inbox');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(() => !pwaInstall.installed);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [sendAnonTarget, setSendAnonTarget] = useState<UserProfile | null>(null);

  // Toast System
  const [toast, setToast] = useState<ToastProps | null>(null);
  const showToast = (message: string, type: ToastProps['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setActiveTab('chat');
  };

  const handleStartNewChatWithUser = (targetUserId: string) => {
    const convId = db.getOrCreateConversation(targetUserId);
    if (convId) {
      setActiveConversationId(convId);
      setActiveTab('chat');
    }
  };

  const showDeviceFrame = isDeviceFrame && !pwaInstall.installed;

  return (
    <div className="min-h-[100dvh] bg-[#07070A] text-white flex flex-col items-center justify-center p-0 md:p-6 overflow-x-hidden">
      {/* Toast notification banner */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Container: Device Shell OR Fluid Mobile View */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          pwaInstall.installed
            ? 'h-[100dvh] overflow-hidden bg-[#0B0B10]'
            : showDeviceFrame
            ? 'max-w-[430px] h-[100dvh] md:h-[890px] md:rounded-[52px] md:border-[10px] md:border-[#222230] md:shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative overflow-hidden bg-[#0B0B10]'
            : 'max-w-2xl min-h-screen md:min-h-[90vh] md:rounded-3xl md:border md:border-white/10 md:shadow-2xl overflow-hidden bg-[#0B0B10]'
        }`}
        style={pwaInstall.installed ? {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        } : undefined}
      >
        {/* Mobile Device Status Bar (iPhone Dynamic Island Header) */}
        {showDeviceFrame && (
          <div className="h-11 px-7 bg-[#0B0B10] flex items-center justify-between text-xs text-white shrink-0 select-none z-50 pt-1">
            <span className="font-semibold text-[13px] tracking-tight">09:41</span>
            
            {/* Dynamic Island Pill */}
            <div className="w-28 h-7 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-[#181822]" />
              <div className="flex items-center gap-1 text-[9px] text-purple-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                <span>VYBZ</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#181822]" />
            </div>

            <div className="flex items-center gap-2 text-white">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Top App Bar */}
        <TopAppBar
          currentUser={currentUser}
          unreadNotifsCount={unreadNotifsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          isDeviceFrame={showDeviceFrame}
          onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
          isStandalone={pwaInstall.installed}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3.5 sm:p-4 relative">
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {!pwaInstall.installed && (
                <InstallAppCard
                  installed={pwaInstall.installed}
                  canPromptInstall={pwaInstall.canPromptInstall}
                  onInstall={pwaInstall.promptInstall}
                  onShowToast={showToast}
                />
              )}
              <AnonymousInbox
                onOpenShareModal={() => setActiveTab('profile')}
                onOpenSendModalToSelf={() => setSendAnonTarget(currentUser)}
                onShowToast={showToast}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            activeConversationId ? (
              <ChatView
                conversationId={activeConversationId}
                onBack={() => setActiveConversationId(null)}
                onShowToast={showToast}
              />
            ) : (
              <ConversationList
                onSelectConversation={handleSelectConversation}
                onOpenNewChat={() => setIsNewChatOpen(true)}
              />
            )
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenTestSend={() => setSendAnonTarget(currentUser)}
              installed={pwaInstall.installed}
              canPromptInstall={pwaInstall.canPromptInstall}
              onInstall={pwaInstall.promptInstall}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Ergonomic Bottom Navigation Bar */}
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'chat') {
              setActiveConversationId(null);
            }
          }}
          anonUnreadCount={unreadAnonCount}
          chatUnreadCount={unreadChatCount}
        />

        {/* iPhone Home Indicator Line */}
        {showDeviceFrame && (
          <div className="h-4 bg-[#0E0E18] flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user: UserProfile) => {
          showToast(`Connecté en tant que ${user.displayName} ✨`, 'success');
        }}
      />

      {/* 2. Send Anonymous Modal */}
      {sendAnonTarget && (
        <SendAnonymousModal
          recipient={sendAnonTarget}
          isOpen={Boolean(sendAnonTarget)}
          onClose={() => setSendAnonTarget(null)}
          onSent={() => {
            showToast('Message anonyme transmis avec succès !', 'success');
          }}
        />
      )}

      {/* 3. New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleStartNewChatWithUser}
      />

      {/* 4. Edit Profile Modal */}
      <EditProfileModal
        user={currentUser}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdated={() => {
          showToast('Profil mis à jour avec succès.', 'success');
        }}
      />

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setIsAuthOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* 6. Notifications Center Drawer / Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131320] border border-white/10 rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
              <h3 className="text-base font-bold font-display text-white">Centre de Notifications</h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                aria-label="Fermer"
                className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <NotificationsView
                onOpenConversation={(convId) => {
                  setIsNotificationsOpen(false);
                  handleSelectConversation(convId);
                }}
                onOpenInbox={() => {
                  setIsNotificationsOpen(false);
                  setActiveTab('inbox');
                }}
                onShowToast={showToast}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
