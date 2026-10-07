// Achievements Screen displaying unlocked trophies and milestones

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AchievementItem } from '../../types/storage';
import { AchievementService } from '../../services/achievements';
import { Colors } from '../../theme/colors';
import { HapticsService } from '../../services/haptics';

interface AchievementsScreenProps {
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onBack }) => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const list = await AchievementService.getAllAchievements();
    setAchievements(list);
  };

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;
  const totalCount = achievements.length;
  const progressRatio = totalCount > 0 ? unlockedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            HapticsService.cardTap();
            onBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={32} color={Colors.gold} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryCount}>
              {unlockedCount} of {totalCount} Unlocked
            </Text>
            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* ACHIEVEMENTS LIST */}
        <View style={styles.list}>
          {achievements.map((item) => {
            const isUnlocked = item.unlockedAt !== null;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  isUnlocked && styles.itemCardUnlocked,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    isUnlocked ? styles.iconBoxUnlocked : styles.iconBoxLocked,
                  ]}
                >
                  <Ionicons
                    name={(isUnlocked ? item.icon : 'lock-closed') as any}
                    size={24}
                    color={isUnlocked ? Colors.gold : Colors.textMuted}
                  />
                </View>

                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, !isUnlocked && styles.itemTitleLocked]}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  {isUnlocked && (
                    <Text style={styles.unlockedDate}>
                      Unlocked {new Date(item.unlockedAt!).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {isUnlocked && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.emerald} />
                  </View>
                )}
              </View>
            );
          })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  trophyCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryCount: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
    opacity: 0.65,
  },
  itemCardUnlocked: {
    opacity: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: Colors.surfaceElevated,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxUnlocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  iconBoxLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  itemTitleLocked: {
    color: Colors.textSecondary,
  },
  itemDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  unlockedDate: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  checkmark: {
    marginLeft: 8,
  },
});
