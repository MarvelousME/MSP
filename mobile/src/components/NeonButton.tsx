import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export const NeonButton = ({ title, onPress, variant = 'primary', style }: NeonButtonProps) => {
  const { colors, spacing, borderRadius } = useTheme();

  const buttonStyle: ViewStyle[] = [
    styles.button,
    {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
    }
  ];

  const textStyle: TextStyle[] = [styles.text];

  if (variant === 'primary') {
    buttonStyle.push({ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 });
    textStyle.push({ color: colors.background });
  } else if (variant === 'secondary') {
    buttonStyle.push({ backgroundColor: colors.secondary, shadowColor: colors.secondary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 });
    textStyle.push({ color: colors.text });
  } else {
    buttonStyle.push({ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border });
    textStyle.push({ color: colors.text });
  }

  return (
    <TouchableOpacity onPress={onPress} style={[buttonStyle, style]}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
