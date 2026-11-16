import { StyleSheet, View } from 'react-native';
import { formatVisualValue, type VisualCardItem, type VisualFormat } from '../utils/visuals';
import { StatCard } from './StatCard';
import { VisualCard } from './VisualCard';

interface VisualStatCardsProps {
  title?: string;
  cards: VisualCardItem[];
  format: VisualFormat;
}

export function VisualStatCards({ title, cards, format }: VisualStatCardsProps) {
  return (
    <VisualCard title={title}>
      <View style={styles.list}>
        {cards.map((card, index) => (
          <StatCard
            key={`${card.label}-${index}`}
            title={card.label}
            value={formatVisualValue(card.value, format)}
            hint={card.note || undefined}
          />
        ))}
      </View>
    </VisualCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
