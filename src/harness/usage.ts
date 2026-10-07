/** Harness rc.2 tokenUsage contains four disjoint provider-reported buckets. */
export function sessionTokens(usage: unknown): number | undefined {
  if (!usage || typeof usage !== 'object') return;
  const values = ['uncachedInputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens'].map(key => (usage as Record<string, unknown>)[key]);
  if (!values.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0)) return;
  const total = (values as number[]).reduce((a,b) => a+b, 0);
  return Number.isFinite(total) ? total : undefined;
}
export function formatTokens(value: number | undefined): string {
  if (value === undefined) return '—';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value) + ' tok';
}
