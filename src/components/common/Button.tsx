// Premium Animated Button Component

import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { HapticsService } from '../../services/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'emerald' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  size = 'medium',
  fullWidth = false,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    HapticsService.cardTap();
    onPress();
  };

  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return Colors.primaryGradient;
      case 'secondary':
        return Colors.secondaryGradient;
      case 'gold':
        return Colors.goldGradient;
      case 'emerald':
        return Colors.emeraldGradient;
      case 'danger':
        return [Colors.crimson, '#DC2626'];
      default:
        return ['transparent', 'transparent'];
    }
  };

  const isGhost = variant === 'ghost';

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, iconSize: 16 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, iconSize: 20 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18, iconSize: 24 },
  }[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isGhost ? (
        <View
          style={[
            styles.ghostContainer,
            { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text} size="small" />
          ) : (
            <View style={styles.contentRow}>
              {icon && iconPosition === 'left' && (
                <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color={Colors.textSecondary}
                  style={styles.iconLeft}
                />
              )}
              <Text style={[styles.ghostText, { fontSize: sizeStyles.fontSize }, textStyle]}>
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color={Colors.textSecondary}
                  style={styles.iconRight}
                />
              )}
            </View>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.contentRow}>
              {icon && iconPosition === 'left' && (
                <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color="#FFFFFF"
                  style={styles.iconLeft}
                />
              )}
              <Text style={[styles.text, { fontSize: sizeStyles.fontSize }, textStyle]}>
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color="#FFFFFF"
                  style={styles.iconRight}
                />
              )}
            </View>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  ghostContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ghostText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
