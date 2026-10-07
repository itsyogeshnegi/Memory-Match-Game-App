// Responsive Board Grid Component

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { CardModel } from '../../types/game';
import { CardTheme } from '../../types/theme';
import { GameCard } from '../common/GameCard';

interface BoardGridProps {
  cards: CardModel[];
  columns: number;
  rows: number;
  theme: CardTheme;
  onCardPress: (index: number) => void;
  disabled?: boolean;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  cards,
  columns,
  rows,
  theme,
  onCardPress,
  disabled = false,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Calculate available space
  // Leave room for HUD, banners, and margins
  const maxWidth = Math.min(windowWidth - 24, 520);
  const maxHeight = windowHeight * 0.68;

  // Compute card dimensions
  const horizontalPadding = 8;
  const cardGap = 8;
  const availableGridWidth = maxWidth - horizontalPadding * 2;
  const computedCardWidth = Math.floor(
    (availableGridWidth - cardGap * (columns - 1)) / columns
  );

  // Height proportional to aspect ratio, constrained by maxHeight
  const idealAspect = 1.25;
  const rawCardHeight = Math.floor(computedCardWidth * idealAspect);
  const totalGridHeight = rawCardHeight * rows + cardGap * (rows - 1);

  let cardWidth = computedCardWidth;
  let cardHeight = rawCardHeight;

  if (totalGridHeight > maxHeight) {
    cardHeight = Math.floor((maxHeight - cardGap * (rows - 1)) / rows);
    cardWidth = Math.min(computedCardWidth, Math.floor(cardHeight / idealAspect));
  }

  // Safety clamps
  cardWidth = Math.max(54, Math.min(cardWidth, 120));
  cardHeight = Math.max(68, Math.min(cardHeight, 150));

  return (
    <View style={styles.gridContainer}>
      <View
        style={[
          styles.grid,
          {
            width: cardWidth * columns + cardGap * (columns - 1) + 16,
          },
        ]}
      >
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            theme={theme}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            onPress={onCardPress}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
});
