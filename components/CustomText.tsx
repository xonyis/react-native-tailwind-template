import { FontStyles } from '@/constants/Fonts';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof FontStyles;
  fontFamily?: string;
}

export function CustomText({ 
  variant = 'body', 
  fontFamily, 
  style, 
  ...props 
}: CustomTextProps) {
  const fontStyle = FontStyles[variant];
  const finalStyle = [
    fontStyle,
    fontFamily ? { fontFamily } : {},
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
