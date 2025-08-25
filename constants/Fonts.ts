// Configuration des polices
export const Fonts = {
  arimo: {
    regular: 'Arimo_400Regular',
    medium: 'Arimo_500Medium',
    semiBold: 'Arimo_600SemiBold',
    bold: 'Arimo_700Bold',
    italic: 'Arimo_400Regular_Italic',
    boldItalic: 'Arimo_700Bold_Italic',
  },
  dmSans: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semiBold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold',
    italic: 'DMSans_400Regular_Italic',
    boldItalic: 'DMSans_700Bold_Italic',
  },
  default: 'Arimo_400Regular', // Police par défaut
} as const;

// Styles de police prédéfinis
export const FontStyles = {
  // Headers
  h1: {
    fontFamily: Fonts.dmSans.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: Fonts.dmSans.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h3: {
    fontFamily: Fonts.dmSans.semiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontFamily: Fonts.dmSans.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  
  // Body text
  body: {
    fontFamily: Fonts.dmSans.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Fonts.dmSans.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: Fonts.dmSans.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Captions
  caption: {
    fontFamily: Fonts.dmSans.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  captionMedium: {
    fontFamily: Fonts.dmSans.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Buttons
  button: {
    fontFamily: Fonts.dmSans.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonSmall: {
    fontFamily: Fonts.arimo.medium,
    fontSize: 14,
    lineHeight: 20,
  },
} as const;
