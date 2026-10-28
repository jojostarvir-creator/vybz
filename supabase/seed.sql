-- ==============================================================================
-- VYBZ - DEMO SEED DATA
-- ==============================================================================

-- Profiles seed
INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, accent_color, is_verified, is_online)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'maya_vibe', 'Maya Lin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Créatrice de contenu & UI/UX addict ✨ Envoyez-moi vos vérités sans filtre !', '#8B5CF6', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'alex_k', 'Alexandre K.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 'Architecte logiciel & Photographe de nuit. Dispo pour parler tech & musique.', '#EC4899', true, true),
  ('a0000000-0000-0000-0000-000000000003', 'sarah_design', 'Sarah Chen', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Art & cyberpunk vibes 🌸 Drop a question or say hi!', '#F472B6', false, false),
  ('a0000000-0000-0000-0000-000000000004', 'liam_sound', 'Liam S.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'DJ & beatmaker. Vos meilleures recos musicales en anonyme svp 🎧', '#3B82F6', false, true)
ON CONFLICT (id) DO NOTHING;

-- User preferences seed
INSERT INTO public.user_preferences (user_id, allow_anonymous_messages, allow_direct_chats, show_online_status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', true, true, true),
  ('a0000000-0000-0000-0000-000000000002', true, true, true),
  ('a0000000-0000-0000-0000-000000000003', true, true, false),
  ('a0000000-0000-0000-0000-000000000004', true, true, true)
ON CONFLICT (user_id) DO NOTHING;

-- Anonymous messages for Maya
INSERT INTO public.anonymous_messages (id, recipient_id, content, card_theme, prompt_tag, hint, is_read, is_answered, created_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Franchement, ton dernier design sur Figma était incroyable ! Tu devrais postuler chez les plus grands studios.', 'purple_gradient', 'Compliment', 'Envoyé depuis un iPhone · Paris', false, false, NOW() - INTERVAL '2 hours'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Est-ce que tu as déjà eu un coup de cœur secret pour quelqu''un dans ton équipe de dev ? 👀', 'pink_gradient', 'Secret', 'Envoyé depuis Android · Lyon', true, true, NOW() - INTERVAL '1 day'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Tu as l''air super timide en vrai alors que sur l''appli tu rayonnes !', 'cyber_dark', 'Première impression', 'Envoyé depuis Chrome · Bruxelles', false, false, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Conversations between Maya and Alexandre
INSERT INTO public.conversations (id, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.conversation_members (conversation_id, user_id)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

INSERT INTO public.chat_messages (id, conversation_id, sender_id, content, status, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Salut Maya ! J''ai vu ton lien anonyme circuler sur Instagram haha', 'read', NOW() - INTERVAL '2 hours'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Haha oui ! J''ai déjà reçu des messages ultra drôles 😂 C''est toi qui as posé la question sur le dev ?', 'read', NOW() - INTERVAL '1 hour 45 minutes'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Peut-être bien... 😉 Mais l''anonymat fait partie du jeu ! Tu avances sur la nouvelle version de VYBZ ?', 'read', NOW() - INTERVAL '1 hour 20 minutes'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Grave, l''interface en dark mode avec le violet électrique rend tellement propre ! Regarde sur le live preview.', 'delivered', NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- Public questions
INSERT INTO public.questions (id, user_id, title, category, likes_count, answers_count)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Quelle est la chose la plus folle que vous ayez apprise sur vous-même cette année ?', 'lifestyle', 18, 5),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Si vous pouviez coder une app qui résout un seul problème humain, ce serait quoi ?', 'tech', 34, 12)
ON CONFLICT (id) DO NOTHING;
