import { FontStyles } from '@/constants/Fonts';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof FontStyles;
  fontFamily?: string;
  bold?: boolean;
}

export function CustomText({ 
  variant = 'body', 
  fontFamily, 
  bold = false,
  style, 
  ...props 
}: CustomTextProps) {
  const fontStyle = FontStyles[variant];
  
  // Si bold est true, on utilise la version bold de la police
  let finalFontFamily = fontFamily || fontStyle.fontFamily;
  if (bold && !fontFamily) {
    // Mapper les variantes vers leurs versions bold
    const boldMapping: Record<string, string> = {
      'body': 'DMSans_700Bold',
      'bodySmall': 'DMSans_700Bold',
      'caption': 'DMSans_700Bold',
      'captionMedium': 'DMSans_700Bold',
      'h1': 'DMSans_700Bold',
      'h2': 'DMSans_700Bold',
      'h3': 'DMSans_700Bold',
      'h4': 'DMSans_700Bold',
      'button': 'DMSans_700Bold',
      'buttonSmall': 'Arimo_700Bold',
    };
    finalFontFamily = boldMapping[variant] || fontStyle.fontFamily;
  }
  
  const finalStyle = [
    fontStyle,
    { fontFamily: finalFontFamily },
    style,
  ];

  return <Text style={finalStyle} {...props} />;
}

// Composants spécialisés
export function Heading1(props: Omit<CustomTextProps, 'variant'>) {
  return <CustomText style={{ fontSize: 24, fontWeight: 'bold' }} variant="h1" {...props} />;
}

export function Heading2(props: Omit<CustomTextProps, 'variant'>) {
  return <CustomText variant="h2" {...props} />;
}

export function Heading3(props: Omit<CustomTextProps, 'variant'>) {
  return <CustomText variant="h3" {...props} />;
}

export function BodyText(props: Omit<CustomTextProps, 'variant'>) {
  return <CustomText variant="body" {...props} />;
}

export function Caption(props: Omit<CustomTextProps, 'variant'>) {
  return <CustomText variant="caption" {...props} />;
}

// Composants spécialisés pour le texte en gras
export function BoldText(props: Omit<CustomTextProps, 'variant' | 'bold'>) {
  return <CustomText variant="body" bold={true} {...props} />;
}

export function BoldHeading1(props: Omit<CustomTextProps, 'variant' | 'bold'>) {
  return <CustomText variant="h1" bold={true} {...props} />;
}

export function BoldHeading2(props: Omit<CustomTextProps, 'variant' | 'bold'>) {
  return <CustomText variant="h2" bold={true} {...props} />;
}

export function BoldHeading3(props: Omit<CustomTextProps, 'variant' | 'bold'>) {
  return <CustomText variant="h3" bold={true} {...props} />;
}

export function BoldCaption(props: Omit<CustomTextProps, 'variant' | 'bold'>) {
  return <CustomText variant="caption" bold={true} {...props} />;
}
