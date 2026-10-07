// Haptic feedback service with cross-platform and web fallbacks

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class HapticsService {
  private static enabled: boolean = true;

  public static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Subtle tick when tapping a card.
   */
  public static async cardTap(): Promise<void> {
    if (!this.enabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {
      // Haptics not supported or permission denied
    }
  }

  /**
   * Positive chime / haptic on successful card match.
   */
  public static async matchSuccess(): Promise<void> {
    if (!this.enabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 30, 40]);
      }
    } catch {
      // Fallback
    }
  }

  /**
   * Subtle error buzz on mismatch.
   */
  public static async mismatch(): Promise<void> {
    if (!this.enabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch {
      // Fallback
    }
  }

  /**
   * High impact buzz on combo milestone.
   */
  public static async comboMilestone(): Promise<void> {
    if (!this.enabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 20, 60]);
      }
    } catch {
      // Fallback
    }
  }

  /**
   * Celebratory vibration sequence on winning.
   */
  public static async victoryCelebration(): Promise<void> {
    if (!this.enabled) return;
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 50, 40, 50, 100]);
      }
    } catch {
      // Fallback
    }
  }
}
