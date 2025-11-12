export function replaceKeywords(text: string, dict: Record<string, string>): string {
  if (!text || !dict) return text;
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  let out = text;
  for (const k of keys) {
    const v = dict[k];
    if (!k) continue;
    out = out.split(k).join(v);
  }
  return out;
}

