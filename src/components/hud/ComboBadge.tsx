// Combo Streak Badge with flame animation

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';

interface ComboBadgeProps {
  combo: number;
}

export const ComboBadge: React.FC<ComboBadgeProps> = ({ combo }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (combo > 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.25, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
  }, [combo]);

  if (combo <= 1) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={Colors.secondaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name="flame" size={14} color="#FFF" style={styles.icon} />
        <Text style={styles.text}>{combo}x COMBO</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
