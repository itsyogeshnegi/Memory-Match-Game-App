// Settings Screen for themes, audio, haptics, and data management

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSettings } from '../../types/storage';
import { StorageService } from '../../services/storage';
import { CARD_THEMES } from '../../theme/themes';
import { Colors } from '../../theme/colors';
import { Button } from '../common/Button';
import { HapticsService } from '../../services/haptics';

interface SettingsScreenProps {
  onBack: () => void;
  onThemeChanged?: (themeId: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onThemeChanged }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await StorageService.getSettings();
    setSettings(s);
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;
    const updated = await StorageService.saveSettings({ [key]: value });
    setSettings(updated);

    if (key === 'hapticsEnabled') {
      HapticsService.setEnabled(value as boolean);
    }
    if (key === 'themeId' && onThemeChanged) {
      onThemeChanged(value as string);
    }
  };

  const handleResetData = () => {
    HapticsService.cardTap();
    Alert.alert(
      'Reset All Game Data',
      'Are you sure you want to erase all high scores, career statistics, and unlocked achievements? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            await loadSettings();
            Alert.alert('Data Reset', 'All high scores, stats, and achievements have been reset.');
          },
        },
      ]
    );
  };

  if (!settings) return null;

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
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* PREFERENCES */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>TACTILE & AUDIO</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="hardware-chip-outline" size={20} color={Colors.primaryLight} />
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Haptic Feedback</Text>
                <Text style={styles.toggleSub}>Vibrations on card tap, match, and combo</Text>
              </View>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(val) => updateSetting('hapticsEnabled', val)}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={styles.toggleLeft}>
              <Ionicons name="volume-high-outline" size={20} color={Colors.emerald} />
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Sound Cues</Text>
                <Text style={styles.toggleSub}>Audio effects for matches and turns</Text>
              </View>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val) => updateSetting('soundEnabled', val)}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* DEFAULT CARD DECK THEME */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>DEFAULT CARD DECK</Text>
          <View style={styles.themesGrid}>
            {Object.values(CARD_THEMES).map((theme) => {
              const isSelected = settings.themeId === theme.id;

              return (
                <Pressable
                  key={theme.id}
                  onPress={() => {
                    HapticsService.cardTap();
                    updateSetting('themeId', theme.id);
                  }}
                  style={[
                    styles.themeTile,
                    isSelected && [styles.themeTileSelected, { borderColor: theme.cardBackBorder }],
                  ]}
                >
                  <Ionicons
                    name={theme.cardBackPattern as any}
                    size={26}
                    color={isSelected ? theme.cardBackBorder : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeTileName,
                      isSelected && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {theme.name}
                  </Text>
                  <Text style={styles.themeTagline} numberOfLines={1}>
                    {theme.tagline}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* PREVIEW TIME */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>DEFAULT PREVIEW TIME</Text>
          <View style={styles.previewRow}>
            {[0, 1, 2, 3].map((secs) => {
              const isSelected = settings.previewDurationSeconds === secs;

              return (
                <Pressable
                  key={secs}
                  onPress={() => {
                    HapticsService.cardTap();
                    updateSetting('previewDurationSeconds', secs);
                  }}
                  style={[styles.previewPill, isSelected && styles.previewPillSelected]}
                >
                  <Text
                    style={[
                      styles.previewPillText,
                      isSelected && styles.previewPillTextSelected,
                    ]}
                  >
                    {secs === 0 ? 'None' : `${secs}s`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* DATA MANAGEMENT */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>DATA & STORAGE</Text>
          <Text style={styles.dataDesc}>
            High scores, statistics, and unlocked achievements are persisted on this device.
          </Text>
          <Button
            title="RESET ALL LOCAL DATA"
            onPress={handleResetData}
            variant="danger"
            size="medium"
            icon="trash-outline"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </View>

        {/* APP INFO */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Memory Match • Version 1.0.0</Text>
          <Text style={styles.appInfoSub}>Production Grade Mobile Game Engine</Text>
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
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  toggleTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeTile: {
    width: '48%',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  themeTileSelected: {
    backgroundColor: Colors.surface,
  },
  themeTileName: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  themeTagline: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewPill: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  previewPillSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  previewPillText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  previewPillTextSelected: {
    color: Colors.primaryLight,
  },
  dataDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 16,
  },
  appInfoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  appInfoSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
