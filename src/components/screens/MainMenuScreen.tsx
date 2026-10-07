// Main Menu Screen with primary game mode selectors

import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { HapticsService } from '../../services/haptics';

interface MainMenuScreenProps {
  onSelectAI: () => void;
  onSelectP2P: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onSelectAI,
  onSelectP2P,
  onOpenStats,
  onOpenAchievements,
  onOpenSettings,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* HERO LOGO & TITLE */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={Colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Ionicons name="grid" size={38} color="#FFFFFF" />
          </LinearGradient>

          <Text style={styles.appTitle}>MEMORY</Text>
          <Text style={styles.appTitleSub}>MATCH</Text>
          <Text style={styles.tagline}>The Ultimate Mind & Reflex Duel</Text>
        </View>

        {/* PRIMARY GAME MODES */}
        <View style={styles.modesContainer}>
          <Text style={styles.sectionHeader}>SELECT PLAY MODE</Text>

          {/* MODE 1: MATCH WITH AI */}
          <Pressable
            onPress={() => {
              HapticsService.cardTap();
              onSelectAI();
            }}
            style={({ pressed }) => [styles.modeCard, pressed && styles.cardPressed]}
          >
            <LinearGradient
              colors={['#1E1B4B', '#312E81']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                <Ionicons name="hardware-chip" size={32} color={Colors.primaryLight} />
              </View>

              <View style={styles.modeTextContainer}>
                <View style={styles.badgeRow}>
                  <Text style={styles.modeTitle}>MATCH WITH AI</Text>
                  <View style={styles.modePill}>
                    <Text style={styles.modePillText}>SOLO</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Duel bots with legitimate observation memory across 4 difficulties.
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color={Colors.textMuted} />
            </LinearGradient>
          </Pressable>

          {/* MODE 2: P2P SAME DEVICE */}
          <Pressable
            onPress={() => {
              HapticsService.cardTap();
              onSelectP2P();
            }}
            style={({ pressed }) => [styles.modeCard, pressed && styles.cardPressed]}
          >
            <LinearGradient
              colors={['#27123A', '#4C1D95']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                <Ionicons name="people" size={32} color={Colors.secondary} />
              </View>

              <View style={styles.modeTextContainer}>
                <View style={styles.badgeRow}>
                  <Text style={styles.modeTitle}>P2P SAME DEVICE</Text>
                  <View style={[styles.modePill, { backgroundColor: Colors.secondary }]}>
                    <Text style={styles.modePillText}>2 PLAYERS</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Pass-and-play duel with anti-spoiler privacy shields between turns.
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color={Colors.textMuted} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* SECONDARY NAVIGATION TILES */}
        <View style={styles.navRow}>
          {/* STATS */}
          <Pressable
            onPress={() => {
              HapticsService.cardTap();
              onOpenStats();
            }}
            style={({ pressed }) => [styles.navTile, pressed && styles.cardPressed]}
          >
            <Ionicons name="bar-chart" size={22} color={Colors.cyan} />
            <Text style={styles.navTileText}>Stats</Text>
          </Pressable>

          {/* ACHIEVEMENTS */}
          <Pressable
            onPress={() => {
              HapticsService.cardTap();
              onOpenAchievements();
            }}
            style={({ pressed }) => [styles.navTile, pressed && styles.cardPressed]}
          >
            <Ionicons name="ribbon" size={22} color={Colors.gold} />
            <Text style={styles.navTileText}>Awards</Text>
          </Pressable>

          {/* SETTINGS */}
          <Pressable
            onPress={() => {
              HapticsService.cardTap();
              onOpenSettings();
            }}
            style={({ pressed }) => [styles.navTile, pressed && styles.cardPressed]}
          >
            <Ionicons name="settings-sharp" size={22} color={Colors.emerald} />
            <Text style={styles.navTileText}>Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
  },
  appTitleSub: {
    color: Colors.primaryLight,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: -4,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  modesContainer: {
    width: '100%',
    marginBottom: 28,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginLeft: 4,
  },
  modeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: 20,
  },
  modeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  modePill: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  modePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  modeDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  navTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  navTileText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
