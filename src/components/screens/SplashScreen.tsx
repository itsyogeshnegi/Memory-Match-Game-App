// Animated Splash Screen

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onFinish();
      }, 700);
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#090D16']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={Colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Ionicons name="grid" size={52} color="#FFFFFF" />
          </LinearGradient>

          <Text style={styles.title}>MEMORY</Text>
          <Text style={styles.titleSub}>MATCH</Text>
          <Text style={styles.tagline}>THE CASUAL MEMORY DUEL</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
  },
  titleSub: {
    color: Colors.primaryLight,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    marginTop: -6,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 12,
  },
});
