export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';
export type NotificationType = 'anonymous_message' | 'chat_message' | 'question_answer' | 'reaction' | 'mention';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  accentColor: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeenAt: string;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
}

export interface UserPreferences {
  userId: string;
  allowAnonymousMessages: boolean;
  allowDirectChats: boolean;
  showOnlineStatus: boolean;
  strictSpamFilter: boolean;
  pushNotificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

export type CardThemeId = 
  | 'purple_gradient' 
  | 'pink_gradient' 
  | 'cyber_dark' 
  | 'sunset_orange' 
  | 'neon_emerald' 
  | 'electric_blue';

export interface AnonymousMessage {
  id: string;
  recipientId: string;
  content: string;
  cardTheme: CardThemeId;
  promptTag?: string;
  hint?: string;
  isRead: boolean;
  isAnswered: boolean;
  isFlaggedSpam: boolean;
  createdAt: string;
  answerText?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  mediaUrl?: string;
  replyToId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  memberIds: string[];
  lastMessage?: ChatMessage;
  updatedAt: string;
  unreadCount?: number;
}

export interface Question {
  id: string;
  userId: string;
  user?: UserProfile;
  title: string;
  category: 'general' | 'confession' | 'lifestyle' | 'tech' | 'music' | 'deep';
  isAnonymousAllowed: boolean;
  likesCount: number;
  answersCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId?: string;
  author?: UserProfile;
  isAnonymous: boolean;
  content: string;
  likesCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author: UserProfile;
  content: string;
  imageUrl?: string;
  anonQuestion?: {
    content: string;
    cardTheme: CardThemeId;
    hint?: string;
  };
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

export interface Story {
  id: string;
  authorId: string;
  author: UserProfile;
  content: string;
  bgGradient: string;
  imageUrl?: string;
  images?: string[];
  stickerType?: 'ask_anon' | 'poll' | 'vibe';
  stickerText?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId?: string;
  actor?: UserProfile;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    conversationId?: string;
    anonMessageId?: string;
    questionId?: string;
    postId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface BlockRecord {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterId?: string;
  reportedUserId?: string;
  targetType: 'profile' | 'anonymous_message' | 'chat_message' | 'post';
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}
