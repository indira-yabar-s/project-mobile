import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { parseBlocks, parseInline } from '../utils/richText';

interface FormattedTextProps {
  text: string;
  textStyle?: StyleProp<TextStyle>;
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, index) => {
        if (part.kind === 'bold') {
          return (
            <Text key={index} style={styles.bold}>
              {part.value}
            </Text>
          );
        }
        if (part.kind === 'italic') {
          return (
            <Text key={index} style={styles.italic}>
              {part.value}
            </Text>
          );
        }
        return part.value;
      })}
    </>
  );
}

export function FormattedText({ text, textStyle }: FormattedTextProps) {
  const blocks = parseBlocks(text);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        if (block.type !== 'p') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.item}>
                  <Text style={textStyle}>{block.type === 'ul' ? '•' : `${itemIndex + 1}.`}</Text>
                  <Text style={[styles.itemText, textStyle]}>
                    <Inline text={item} />
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={index} style={textStyle}>
            {block.lines.map((line, lineIndex) => (
              <Text key={lineIndex}>
                {lineIndex > 0 ? '\n' : ''}
                <Inline text={line} />
              </Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  list: { gap: 4 },
  item: { flexDirection: 'row', gap: 8 },
  itemText: { flex: 1 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
});
