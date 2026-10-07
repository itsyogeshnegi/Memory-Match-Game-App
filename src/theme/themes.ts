// Card themes with distinct visual identities, colors, and items

import { CardTheme } from '../types/theme';

export const CARD_THEMES: Record<string, CardTheme> = {
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic Glow',
    tagline: 'Celestial bodies from deep space',
    cardBackGradient: ['#1E1B4B', '#312E81'],
    cardBackBorder: '#6366F1',
    cardBackPattern: 'planet',
    cardFrontBackground: '#13122B',
    accentGlow: 'rgba(99, 102, 241, 0.4)',
    items: [
      { key: 'sun', symbol: 'sunny', title: 'Solar Core', color: '#FBBF24' },
      { key: 'moon', symbol: 'moon', title: 'Lunar Crescent', color: '#93C5FD' },
      { key: 'star', symbol: 'star', title: 'Supernova', color: '#F472B6' },
      { key: 'planet', symbol: 'planet', title: 'Ring Planet', color: '#A78BFA' },
      { key: 'rocket', symbol: 'rocket', title: 'Starlight Shuttle', color: '#F87171' },
      { key: 'telescope', symbol: 'telescope', title: 'Deep Observatory', color: '#34D399' },
      { key: 'flash', symbol: 'flash', title: 'Plasma Flare', color: '#FCD34D' },
      { key: 'sparkles', symbol: 'sparkles', title: 'Nebula Dust', color: '#38BDF8' },
      { key: 'globe', symbol: 'globe', title: 'Earth Haven', color: '#6EE7B7' },
      { key: 'infinite', symbol: 'infinite', title: 'Cosmic Singularity', color: '#C084FC' },
      { key: 'compass', symbol: 'compass', title: 'Stellar Sextant', color: '#F43F5E' },
      { key: 'shield', symbol: 'shield-checkmark', title: 'Ion Barrier', color: '#60A5FA' },
    ],
  },

  cyber: {
    id: 'cyber',
    name: 'Neon Cyber',
    tagline: 'Futuristic digital artifacts',
    cardBackGradient: ['#0A2540', '#0F172A'],
    cardBackBorder: '#06B6D4',
    cardBackPattern: 'hardware-chip',
    cardFrontBackground: '#061325',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    items: [
      { key: 'chip', symbol: 'hardware-chip', title: 'Quantum Core', color: '#22D3EE' },
      { key: 'gamepad', symbol: 'game-controller', title: 'Arcade Rig', color: '#F43F5E' },
      { key: 'terminal', symbol: 'terminal', title: 'Root Terminal', color: '#4ADE80' },
      { key: 'radio', symbol: 'radio', title: 'Frequency Node', color: '#FBBF24' },
      { key: 'battery', symbol: 'battery-charging', title: 'Hyper Cell', color: '#A3E635' },
      { key: 'cube', symbol: 'cube', title: 'Holo Matrix', color: '#E879F9' },
      { key: 'wifi', symbol: 'wifi', title: 'Neural Uplink', color: '#38BDF8' },
      { key: 'key', symbol: 'key', title: 'Decryption Key', color: '#F59E0B' },
      { key: 'disc', symbol: 'disc', title: 'Optical Memory', color: '#818CF8' },
      { key: 'shield', symbol: 'shield', title: 'Firewall Gate', color: '#FB7185' },
      { key: 'code', symbol: 'code-slash', title: 'Binary Stream', color: '#2DD4BF' },
      { key: 'headset', symbol: 'headset', title: 'Cyber Rig', color: '#C084FC' },
    ],
  },

  arcane: {
    id: 'arcane',
    name: 'Arcane Fantasy',
    tagline: 'Relics of forgotten magic',
    cardBackGradient: ['#2E1065', '#4C1D95'],
    cardBackBorder: '#A855F7',
    cardBackPattern: 'flame',
    cardFrontBackground: '#1E0B3D',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    items: [
      { key: 'flame', symbol: 'flame', title: 'Ember Rune', color: '#FB923C' },
      { key: 'book', symbol: 'book', title: 'Ancient Grimoire', color: '#A78BFA' },
      { key: 'skull', symbol: 'skull', title: 'Soul Relic', color: '#CBD5E1' },
      { key: 'flask', symbol: 'flask', title: 'Elixir of Clarity', color: '#34D399' },
      { key: 'heart', symbol: 'heart', title: 'Dragon Heart', color: '#F43F5E' },
      { key: 'eye', symbol: 'eye', title: 'All-Seeing Eye', color: '#38BDF8' },
      { key: 'diamond', symbol: 'diamond', title: 'Mana Crystal', color: '#818CF8' },
      { key: 'leaf', symbol: 'leaf', title: 'Elder Bloom', color: '#4ADE80' },
      { key: 'hourglass', symbol: 'hourglass', title: 'Chrono Sand', color: '#FBBF24' },
      { key: 'trophy', symbol: 'trophy', title: 'Chalice of Kings', color: '#F59E0B' },
      { key: 'shield', symbol: 'shield-half', title: 'Aegis Ward', color: '#A855F7' },
      { key: 'ribbon', symbol: 'ribbon', title: 'Imperial Seal', color: '#FB7185' },
    ],
  },

  prism: {
    id: 'prism',
    name: 'Prism Gems',
    tagline: 'Radiant polished gemstones',
    cardBackGradient: ['#042F2E', '#134E4A'],
    cardBackBorder: '#14B8A6',
    cardBackPattern: 'prism',
    cardFrontBackground: '#021E1C',
    accentGlow: 'rgba(20, 184, 166, 0.4)',
    items: [
      { key: 'gem1', symbol: 'diamond-outline', title: 'Blue Sapphire', color: '#38BDF8' },
      { key: 'gem2', symbol: 'sparkles-outline', title: 'Radiant Quartz', color: '#F472B6' },
      { key: 'gem3', symbol: 'flower', title: 'Emerald Blossom', color: '#34D399' },
      { key: 'gem4', symbol: 'star-half', title: 'Golden Topaz', color: '#FBBF24' },
      { key: 'gem5', symbol: 'nuclear', title: 'Uranium Glow', color: '#A3E635' },
      { key: 'gem6', symbol: 'color-palette', title: 'Prism Spectrum', color: '#C084FC' },
      { key: 'gem7', symbol: 'flash-outline', title: 'Amber Lightning', color: '#F97316' },
      { key: 'gem8', symbol: 'heart-circle', title: 'Ruby Essence', color: '#EF4444' },
      { key: 'gem9', symbol: 'snow', title: 'Frost Diamond', color: '#E0F2FE' },
      { key: 'gem10', symbol: 'water', title: 'Aquamarine Shard', color: '#22D3EE' },
      { key: 'gem11', symbol: 'sunny-outline', title: 'Citrine Sun', color: '#FDE047' },
      { key: 'gem12', symbol: 'rose', title: 'Garnet Rose', color: '#FB7185' },
    ],
  },
};

export const DEFAULT_THEME_ID = 'cosmic';

export function getTheme(themeId?: string): CardTheme {
  if (themeId && CARD_THEMES[themeId]) {
    return CARD_THEMES[themeId];
  }
  return CARD_THEMES[DEFAULT_THEME_ID];
}
