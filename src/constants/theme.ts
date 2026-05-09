export const Colors = {
  primary: '#C75B1A',
  primaryDark: '#A34712',
  primaryLight: '#E8813D',
  secondary: '#2D6A4F',
  secondaryLight: '#40916C',

  // Backgrounds
  backgroundLight: '#FFFFFF',
  backgroundDark: '#000000',
  surfaceLight: '#F5F5F5',
  surfaceDark: '#111111',
  cardLight: '#FFFFFF',
  cardDark: '#1A1A1A',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textDisabled: '#ABABAB',
  textInverse: '#FFFFFF',
  textPrimaryDark: '#F5F5F5',
  textSecondaryDark: '#9E9E9E',

  // Semantic
  success: '#2D6A4F',
  successLight: '#D8F3DC',
  error: '#C62828',
  errorLight: '#FFEBEE',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  info: '#1565C0',
  infoLight: '#E3F2FD',

  // Dividers / borders
  border: '#E0E0E0',
  borderDark: '#2A2A2A',

  // India rupee positive/negative
  owed: '#C62828',
  owedBg: '#FFEBEE',
  owing: '#2D6A4F',
  owingBg: '#D8F3DC',
  settled: '#6B6B6B',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Minimum touch target per spec: 48×48 dp
export const TouchTarget = 48;
