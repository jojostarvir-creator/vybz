import { UserProfile, AnonymousMessage, Conversation, ChatMessage, Question, Post, NotificationItem, UserPreferences } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_maya',
    username: 'maya_vibe',
    displayName: 'Maya Lin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'UI/UX Designer & Créatrice ✨ Drop your truths, I answer everything honestly ! 💜',
    accentColor: '#8B5CF6',
    isVerified: true,
    isOnline: true,
    lastSeenAt: 'À l’instant',
    createdAt: '2025-01-15T10:00:00Z',
    followersCount: 1420,
    followingCount: 312
  },
  {
    id: 'user_alex',
    username: 'alex_k',
    displayName: 'Alexandre K.',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Software architect & Night shooter 📷 Tech, coffee & late night vybz.',
    accentColor: '#EC4899',
    isVerified: true,
    isOnline: true,
    lastSeenAt: 'À l’instant',
    createdAt: '2025-01-18T14:30:00Z',
    followersCount: 890,
    followingCount: 245
  },
  {
    id: 'user_sarah',
    username: 'sarah_chen',
    displayName: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Cyberpunk art & soundscapes 🌸 Ne me dis rien que tu n’oserais pas assumer en vrai !',
    accentColor: '#F472B6',
    isVerified: false,
    isOnline: false,
    lastSeenAt: 'Il y a 2h',
    createdAt: '2025-02-01T09:15:00Z',
    followersCount: 654,
    followingCount: 410
  },
  {
    id: 'user_liam',
    username: 'liam_music',
    displayName: 'Liam S.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'DJ & electronic producer 🎧 Vos pépites underground en message anonyme svp',
    accentColor: '#3B82F6',
    isVerified: false,
    isOnline: true,
    lastSeenAt: 'À l’instant',
    createdAt: '2025-02-10T16:45:00Z',
    followersCount: 1205,
    followingCount: 520
  }
];

export const INITIAL_PREFERENCES: Record<string, UserPreferences> = {
  user_maya: {
    userId: 'user_maya',
    allowAnonymousMessages: true,
    allowDirectChats: true,
    showOnlineStatus: true,
    strictSpamFilter: true,
    pushNotificationsEnabled: true,
    theme: 'dark'
  },
  user_alex: {
    userId: 'user_alex',
    allowAnonymousMessages: true,
    allowDirectChats: true,
    showOnlineStatus: true,
    strictSpamFilter: true,
    pushNotificationsEnabled: true,
    theme: 'dark'
  }
};

export const INITIAL_ANON_MESSAGES: AnonymousMessage[] = [
  {
    id: 'anon_1',
    recipientId: 'user_maya',
    content: 'Ton dernier projet d’UI est juste sublime ! Est-ce que tu prends des stagiaires ou mentors des juniors ? ✨',
    cardTheme: 'purple_gradient',
    promptTag: 'Compliment',
    hint: 'Envoyé depuis un iPhone · Paris',
    isRead: false,
    isAnswered: false,
    isFlaggedSpam: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'anon_2',
    recipientId: 'user_maya',
    content: 'Sois 100% honnête : est-ce qu’il y a quelqu’un dans ton réseau que tu crush en secret ? 👀',
    cardTheme: 'pink_gradient',
    promptTag: 'Vérité / Crush',
    hint: 'Envoyé depuis Safari · Lyon',
    isRead: true,
    isAnswered: true,
    isFlaggedSpam: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    answerText: 'Haha peut-être bien... mais je ne balancerai aucun prénom ici ! 😉'
  },
  {
    id: 'anon_3',
    recipientId: 'user_maya',
    content: 'Tu as l’air super sociable sur tes posts, mais est-ce que tu es en réalité plutôt introvertie quand tu es seule ?',
    cardTheme: 'cyber_dark',
    promptTag: 'Confession',
    hint: 'Envoyé depuis Android · Marseille',
    isRead: false,
    isAnswered: false,
    isFlaggedSpam: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_maya_alex',
    memberIds: ['user_maya', 'user_alex'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadCount: 0
  },
  {
    id: 'conv_maya_sarah',
    memberIds: ['user_maya', 'user_sarah'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 1
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat_1',
    conversationId: 'conv_maya_alex',
    senderId: 'user_alex',
    content: 'Salut Maya ! J’ai vu que ton lien VYBZ tournait pas mal en story aujourd’hui 😄',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'chat_2',
    conversationId: 'conv_maya_alex',
    senderId: 'user_maya',
    content: 'Hey Alex ! Oui c’est fou, j’ai déjà eu plusieurs questions hyper drôles et un compliment sur mes maquettes !',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.8).toISOString()
  },
  {
    id: 'chat_3',
    conversationId: 'conv_maya_alex',
    senderId: 'user_alex',
    content: 'Trop bien ! Tu as testé le chat en temps réel et les réponses story ? Ça tourne ultra vite.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'chat_4',
    conversationId: 'conv_maya_alex',
    senderId: 'user_maya',
    content: 'Oui c’est ultra fluide ! Le thème sombre avec les dégradés néon rend super bien.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'chat_5',
    conversationId: 'conv_maya_sarah',
    senderId: 'user_sarah',
    content: 'Coucou Maya, dis-moi tu as un moment cette semaine pour un call design ?',
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q_1',
    userId: 'user_alex',
    title: 'Quel est votre meilleur conseil pour rester inspiré(e) quand on bloque sur un projet ?',
    category: 'tech',
    isAnonymousAllowed: true,
    likesCount: 24,
    answersCount: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    hasLiked: false
  },
  {
    id: 'q_2',
    userId: 'user_maya',
    title: 'Si vous pouviez changer une seule chose dans la façon dont les gens communiquent en ligne ?',
    category: 'deep',
    isAnonymousAllowed: true,
    likesCount: 42,
    answersCount: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    hasLiked: true
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_maya',
    author: INITIAL_PROFILES[0],
    content: 'Réponse à un message reçu tout à l’heure : merci pour tout le soutien sur mes projets récents ! Ça me motive x1000 pour la suite 🚀💜',
    anonQuestion: {
      content: 'Sois 100% honnête : est-ce qu’il y a quelqu’un dans ton réseau que tu crush en secret ? 👀',
      cardTheme: 'pink_gradient',
      hint: 'Envoyé depuis Safari · Lyon'
    },
    likesCount: 38,
    commentsCount: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    hasLiked: true
  },
  {
    id: 'post_2',
    authorId: 'user_alex',
    author: INITIAL_PROFILES[1],
    content: 'Nouvelle vibe nocturne terminée. Parfois coder à 2h du matin avec une bonne playlist c’est le meilleur moment de la journée.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    likesCount: 56,
    commentsCount: 11,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    hasLiked: false
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientId: 'user_maya',
    type: 'anonymous_message',
    title: 'Nouveau message anonyme 🔮',
    body: 'Quelqu’un vous a laissé un mot : "Ton dernier projet d’UI est juste sublime..."',
    data: { anonMessageId: 'anon_1' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'notif_2',
    recipientId: 'user_maya',
    actorId: 'user_alex',
    actor: INITIAL_PROFILES[1],
    type: 'chat_message',
    title: 'Alexandre K.',
    body: 'Trop bien ! Tu as testé le chat en temps réel...',
    data: { conversationId: 'conv_maya_alex' },
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif_3',
    recipientId: 'user_maya',
    actorId: 'user_sarah',
    actor: INITIAL_PROFILES[2],
    type: 'reaction',
    title: 'Sarah Chen a réagi',
    body: 'A aimé votre réponse à une question anonyme ❤️',
    data: { postId: 'post_1' },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString()
  }
];
