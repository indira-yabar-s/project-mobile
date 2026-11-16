export type RichBlock =
  | { type: 'p'; lines: string[] }
  | { type: 'ul' | 'ol'; items: string[] };

export interface InlinePart {
  kind: 'text' | 'bold' | 'italic';
  value: string;
}

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

export function parseBlocks(text: string | null | undefined): RichBlock[] {
  const blocks: RichBlock[] = [];
  let current: RichBlock | null = null;

  String(text ?? '')
    .split('\n')
    .forEach((rawLine) => {
      const line = rawLine.trimEnd();
      const bullet = line.match(BULLET);
      const numbered = bullet ? null : line.match(NUMBERED);

      if (bullet || numbered) {
        const type = bullet ? 'ul' : 'ol';
        const content = (bullet ?? numbered)![1];
        if (!current || current.type !== type) {
          current = { type, items: [] };
          blocks.push(current);
        }
        current.items.push(content);
        return;
      }

      if (line.trim() === '') {
        current = null;
        return;
      }

      if (current && current.type === 'p') {
        current.lines.push(line.trim());
      } else {
        current = { type: 'p', lines: [line.trim()] };
        blocks.push(current);
      }
    });

  return blocks;
}

export function parseInline(text: string): InlinePart[] {
  return String(text)
    .split(INLINE)
    .filter(Boolean)
    .map((part): InlinePart => {
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return { kind: 'bold', value: part.slice(2, -2) };
      }
      if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
        return { kind: 'italic', value: part.slice(1, -1) };
      }
      return { kind: 'text', value: part };
    });
}

export function stripMarks(text: string | null | undefined): string {
  return String(text ?? '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1');
}
