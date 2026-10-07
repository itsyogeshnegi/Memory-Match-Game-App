// AI Thinking State Indicator Banner

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface AIThinkingBannerProps {
  visible: boolean;
  step?: 'WAITING_FIRST_CARD' | 'WAITING_SECOND_CARD' | 'IDLE';
}

export const AIThinkingBanner: React.FC<AIThinkingBannerProps> = ({
  visible,
  step = 'WAITING_FIRST_CARD',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const statusText =
    step === 'WAITING_FIRST_CARD'
      ? 'AI scanning observed cards...'
      : 'AI locating partner card...';

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <Ionicons name="hardware-chip" size={16} color={Colors.aiPlayer} />
      </Animated.View>
      <Text style={styles.text}>{statusText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginVertical: 4,
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
