import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  AnonymousMessage, 
  Conversation, 
  ChatMessage, 
  Question, 
  Answer, 
  Post, 
  Story,
  NotificationItem, 
  UserPreferences,
  ReportRecord,
  CardThemeId
} from '../types';
import { 
  INITIAL_PROFILES, 
  INITIAL_PREFERENCES, 
  INITIAL_ANON_MESSAGES, 
  INITIAL_CONVERSATIONS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_QUESTIONS, 
  INITIAL_POSTS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';

// Config keys
const STORAGE_PREFIX = 'vybz_';
type IdentityRevealRequest = {
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'approved';
};
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let customSupabaseUrl = '';
let customSupabaseKey = '';

try {
  customSupabaseUrl = localStorage.getItem(`${STORAGE_PREFIX}supabase_url`) || ENV_SUPABASE_URL;
  customSupabaseKey = localStorage.getItem(`${STORAGE_PREFIX}supabase_key`) || ENV_SUPABASE_KEY;
} catch {
  // localStorage not available
}

export let supabase: SupabaseClient | null = null;
export const isRealSupabaseConfigured = Boolean(
  customSupabaseUrl && 
  customSupabaseUrl.startsWith('https://') && 
  customSupabaseKey && 
  customSupabaseKey.length > 20
);

if (isRealSupabaseConfigured) {
  try {
    supabase = createClient(customSupabaseUrl, customSupabaseKey, {
      auth: { persistSession: true }
    });
  } catch (e) {
    console.warn('Failed to initialize Supabase client:', e);
  }
}

export function configureSupabase(url: string, key: string) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}supabase_url`, url);
    localStorage.setItem(`${STORAGE_PREFIX}supabase_key`, key);
    window.location.reload();
  } catch (e) {
    console.error('Error saving supabase config', e);
  }
}

export function resetSupabaseConfig() {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}supabase_url`);
    localStorage.removeItem(`${STORAGE_PREFIX}supabase_key`);
    window.location.reload();
  } catch (e) {
    console.error('Error clearing supabase config', e);
  }
}

// -----------------------------------------------------------------------------
// IN-MEMORY / LOCALSTORAGE REACTIVE STORE (Zero-Latency Full Backend Engine)
// -----------------------------------------------------------------------------
class ReactiveStore {
  private profiles: UserProfile[] = [];
  private currentUserId: string = 'user_maya';
  private identityRevealRequests: IdentityRevealRequest[] = [];
  private isVipDetective: boolean = false;
  private preferences: Record<string, UserPreferences> = {};
  private anonMessages: AnonymousMessage[] = [];
  private conversations: Conversation[] = [];
  private chatMessages: ChatMessage[] = [];
  private questions: Question[] = [];
  private answers: Answer[] = [];
  private posts: Post[] = [];
  private stories: Story[] = [];
  private notifications: NotificationItem[] = [];
  private blockedUserIds: string[] = [];
  private reports: ReportRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedProfiles = localStorage.getItem(`${STORAGE_PREFIX}profiles`);
      this.profiles = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;

      const storedUser = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
      this.currentUserId = storedUser || 'user_maya';

      const storedRevealRequests = localStorage.getItem(`${STORAGE_PREFIX}identity_reveal_requests`);
      this.identityRevealRequests = storedRevealRequests ? JSON.parse(storedRevealRequests) : [];

      const storedVipStatus = localStorage.getItem(`${STORAGE_PREFIX}vip_detective`);
      this.isVipDetective = storedVipStatus === 'true';

      const storedPrefs = localStorage.getItem(`${STORAGE_PREFIX}prefs`);
      this.preferences = storedPrefs ? JSON.parse(storedPrefs) : INITIAL_PREFERENCES;

      const storedAnon = localStorage.getItem(`${STORAGE_PREFIX}anon`);
      this.anonMessages = storedAnon ? JSON.parse(storedAnon) : INITIAL_ANON_MESSAGES;

      const storedConv = localStorage.getItem(`${STORAGE_PREFIX}conversations`);
      this.conversations = storedConv ? JSON.parse(storedConv) : INITIAL_CONVERSATIONS;

      const storedChat = localStorage.getItem(`${STORAGE_PREFIX}chat`);
      this.chatMessages = storedChat ? JSON.parse(storedChat) : INITIAL_CHAT_MESSAGES;

      const storedQuestions = localStorage.getItem(`${STORAGE_PREFIX}questions`);
      this.questions = storedQuestions ? JSON.parse(storedQuestions) : INITIAL_QUESTIONS;

