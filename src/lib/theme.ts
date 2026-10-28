import { CardThemeId } from '../types';

export interface CardThemeConfig {
  id: CardThemeId;
  name: string;
  bgGradient: string;
  textColor: string;
  accentBadge: string;
  borderColor: string;
}

export const CARD_THEMES: Record<CardThemeId, CardThemeConfig> = {
  purple_gradient: {
    id: 'purple_gradient',
    name: 'Electric Violet',
    bgGradient: 'bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#4338CA]',
    textColor: 'text-white',
    accentBadge: 'bg-white/20 text-white border-white/30',
    borderColor: 'border-purple-500/30'
  },
  pink_gradient: {
    id: 'pink_gradient',
    name: 'Neon Blossom',
    bgGradient: 'bg-gradient-to-br from-[#EC4899] via-[#F43F5E] to-[#E11D48]',
    textColor: 'text-white',
    accentBadge: 'bg-white/20 text-white border-white/30',
    borderColor: 'border-pink-500/30'
  },
  cyber_dark: {
    id: 'cyber_dark',
    name: 'Cyber Noir',
    bgGradient: 'bg-gradient-to-br from-[#1E1E2E] via-[#161622] to-[#0F0F17]',
    textColor: 'text-gray-100',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    borderColor: 'border-white/10'
  },
  sunset_orange: {
    id: 'sunset_orange',
    name: 'Solar Flare',
    bgGradient: 'bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#BE123C]',
    textColor: 'text-white',
    accentBadge: 'bg-white/20 text-white border-white/30',
    borderColor: 'border-orange-500/30'
  },
  neon_emerald: {
    id: 'neon_emerald',
    name: 'Aurora Mint',
    bgGradient: 'bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857]',
    textColor: 'text-white',
    accentBadge: 'bg-white/20 text-white border-white/30',
    borderColor: 'border-emerald-500/30'
  },
  electric_blue: {
    id: 'electric_blue',
    name: 'Digital Ocean',
    bgGradient: 'bg-gradient-to-br from-[#06B6D4] via-[#0284C7] to-[#1E40AF]',
    textColor: 'text-white',
    accentBadge: 'bg-white/20 text-white border-white/30',
    borderColor: 'border-cyan-500/30'
  }
};
