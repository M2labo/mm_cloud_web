const COLOR_STOPS = [
  '#FF0000', // 赤
  '#FF7F00', // 橙
  '#FFFF00', // 黄
  '#00FF00', // 緑
  '#00FFFF', // シアン
  '#0000FF', // 青
] as const;

export function getGradientColor(value: number): string {
  const v = Math.max(0, Math.min(1, value));
  // 赤→青 ではなく、青→赤になるよう反転
  const t = 1 - v;

  const stops = COLOR_STOPS;
  const len = stops.length;
  const segments = len - 1;

  // セグメント内での位置を計算
  const scaled = t * segments;
  const idx = Math.floor(scaled);
  const frac = scaled - idx;

  // 最後のストップの場合はそのまま返す
  if (idx >= segments) {
    return stops[len - 1];
  }

  const c0 = stops[idx];
  const c1 = stops[idx + 1];

  const [r0, g0, b0] = hexToRgb(c0);
  const [r1, g1, b1] = hexToRgb(c1);

  // 線形補間
  const r = Math.round(r0 + (r1 - r0) * frac);
  const g = Math.round(g0 + (g1 - g0) * frac);
  const b = Math.round(b0 + (b1 - b0) * frac);

  // [R, G, B] → "#RRGGBB"
  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// "#RRGGBB" → [R, G, B]
export const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.match(/^#?([A-Fa-f0-9]{6})$/);
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  const int = parseInt(m[1], 16);
  return [
    (int >> 16) & 0xff,
    (int >> 8) & 0xff,
    int & 0xff,
  ];
};