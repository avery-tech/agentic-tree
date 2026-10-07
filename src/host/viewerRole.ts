/** Display metadata only. Never execute, infer duties, or search quoted/tool content. */
import type { ViewerRole } from '../model';
const emojiPrefix = '(?:[\\p{Extended_Pictographic}\\p{Emoji_Presentation}\\uFE0F\\u200D]+\\s*)?';
const opening = new RegExp(`^(?:Ты\\s*[—–-]\\s*|(?:Роль|Role):\\s*|You are\\s+(?:(?:a|an)\\s+)?)(${emojiPrefix}[\\p{L}][\\p{L}\\p{N}_-]{0,39})(?=$|[,.(]|\\s)`, 'iu');
function validName(name: string) {
  return name.length <= 64 && /\p{L}/u.test(name) && /^[\p{L}\p{N}\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D _-]+$/u.test(name);
}
export function roleFromAssignment(content: unknown, seq: number): ViewerRole | undefined {
  if (!Array.isArray(content)) return;
  // The header must be at the very beginning of the first text block, not anywhere in a prompt.
  const first = content.find(block => block?.type === 'text' && typeof block.text === 'string' && block.text.trim());
  if (!first) return;
  const lines = first.text.slice(0, 2048).trimStart().split(/\r?\n/);
  const header = lines[0].trim();
  if (/^Viewer role:/i.test(header)) {
    const name = header.slice('Viewer role:'.length).trim();
    if (!validName(name) || lines.slice(1).some((line: string) => /^Viewer role:/i.test(line.trim()))) return;
    return { name, source: 'explicit', seq };
  }
  const match = opening.exec(header);
  const name = match?.[1].trim();
  if (!name || !validName(name)) return;
  const rest = header.slice(match![0].length);
  const token = name.match(/[\p{L}][\p{L}\p{N}_-]*$/u)?.[0].toLowerCase();
  const familiar = new Set(['developer', 'reviewer', 'architect', 'devguy', 'tester', 'researcher', 'designer']);
  if (/^\s*(?:$|[,.(]|(?:проекта|project)(?:\s|$))/iu.test(rest) || (token && familiar.has(token))) {
    return { name, source: 'opening', seq };
  }
}
