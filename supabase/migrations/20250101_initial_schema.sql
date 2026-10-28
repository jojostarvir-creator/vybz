-- ==============================================================================
-- VYBZ - SOCIAL & ANONYMOUS MOBILE APP
-- SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');
CREATE TYPE notification_type AS ENUM ('anonymous_message', 'chat_message', 'question_answer', 'reaction', 'mention');

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    accent_color TEXT DEFAULT '#8B5CF6',
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT username_length_check CHECK (char_length(username) >= 3 AND char_length(username) <= 24),
    CONSTRAINT username_format_check CHECK (username ~* '^[a-zA-Z0-9_]+$')
);

-- Index for fast user searches and profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- 4. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    allow_anonymous_messages BOOLEAN DEFAULT true NOT NULL,
    allow_direct_chats BOOLEAN DEFAULT true NOT NULL,
    show_online_status BOOLEAN DEFAULT true NOT NULL,
    strict_spam_filter BOOLEAN DEFAULT true NOT NULL,
    push_notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    email_notifications_enabled BOOLEAN DEFAULT false NOT NULL,
    theme TEXT DEFAULT 'dark' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. ANONYMOUS MESSAGES TABLE
-- Note: Sender user_id is deliberately NOT linked or exposed to the recipient
-- Only anonymous device/session hash is stored internally for rate limiting & anti-abuse
CREATE TABLE IF NOT EXISTS public.anonymous_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    card_theme TEXT DEFAULT 'purple_gradient',
    prompt_tag TEXT,
    hint TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    is_answered BOOLEAN DEFAULT false NOT NULL,
    is_flagged_spam BOOLEAN DEFAULT false NOT NULL,
    sender_hash TEXT, -- One-way hash for moderation/rate-limiting only
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT content_length_check CHECK (char_length(content) >= 1 AND char_length(content) <= 600)
);

CREATE INDEX IF NOT EXISTS idx_anon_recipient_created ON public.anonymous_messages(recipient_id, created_at DESC);

-- 6. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. CONVERSATION MEMBERS (M:N)
CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members(user_id);

-- 8. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status message_status DEFAULT 'sent' NOT NULL,
    media_url TEXT,
    reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chat_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_created ON public.chat_messages(conversation_id, created_at ASC);

-- 9. QUESTIONS TABLE (Public or private Q&A prompts)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_anonymous_allowed BOOLEAN DEFAULT true,
    likes_count INT DEFAULT 0,
    answers_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. POSTS TABLE (Community short updates & public answers to anonymous questions)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    anon_question_ref UUID REFERENCES public.anonymous_messages(id) ON DELETE SET NULL,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);

-- 12. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'post', 'answer', 'chat_message'
    target_id UUID NOT NULL,
    emoji TEXT NOT NULL DEFAULT '❤️',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_target_reaction UNIQUE (user_id, target_type, target_id, emoji)
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);

-- 14. BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT cannot_block_self CHECK (blocker_id <> blocked_id)
);

-- 15. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL, -- 'profile', 'anonymous_message', 'chat_message', 'post'
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status report_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- USER PREFERENCES POLICIES
CREATE POLICY "Users can view and update their own preferences" 
ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- ANONYMOUS MESSAGES POLICIES
-- Anyone can insert an anonymous message (public link), provided the recipient allows it
CREATE POLICY "Anyone can send an anonymous message" 
ON public.anonymous_messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_preferences
        WHERE user_id = recipient_id AND allow_anonymous_messages = true
    )
    AND NOT EXISTS (
        -- Cannot send if blocked
        SELECT 1 FROM public.blocks
        WHERE blocker_id = recipient_id AND blocked_id = auth.uid()
    )
);

-- Only recipient can read or delete their received anonymous messages
CREATE POLICY "Recipients can view their anonymous messages" 
ON public.anonymous_messages FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update or delete their anonymous messages" 
ON public.anonymous_messages FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their anonymous messages" 
ON public.anonymous_messages FOR DELETE USING (auth.uid() = recipient_id);

-- CONVERSATIONS & CHAT POLICIES
CREATE POLICY "Users can view conversations they belong to" 
ON public.conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = id AND user_id = auth.uid()
    )
);

CREATE POLICY "Members can view conversation members" 
ON public.conversation_members FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members m
        WHERE m.conversation_id = conversation_members.conversation_id AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Users can add members when creating conversation" 
ON public.conversation_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Members can view messages in their conversations" 
ON public.chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = chat_messages.conversation_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Members can send messages to their conversations" 
ON public.chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = chat_messages.conversation_id AND user_id = auth.uid()
    )
);

-- POSTS, QUESTIONS & ANSWERS
CREATE POLICY "Public posts are viewable by all authenticated users" 
ON public.posts FOR SELECT USING (true);

CREATE POLICY "Users can create posts" 
ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can only see their own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can mark their own notifications as read" 
ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- BLOCKS POLICIES
CREATE POLICY "Users can manage their own block list" 
ON public.blocks FOR ALL USING (auth.uid() = blocker_id);

-- REPORTS POLICIES
CREATE POLICY "Authenticated users can submit reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_username TEXT;
BEGIN
  clean_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'vyber_' || SUBSTRING(NEW.id::text, 1, 8)
  );

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    clean_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Vyber'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE REALTIME ON KEY TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
