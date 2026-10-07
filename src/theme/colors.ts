// Global color tokens for dark, modern, premium mobile gaming aesthetic

export const Colors = {
  // Backgrounds
  background: '#0B0D17', // deep cosmic obsidian
  backgroundSecondary: '#121626',
  surface: '#1A1F36', // elevated card/modal surface
  surfaceElevated: '#232A46',
  surfaceBorder: '#2E385D',

  // Brand Accents
  primary: '#6366F1', // vibrant indigo
  primaryGradient: ['#6366F1', '#8B5CF6'] as [string, string],
  primaryLight: '#818CF8',
  secondary: '#EC4899', // hot pink / magenta
  secondaryGradient: ['#EC4899', '#F43F5E'] as [string, string],

  // Game Highlights
  gold: '#F59E0B',
  goldGradient: ['#F59E0B', '#FBBF24'] as [string, string],
  emerald: '#10B981',
  emeraldGradient: ['#10B981', '#34D399'] as [string, string],
  cyan: '#06B6D4',
  cyanGradient: ['#06B6D4', '#22D3EE'] as [string, string],
  crimson: '#EF4444',

  // Player Tokens
  player1: '#38BDF8', // Cyan sky
  player1Glow: 'rgba(56, 189, 248, 0.35)',
  player2: '#F472B6', // Rose pink
  player2Glow: 'rgba(244, 114, 182, 0.35)',
  aiPlayer: '#A78BFA', // Arcane purple
  aiPlayerGlow: 'rgba(167, 139, 250, 0.35)',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // States
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Overlay
  overlay: 'rgba(5, 7, 15, 0.88)',
  overlayTranslucent: 'rgba(11, 13, 23, 0.7)',
  cardBackDefault: ['#1E1B4B', '#312E81'] as [string, string],
};
