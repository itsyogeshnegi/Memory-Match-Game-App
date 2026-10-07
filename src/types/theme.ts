// Theme and Visual Styling types

export interface CardThemedItem {
  key: string;
  symbol: string; // vector icon name (from Ionicons / MaterialCommunityIcons / FontAwesome5)
  title: string;
  color: string;
}

export interface CardTheme {
  id: string;
  name: string;
  tagline: string;
  cardBackGradient: [string, string];
  cardBackBorder: string;
  cardBackPattern: string; // icon name for back emblem
  cardFrontBackground: string;
  accentGlow: string;
  items: CardThemedItem[];
}