      const storedPosts = localStorage.getItem(`${STORAGE_PREFIX}posts`);
      this.posts = storedPosts ? JSON.parse(storedPosts) : INITIAL_POSTS;

      const storedStories = localStorage.getItem(`${STORAGE_PREFIX}stories`);
      this.stories = storedStories ? JSON.parse(storedStories) : [];

      const storedNotifs = localStorage.getItem(`${STORAGE_PREFIX}notifs`);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;

      const storedBlocks = localStorage.getItem(`${STORAGE_PREFIX}blocks`);
      this.blockedUserIds = storedBlocks ? JSON.parse(storedBlocks) : [];
    } catch {
      this.profiles = INITIAL_PROFILES;
      this.currentUserId = 'user_maya';
      this.identityRevealRequests = [];
      this.isVipDetective = false;
      this.preferences = INITIAL_PREFERENCES;
      this.anonMessages = INITIAL_ANON_MESSAGES;
      this.conversations = INITIAL_CONVERSATIONS;
      this.chatMessages = INITIAL_CHAT_MESSAGES;
      this.questions = INITIAL_QUESTIONS;
      this.posts = INITIAL_POSTS;
      this.stories = [];
      this.notifications = INITIAL_NOTIFICATIONS;
      this.blockedUserIds = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}profiles`, JSON.stringify(this.profiles));
      localStorage.setItem(`${STORAGE_PREFIX}current_user`, this.currentUserId);
      localStorage.setItem(`${STORAGE_PREFIX}identity_reveal_requests`, JSON.stringify(this.identityRevealRequests));
      localStorage.setItem(`${STORAGE_PREFIX}vip_detective`, String(this.isVipDetective));
      localStorage.setItem(`${STORAGE_PREFIX}prefs`, JSON.stringify(this.preferences));
      localStorage.setItem(`${STORAGE_PREFIX}anon`, JSON.stringify(this.anonMessages));
      localStorage.setItem(`${STORAGE_PREFIX}conversations`, JSON.stringify(this.conversations));
      localStorage.setItem(`${STORAGE_PREFIX}chat`, JSON.stringify(this.chatMessages));
      localStorage.setItem(`${STORAGE_PREFIX}questions`, JSON.stringify(this.questions));
      localStorage.setItem(`${STORAGE_PREFIX}posts`, JSON.stringify(this.posts));
      localStorage.setItem(`${STORAGE_PREFIX}stories`, JSON.stringify(this.stories));
      localStorage.setItem(`${STORAGE_PREFIX}notifs`, JSON.stringify(this.notifications));
      localStorage.setItem(`${STORAGE_PREFIX}blocks`, JSON.stringify(this.blockedUserIds));
    } catch (e) {
      console.warn('Storage quota exceeded or private mode', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Current user & authentication
  public getCurrentUser(): UserProfile {
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    return user || this.profiles[0];
  }

  public setCurrentUser(userId: string) {
    if (this.profiles.some((p) => p.id === userId)) {
      this.currentUserId = userId;
      this.persist();
    }
  }

  public getProfiles(): UserProfile[] {
    return this.profiles;
  }

  public getProfileByUsername(username: string): UserProfile | undefined {
    return this.profiles.find((p) => p.username.toLowerCase() === username.toLowerCase());
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public isUserRevealed(userId: string): boolean {
    if (userId === this.currentUserId) return true;
    return this.identityRevealRequests.some(
      (request) =>
        request.requesterId === this.currentUserId &&
        request.recipientId === userId &&
        request.status === 'approved'
    );
  }

  public requestIdentityReveal(recipientId: string): boolean {
    if (recipientId === this.currentUserId || this.isUserRevealed(recipientId)) return false;

    const existingRequest = this.identityRevealRequests.find(
      (request) =>
        request.requesterId === this.currentUserId &&
        request.recipientId === recipientId
    );
    if (existingRequest) return false;

    this.identityRevealRequests.push({
      requesterId: this.currentUserId,
      recipientId,
      status: 'pending'
    });
    this.persist();
    return true;
  }

  public hasPendingIdentityRevealRequest(recipientId: string): boolean {
    return this.identityRevealRequests.some(
      (request) =>
        request.requesterId === this.currentUserId &&
        request.recipientId === recipientId &&
        request.status === 'pending'
    );
  }

  public getPendingIdentityRevealRequest(requesterId: string): boolean {
    return this.identityRevealRequests.some(
      (request) =>
        request.requesterId === requesterId &&
        request.recipientId === this.currentUserId &&
        request.status === 'pending'
    );
  }

  public hasApprovedIdentityRevealRequest(requesterId: string): boolean {
    return this.identityRevealRequests.some(
      (request) =>
        request.requesterId === requesterId &&
        request.recipientId === this.currentUserId &&
        request.status === 'approved'
    );
  }

  public consentToRevealIdentity(requesterId: string): boolean {
    const request = this.identityRevealRequests.find(
      (item) =>
        item.requesterId === requesterId &&
        item.recipientId === this.currentUserId &&
        item.status === 'pending'
    );
    if (!request) return false;

    request.status = 'approved';
    this.persist();
    return true;
  }

  public isVipMember(): boolean {
    return this.isVipDetective;
  }

  public setVipDetective(status: boolean) {
    this.isVipDetective = status;
    this.persist();
  }

  public getGhostInfo(user: UserProfile) {
    let sum = 0;
    for (let i = 0; i < user.id.length; i++) {
      sum = (sum * 37 + user.id.charCodeAt(i)) % 9000;
    }
    const ghostCode = 1000 + Math.abs(sum);
    const isRevealed = this.isUserRevealed(user.id);

    return {
      ghostCode,
      ghostName: user.ghostName || `Fantôme #${ghostCode}`,
      ghostUsername: `@ghost_${ghostCode}`,
      ghostAvatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80',
      isRevealed
    };
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    this.profiles = this.profiles.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    this.persist();
    return this.getProfileById(id)!;
  }

  public registerUser(displayName: string, username: string, email: string): UserProfile {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const newId = `user_${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      username: cleanUsername,
      displayName,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      bio: 'Nouveau membre sur VYBZ ⚡ Posez vos questions !',
      accentColor: '#8B5CF6',
      isVerified: false,
      isOnline: true,
      lastSeenAt: 'À l’instant',
      createdAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 1
    };
    this.profiles.push(newProfile);
    this.currentUserId = newId;
    this.preferences[newId] = {
      userId: newId,
      allowAnonymousMessages: true,
      allowDirectChats: true,
      showOnlineStatus: true,
      strictSpamFilter: true,
      pushNotificationsEnabled: true,
      theme: 'dark'
    };
    this.persist();
    return newProfile;
  }

  // Anonymous messages
  public getAnonymousMessages(recipientId?: string): AnonymousMessage[] {
    const target = recipientId || this.currentUserId;
    return this.anonMessages
      .filter((m) => m.recipientId === target)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public sendAnonymousMessage(params: {
    recipientId: string;
    content: string;
    cardTheme: CardThemeId;
    promptTag?: string;
    hint?: string;
  }): { success: boolean; message?: string } {
    // Spam / abuse check
    const spamFilterResult = this.filterContent(params.content);
    if (!spamFilterResult.allowed) {
      return { success: false, message: spamFilterResult.reason };
    }

    const newMsg: AnonymousMessage = {
      id: `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipientId: params.recipientId,
      content: params.content.trim(),
      cardTheme: params.cardTheme || 'purple_gradient',
      promptTag: params.promptTag,
      hint: params.hint || 'Envoyé de manière confidentielle',
      isRead: false,
      isAnswered: false,
      isFlaggedSpam: false,
      createdAt: new Date().toISOString()
    };

    this.anonMessages.unshift(newMsg);

    // Create notification for recipient
    const recipient = this.getProfileById(params.recipientId);
    if (recipient) {
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: params.recipientId,
        type: 'anonymous_message',
        title: 'Nouveau message anonyme 🔮',
        body: `Un message confidentiel vient d'arriver : "${params.content.substring(0, 50)}..."`,
        data: { anonMessageId: newMsg.id },
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.persist();
    return { success: true };
  }

  public markAnonymousMessageRead(messageId: string) {
    this.anonMessages = this.anonMessages.map((m) =>
      m.id === messageId ? { ...m, isRead: true } : m
    );
    this.persist();
  }

  public deleteAnonymousMessage(messageId: string) {
    this.anonMessages = this.anonMessages.filter((m) => m.id !== messageId);
    this.persist();
  }

  public replyToAnonymousMessage(messageId: string, answerText: string, publishToFeed: boolean = true) {
    const msg = this.anonMessages.find((m) => m.id === messageId);
    if (!msg) return;

    this.anonMessages = this.anonMessages.map((m) =>
      m.id === messageId ? { ...m, isAnswered: true, answerText } : m
    );

    if (publishToFeed) {
      const currentUser = this.getCurrentUser();
      const newPost: Post = {
        id: `post_${Date.now()}`,
        authorId: currentUser.id,
        author: currentUser,
        content: answerText,
        anonQuestion: {
          content: msg.content,
          cardTheme: msg.cardTheme,
          hint: msg.hint
        },
        likesCount: 1,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        hasLiked: false
      };
      this.posts.unshift(newPost);
    }

    this.persist();
  }

  // Conversations & Realtime Chat
  public getConversations(): (Conversation & { otherMember: UserProfile })[] {
    const currentUser = this.getCurrentUser();
    return this.conversations
      .filter((c) => c.memberIds.includes(currentUser.id))
      .map((c) => {
        const otherId = c.memberIds.find((id) => id !== currentUser.id) || c.memberIds[0];
        const otherProfile = this.getProfileById(otherId) || INITIAL_PROFILES[0];
        const lastMsg = this.chatMessages
          .filter((m) => m.conversationId === c.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        return {
          ...c,
          otherMember: otherProfile,
          lastMessage: lastMsg || c.lastMessage
        };
      })
      .sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || a.updatedAt;
        const timeB = b.lastMessage?.createdAt || b.updatedAt;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
  }

  public getOrCreateConversation(targetUserId: string): string {
    const currentUser = this.getCurrentUser();
    if (currentUser.id === targetUserId) return '';

    const existing = this.conversations.find((c) => 
      c.memberIds.length === 2 &&
      c.memberIds.includes(currentUser.id) &&
      c.memberIds.includes(targetUserId)
    );

    if (existing) return existing.id;

    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newConv: Conversation = {
      id: newId,
      memberIds: [currentUser.id, targetUserId],
      updatedAt: new Date().toISOString(),
      unreadCount: 0
    };
    this.conversations.unshift(newConv);
    this.persist();
    return newId;
  }

  public getChatMessages(conversationId: string): ChatMessage[] {
    return this.chatMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public sendChatMessage(conversationId: string, content: string): ChatMessage | null {
    if (!content.trim()) return null;
    const currentUser = this.getCurrentUser();

    // Find conversation
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) return null;

    const recipientId = conv.memberIds.find((id) => id !== currentUser.id);

    // Check if recipient has blocked sender
    if (recipientId && this.blockedUserIds.includes(recipientId)) {
      return null;
    }

    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: currentUser.id,
      content: content.trim(),
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    this.chatMessages.push(newMsg);
    conv.updatedAt = new Date().toISOString();

    // Set status to delivered shortly
    setTimeout(() => {
      newMsg.status = 'delivered';
      this.persist();
    }, 400);

    // If other user is online, create notification
    if (recipientId) {
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId,
        actorId: currentUser.id,
        actor: currentUser,
        type: 'chat_message',
        title: currentUser.displayName,
        body: content.length > 60 ? `${content.substring(0, 60)}...` : content,
        data: { conversationId },
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.persist();
    return newMsg;
  }

  public markConversationRead(conversationId: string) {
    const currentUser = this.getCurrentUser();
    this.chatMessages = this.chatMessages.map((m) => {
      if (m.conversationId === conversationId && m.senderId !== currentUser.id) {
        return { ...m, status: 'read' };
      }
      return m;
    });
    this.persist();
  }

  // Feed & Questions
  public getPosts(): Post[] {
    return this.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createPost(content: string, imageUrl?: string): Post {
    const currentUser = this.getCurrentUser();
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      hasLiked: false
    };
    this.posts.unshift(newPost);
    this.persist();
    return newPost;
  }

  public togglePostLike(postId: string) {
    this.posts = this.posts.map((p) => {
      if (p.id === postId) {
        const hasLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked,
          likesCount: hasLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
        };
      }
      return p;
    });
    this.persist();
  }

  public getStories(): Story[] {
    const expirationCutoff = Date.now() - 24 * 60 * 60 * 1000;
    return this.stories
      .filter((story) => new Date(story.createdAt).getTime() > expirationCutoff)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public createStory(params: {
    content: string;
    bgGradient?: string;
    imageUrl?: string;
    images?: string[];
    stickerType?: 'ask_anon' | 'poll' | 'vibe';
    stickerText?: string;
  }): Story {
    const currentUser = this.getCurrentUser();
    const newStory: Story = {
      id: `story_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      content: params.content.trim(),
      bgGradient: params.bgGradient || 'from-[#7C3AED] via-[#6366F1] to-[#1E1B4B]',
      imageUrl: params.imageUrl,
      images: params.images,
      stickerType: params.stickerType || 'ask_anon',
      stickerText: params.stickerText || 'Pose-moi une question sans filtre 🔮',
      createdAt: new Date().toISOString()
    };
    this.stories.unshift(newStory);
    this.persist();
    return newStory;
  }

  public getQuestions(): Question[] {
    return this.questions.map((q) => ({
      ...q,
      user: this.getProfileById(q.userId) || INITIAL_PROFILES[0]
    }));
  }

  public createQuestion(title: string, category: Question['category'] = 'general'): Question {
    const currentUser = this.getCurrentUser();
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      title: title.trim(),
      category,
      isAnonymousAllowed: true,
      likesCount: 0,
      answersCount: 0,
      createdAt: new Date().toISOString(),
      hasLiked: false
    };
    this.questions.unshift(newQuestion);
    this.persist();
    return newQuestion;
  }

  public toggleQuestionLike(questionId: string) {
    this.questions = this.questions.map((q) => {
      if (q.id === questionId) {
        const hasLiked = !q.hasLiked;
        return {
          ...q,
          hasLiked,
          likesCount: hasLiked ? q.likesCount + 1 : Math.max(0, q.likesCount - 1)
        };
      }
      return q;
    });
    this.persist();
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    const currentUser = this.getCurrentUser();
    return this.notifications
      .filter((n) => n.recipientId === currentUser.id)
      .map((n) => ({
        ...n,
        actor: n.actorId ? this.getProfileById(n.actorId) : undefined
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.persist();
  }

  public markAllNotificationsAsRead() {
    const currentUser = this.getCurrentUser();
    this.notifications = this.notifications.map((n) =>
      n.recipientId === currentUser.id ? { ...n, isRead: true } : n
    );
    this.persist();
  }

  // Blocks & Reports
  public blockUser(targetUserId: string) {
    if (!this.blockedUserIds.includes(targetUserId)) {
      this.blockedUserIds.push(targetUserId);
      this.persist();
    }
  }

  public unblockUser(targetUserId: string) {
    this.blockedUserIds = this.blockedUserIds.filter((id) => id !== targetUserId);
    this.persist();
  }

  public getBlockedUsers(): UserProfile[] {
    return this.blockedUserIds
      .map((id) => this.getProfileById(id))
      .filter((p): p is UserProfile => Boolean(p));
  }

  public isUserBlocked(targetUserId: string): boolean {
    return this.blockedUserIds.includes(targetUserId);
  }

  public reportContent(params: {
    targetType: ReportRecord['targetType'];
    targetId: string;
    reportedUserId?: string;
    reason: string;
    details?: string;
  }): ReportRecord {
    const newReport: ReportRecord = {
      id: `rep_${Date.now()}`,
      reporterId: this.currentUserId,
      reportedUserId: params.reportedUserId,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
      details: params.details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.reports.push(newReport);
    return newReport;
  }

  // Preferences
  public getUserPreferences(): UserPreferences {
    const currentUser = this.getCurrentUser();
    return this.preferences[currentUser.id] || {
      userId: currentUser.id,
      allowAnonymousMessages: true,
      allowDirectChats: true,
      showOnlineStatus: true,
      strictSpamFilter: true,
      pushNotificationsEnabled: true,
      theme: 'dark'
    };
  }

  public updateUserPreferences(updates: Partial<UserPreferences>) {
    const currentUser = this.getCurrentUser();
    this.preferences[currentUser.id] = {
      ...this.getUserPreferences(),
      ...updates
    };
    this.persist();
  }

  // Anti-Spam filter
  private filterContent(text: string): { allowed: boolean; reason?: string } {
    const lower = text.toLowerCase();
    const bannedPatterns = [
      'argent facile', 
      'crypto pump', 
      'cliquez ici http', 
      't.me/join', 
      'whatsapp +', 
      'free followers'
    ];

    for (const pat of bannedPatterns) {
      if (lower.includes(pat)) {
        return {
          allowed: false,
          reason: 'Votre message a été identifié comme un spam par les filtres de sécurité.'
        };
      }
    }

    if (text.length > 600) {
      return { allowed: false, reason: 'Le message dépasse la limite de 600 caractères.' };
    }

    return { allowed: true };
  }
}

export const db = new ReactiveStore();
