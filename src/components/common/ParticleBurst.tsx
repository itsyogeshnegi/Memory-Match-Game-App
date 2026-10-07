// Animated Particle Burst Component for match rewards and victory celebration

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface ParticleBurstProps {
  active: boolean;
  count?: number;
  colors?: string[];
  durationMs?: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
  xAnim: Animated.Value;
  yAnim: Animated.Value;
  opacityAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

const DEFAULT_COLORS = ['#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#A855F7', '#FBBF24'];

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  active,
  count = 24,
  colors = DEFAULT_COLORS,
  durationMs = 900,
  onComplete,
}) => {
  const particles = useRef<Particle[]>([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      const distance = 80 + Math.random() * 120;
      particles.current.push({
        id: i,
        color: colors[i % colors.length],
        angle,
        distance,
        size: 6 + Math.random() * 6,
        xAnim: new Animated.Value(0),
        yAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(0),
        scaleAnim: new Animated.Value(0.5),
      });
    }
  }

  useEffect(() => {
    if (!active) return;

    const animations: Animated.CompositeAnimation[] = [];

    particles.current.forEach((p) => {
      p.xAnim.setValue(0);
      p.yAnim.setValue(0);
      p.opacityAnim.setValue(1);
      p.scaleAnim.setValue(1);

      const targetX = Math.cos(p.angle) * p.distance;
      const targetY = Math.sin(p.angle) * p.distance;

      animations.push(
        Animated.parallel([
          Animated.timing(p.xAnim, {
            toValue: targetX,
            duration: durationMs,
            useNativeDriver: true,
          }),
          Animated.timing(p.yAnim, {
            toValue: targetY + 30, // slight gravity drop
            duration: durationMs,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacityAnim, {
            toValue: 0,
            duration: durationMs,
            useNativeDriver: true,
          }),
          Animated.timing(p.scaleAnim, {
            toValue: 0.2,
            duration: durationMs,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start(() => {
      if (onComplete) onComplete();
    });
  }, [active]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.centerContainer}>
        {particles.current.map((p) => (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.size / 2,
                transform: [
                  { translateX: p.xAnim },
                  { translateY: p.yAnim },
                  { scale: p.scaleAnim },
                ],
                opacity: p.opacityAnim,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
