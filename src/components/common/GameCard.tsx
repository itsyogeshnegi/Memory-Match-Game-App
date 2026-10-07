// 3D Flip Game Card Component

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Pressable,
  Animated,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CardModel } from '../../types/game';
import { CardTheme } from '../../types/theme';
import { Colors } from '../../theme/colors';
import { HapticsService } from '../../services/haptics';

interface GameCardProps {
  card: CardModel;
  theme: CardTheme;
  cardWidth: number;
  cardHeight: number;
  onPress: (index: number) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GameCard: React.FC<GameCardProps> = ({
  card,
  theme,
  cardWidth,
  cardHeight,
  onPress,
  disabled = false,
  style,
}) => {
  // Flip animation value: 0 = HIDDEN (back showing), 180 = REVEALED / MATCHED (front showing)
  const flipAnim = useRef(new Animated.Value(card.state === 'HIDDEN' ? 0 : 180)).current;
  // Shake animation for mismatch
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Pulse animation for matched state
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isFlipped = card.state === 'REVEALED' || card.state === 'MATCHED';

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    if (card.state === 'MATCHED') {
      // Pulse animation on match
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [card.state, isFlipped]);

  const handlePress = () => {
    if (disabled || card.state !== 'HIDDEN') return;
    HapticsService.cardTap();
    onPress(card.index);
  };

  // Interpolations for 3D flip
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          width: cardWidth,
          height: cardHeight,
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        disabled={disabled || card.state !== 'HIDDEN'}
        style={styles.pressable}
      >
        {/* CARD BACK (HIDDEN) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            {
              width: cardWidth,
              height: cardHeight,
              transform: [{ perspective: 1000 }, { rotateY: backInterpolate }],
              opacity: backOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={theme.cardBackGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBack, { borderColor: theme.cardBackBorder }]}
          >
            <View style={styles.backPatternOuter}>
              <View style={styles.backPatternInner}>
                <Ionicons
                  name={theme.cardBackPattern as any}
                  size={cardWidth * 0.32}
                  color="rgba(255, 255, 255, 0.3)"
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* CARD FRONT (REVEALED / MATCHED) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            {
              width: cardWidth,
              height: cardHeight,
              transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }],
              opacity: frontOpacity,
              borderColor: card.state === 'MATCHED' ? Colors.emerald : Colors.primaryLight,
              backgroundColor: theme.cardFrontBackground,
            },
          ]}
        >
          <View style={styles.frontContent}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: `${card.color}20`,
                  borderColor: `${card.color}50`,
                },
              ]}
            >
              <Ionicons
                name={card.symbol as any}
                size={cardWidth * 0.42}
                color={card.color}
              />
            </View>

            {cardWidth >= 70 && (
              <Text
                numberOfLines={1}
                style={[styles.cardTitle, { color: card.color }]}
              >
                {card.title}
              </Text>
            )}

            {card.state === 'MATCHED' && (
              <View style={styles.matchedCheckBadge}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.emerald} />
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 14,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardBack: {
    zIndex: 1,
  },
  gradientBack: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  backPatternOuter: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPatternInner: {
    width: '75%',
    height: '75%',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFront: {
    zIndex: 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  frontContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  matchedCheckBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
