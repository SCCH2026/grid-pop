import type { Shape } from "./types.ts";

function shape(key: string, cells: Array<[number, number]>): Shape {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  const norm = cells.map(([r, c]) => [r - minR, c - minC] as const);
  const w = Math.max(...norm.map(([, c]) => c)) + 1;
  const h = Math.max(...norm.map(([r]) => r)) + 1;
  return { key, cells: norm, w, h };
}

function rect(h: number, w: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) cells.push([r, c]);
  }
  return cells;
}

export const SHAPES: Shape[] = [
  shape("dot", [[0, 0]]),
  shape("i2h", [[0, 0], [0, 1]]),
  shape("i2v", [[0, 0], [1, 0]]),
  shape("i3h", [[0, 0], [0, 1], [0, 2]]),
  shape("i3v", [[0, 0], [1, 0], [2, 0]]),
  shape("i4h", [[0, 0], [0, 1], [0, 2], [0, 3]]),
  shape("i4v", [[0, 0], [1, 0], [2, 0], [3, 0]]),
  shape("i5h", [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]),
  shape("i5v", [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]),
  shape("o2", rect(2, 2)),
  shape("r23", rect(2, 3)),
  shape("r32", rect(3, 2)),
  shape("o3", rect(3, 3)),

  shape("l3a", [[0, 0], [1, 0], [1, 1]]),
  shape("l3b", [[0, 0], [0, 1], [1, 0]]),
  shape("l3c", [[0, 0], [0, 1], [1, 1]]),
  shape("l3d", [[0, 1], [1, 0], [1, 1]]),

  shape("l4a", [[0, 0], [1, 0], [2, 0], [2, 1]]),
  shape("l4b", [[0, 2], [1, 0], [1, 1], [1, 2]]),
  shape("l4c", [[0, 0], [0, 1], [1, 1], [2, 1]]),
  shape("l4d", [[0, 0], [0, 1], [0, 2], [1, 0]]),
  shape("j4a", [[0, 1], [1, 1], [2, 0], [2, 1]]),
  shape("j4b", [[0, 0], [1, 0], [1, 1], [1, 2]]),
  shape("j4c", [[0, 0], [0, 1], [1, 0], [2, 0]]),
  shape("j4d", [[0, 0], [0, 1], [0, 2], [1, 2]]),

  shape("s4a", [[0, 1], [0, 2], [1, 0], [1, 1]]),
  shape("s4b", [[0, 0], [1, 0], [1, 1], [2, 1]]),
  shape("z4a", [[0, 0], [0, 1], [1, 1], [1, 2]]),
  shape("z4b", [[0, 1], [1, 0], [1, 1], [2, 0]]),

  shape("t4a", [[0, 0], [0, 1], [0, 2], [1, 1]]),
  shape("t4b", [[0, 1], [1, 0], [1, 1], [2, 1]]),
  shape("t4c", [[0, 1], [1, 0], [1, 1], [1, 2]]),
  shape("t4d", [[0, 0], [1, 0], [1, 1], [2, 0]]),

  shape("L5a", [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]),
  shape("L5b", [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]]),
  shape("L5c", [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]),
  shape("L5d", [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]]),
];

export type SizeBucket = "s" | "m" | "l";

export function sizeBucket(shape: Shape): SizeBucket {
  const n = shape.cells.length;
  if (n <= 3) return "s";
  if (n === 4) return "m";
  return "l";
}

export function shapeFamily(key: string): string {
  if (key === "dot" || key.startsWith("i")) return "I";
  if (key.startsWith("o") || key.startsWith("r")) return "R";
  if (key.startsWith("s") || key.startsWith("z")) return "S";
  if (key.startsWith("t4")) return "T";
  return "L";
}

export interface BucketMix {
  s: number;
  m: number;
  l: number;
}

export function bucketMix(occupancy: number): BucketMix {
  const t = Math.max(0, Math.min(1, occupancy));
  const lerp = (a: BucketMix, b: BucketMix, k: number): BucketMix => ({
    s: a.s + (b.s - a.s) * k,
    m: a.m + (b.m - a.m) * k,
    l: a.l + (b.l - a.l) * k,
  });
  const empty = { s: 0.16, m: 0.24, l: 0.6 };
  const base = { s: 0.35, m: 0.4, l: 0.25 };
  const packed = { s: 0.4, m: 0.45, l: 0.15 };
  if (t <= 0.08) return lerp(empty, base, t / 0.08);
  if (t <= 0.4) return base;
  return lerp(base, packed, Math.min(1, (t - 0.4) / 0.45));
}

export function shapeWeight(shape: Shape, _occupancy: number, awkward = 1.12): number {
  const key = shape.key;
  let w = 1;
  if (key === "dot") w *= 0.7;
  if (/^(s4|z4|t4|L5)/.test(key)) w *= awkward;
  return w;
}
