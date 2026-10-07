// Root Application Component for Memory Match

import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GameConfig, GameResult } from './src/types/game';
import { AchievementItem, UserSettings } from './src/types/storage';
import { StorageService } from './src/services/storage';
import { HapticsService } from './src/services/haptics';
import { Colors } from './src/theme/colors';

// Screens
import { SplashScreen } from './src/components/screens/SplashScreen';
import { MainMenuScreen } from './src/components/screens/MainMenuScreen';
import { AISetupScreen } from './src/components/screens/AISetupScreen';
import { P2PSetupScreen } from './src/components/screens/P2PSetupScreen';
import { GameScreen } from './src/components/screens/GameScreen';
import { ResultsScreen } from './src/components/screens/ResultsScreen';
import { StatisticsScreen } from './src/components/screens/StatisticsScreen';
import { AchievementsScreen } from './src/components/screens/AchievementsScreen';
import { SettingsScreen } from './src/components/screens/SettingsScreen';

type AppScreen =
  | 'SPLASH'
  | 'MAIN_MENU'
  | 'AI_SETUP'
  | 'P2P_SETUP'
  | 'PLAYING'
  | 'RESULTS'
  | 'STATISTICS'
  | 'ACHIEVEMENTS'
  | 'SETTINGS';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('SPLASH');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [newAchievements, setNewAchievements] = useState<AchievementItem[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    StorageService.getSettings().then((s) => {
      setSettings(s);
      HapticsService.setEnabled(s.hapticsEnabled);
    });
  }, []);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setCurrentScreen('PLAYING');
  };

  const handleGameComplete = (result: GameResult, unlocked: AchievementItem[]) => {
    setLastResult(result);
    setNewAchievements(unlocked);
    setCurrentScreen('RESULTS');
  };

  const handleRematch = () => {
    if (!gameConfig) {
      setCurrentScreen('MAIN_MENU');
      return;
    }
    // Re-launch with fresh match seed
    setCurrentScreen('PLAYING');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {currentScreen === 'SPLASH' && (
        <SplashScreen onFinish={() => setCurrentScreen('MAIN_MENU')} />
      )}

      {currentScreen === 'MAIN_MENU' && (
        <MainMenuScreen
          onSelectAI={() => setCurrentScreen('AI_SETUP')}
          onSelectP2P={() => setCurrentScreen('P2P_SETUP')}
          onOpenStats={() => setCurrentScreen('STATISTICS')}
          onOpenAchievements={() => setCurrentScreen('ACHIEVEMENTS')}
          onOpenSettings={() => setCurrentScreen('SETTINGS')}
        />
      )}

      {currentScreen === 'AI_SETUP' && (
        <AISetupScreen
          onStartGame={handleStartGame}
          onBack={() => setCurrentScreen('MAIN_MENU')}
          defaultPlayerName={settings?.player1DefaultName}
          defaultThemeId={settings?.themeId}
          defaultPreviewDuration={settings?.previewDurationSeconds}
        />
      )}

      {currentScreen === 'P2P_SETUP' && (
        <P2PSetupScreen
          onStartGame={handleStartGame}
          onBack={() => setCurrentScreen('MAIN_MENU')}
          defaultP1Name={settings?.player1DefaultName}
          defaultP2Name={settings?.player2DefaultName}
          defaultThemeId={settings?.themeId}
          defaultPreviewDuration={settings?.previewDurationSeconds}
        />
      )}

      {currentScreen === 'PLAYING' && gameConfig && (
        <GameScreen
          config={gameConfig}
          onGameComplete={handleGameComplete}
          onQuitToMenu={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {currentScreen === 'RESULTS' && lastResult && (
        <ResultsScreen
          result={lastResult}
          newAchievements={newAchievements}
          onRematch={handleRematch}
          onHome={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {currentScreen === 'STATISTICS' && (
        <StatisticsScreen onBack={() => setCurrentScreen('MAIN_MENU')} />
      )}

      {currentScreen === 'ACHIEVEMENTS' && (
        <AchievementsScreen onBack={() => setCurrentScreen('MAIN_MENU')} />
      )}

      {currentScreen === 'SETTINGS' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('MAIN_MENU')}
          onThemeChanged={(newTheme) => {
            if (settings) {
              setSettings({ ...settings, themeId: newTheme });
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
