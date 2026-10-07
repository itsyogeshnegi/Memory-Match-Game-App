// P2P Setup Screen: Configures Player 1 and Player 2 duel on same device

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BoardPairCount, GameConfig } from '../../types/game';
import { CARD_THEMES } from '../../theme/themes';
import { Colors } from '../../theme/colors';
import { Button } from '../common/Button';
import { HapticsService } from '../../services/haptics';

interface P2PSetupScreenProps {
  onStartGame: (config: GameConfig) => void;
  onBack: () => void;
  defaultP1Name?: string;
  defaultP2Name?: string;
  defaultThemeId?: string;
  defaultPreviewDuration?: number;
}

const BOARD_SIZES: BoardPairCount[] = [3, 6, 8, 12];

export const P2PSetupScreen: React.FC<P2PSetupScreenProps> = ({
  onStartGame,
  onBack,
  defaultP1Name = 'Player 1',
  defaultP2Name = 'Player 2',
  defaultThemeId = 'cosmic',
  defaultPreviewDuration = 1,
}) => {
  const [p1Name, setP1Name] = useState(defaultP1Name);
  const [p2Name, setP2Name] = useState(defaultP2Name);
  const [pairCount, setPairCount] = useState<BoardPairCount>(6);
  const [themeId, setThemeId] = useState(defaultThemeId);
  const [previewDuration, setPreviewDuration] = useState(defaultPreviewDuration);

  const handleStart = () => {
    onStartGame({
      mode: 'P2P',
      pairCount,
      player1Name: p1Name.trim() || 'Player 1',
      player2Name: p2Name.trim() || 'Player 2',
      previewDurationSeconds: previewDuration,
      themeId,
    });
  };

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
        <Text style={styles.headerTitle}>P2P SAME DEVICE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* PLAYERS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PLAYER NAMES</Text>

          {/* Player 1 Input */}
          <View style={styles.inputWrapper}>
            <View style={[styles.avatarDot, { backgroundColor: Colors.player1 }]}>
              <Ionicons name="person" size={14} color="#FFF" />
            </View>
            <TextInput
              value={p1Name}
              onChangeText={setP1Name}
              placeholder="Player 1 name"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              maxLength={14}
            />
          </View>

          {/* Player 2 Input */}
          <View style={[styles.inputWrapper, { marginTop: 10 }]}>
            <View style={[styles.avatarDot, { backgroundColor: Colors.player2 }]}>
              <Ionicons name="person-add" size={14} color="#FFF" />
            </View>
            <TextInput
              value={p2Name}
              onChangeText={setP2Name}
              placeholder="Player 2 name"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              maxLength={14}
            />
          </View>
        </View>

        {/* BOARD SIZE SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BOARD SIZE</Text>
          <View style={styles.boardSizesRow}>
            {BOARD_SIZES.map((count) => {
              const isSelected = pairCount === count;
              const totalCards = count * 2;

              return (
                <Pressable
                  key={count}
                  onPress={() => {
                    HapticsService.cardTap();
                    setPairCount(count);
                  }}
                  style={[
                    styles.sizeButton,
                    isSelected && styles.sizeButtonSelected,
                  ]}
                >
                  <Text style={[styles.sizeCount, isSelected && styles.sizeTextSelected]}>
                    {count}
                  </Text>
                  <Text style={[styles.sizeSub, isSelected && styles.sizeSubSelected]}>
                    PAIRS
                  </Text>
                  <Text style={styles.cardsNote}>{totalCards} cards</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* THEME SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CARD DECK THEME</Text>
          <View style={styles.themesRow}>
            {Object.values(CARD_THEMES).map((theme) => {
              const isSelected = themeId === theme.id;

              return (
                <Pressable
                  key={theme.id}
                  onPress={() => {
                    HapticsService.cardTap();
                    setThemeId(theme.id);
                  }}
                  style={[
                    styles.themeCard,
                    isSelected && [styles.themeCardSelected, { borderColor: theme.cardBackBorder }],
                  ]}
                >
                  <Ionicons
                    name={theme.cardBackPattern as any}
                    size={22}
                    color={isSelected ? theme.cardBackBorder : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeName,
                      isSelected && { color: '#FFF', fontWeight: '800' },
                    ]}
                  >
                    {theme.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* PREVIEW TIME SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STARTING PREVIEW</Text>
          <View style={styles.previewRow}>
            {[0, 1, 2, 3].map((secs) => {
              const isSelected = previewDuration === secs;

              return (
                <Pressable
                  key={secs}
                  onPress={() => {
                    HapticsService.cardTap();
                    setPreviewDuration(secs);
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

        {/* START BUTTON */}
        <View style={styles.footerSection}>
          <Button
            title="START 2-PLAYER DUEL"
            onPress={handleStart}
            variant="secondary"
            size="large"
            icon="play"
            fullWidth
          />
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 14,
    height: 50,
  },
  avatarDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  boardSizesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  sizeButtonSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.surfaceElevated,
  },
  sizeCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sizeTextSelected: {
    color: Colors.secondary,
  },
  sizeSub: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  sizeSubSelected: {
    color: Colors.secondary,
  },
  cardsNote: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  themeCardSelected: {
    backgroundColor: Colors.surfaceElevated,
  },
  themeName: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  previewPillSelected: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  previewPillText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  previewPillTextSelected: {
    color: Colors.secondary,
  },
  footerSection: {
    marginTop: 10,
    marginBottom: 40,
  },
});
