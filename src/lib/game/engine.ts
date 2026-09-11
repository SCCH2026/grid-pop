import { BOARD_SIZE, type Board, type Cell, type ClearEvent, type ColorId, type Piece, type Shape } from "./types.ts";
import { SHAPES, bucketMix, shapeFamily, shapeWeight, sizeBucket, type SizeBucket } from "./shapes.ts";

let nextPieceId = 1;
let nextClearId = 1;

export function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => 0 as Cell));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice()) as Board;
}

export function occupancy(board: Board): number {
  let filled = 0;
  for (const row of board) {
    for (const cell of row) if (cell) filled++;
  }
  return filled / (BOARD_SIZE * BOARD_SIZE);
}

export function canPlace(board: Board, shape: Shape, row: number, col: number): boolean {
  for (const [dr, dc] of shape.cells) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r]![c] !== 0) return false;
  }
  return true;
}

export function canPlaceSomewhere(board: Board, shape: Shape): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, shape, r, c)) return true;
    }
  }
  return false;
}

export function anyPieceFits(board: Board, pieces: (Piece | null)[]): boolean {
  return pieces.some((p) => p !== null && canPlaceSomewhere(board, p.shape));
}

export function applyPlace(board: Board, piece: Piece, row: number, col: number): Board {
  const next = cloneBoard(board);
  for (const [dr, dc] of piece.shape.cells) {
    next[row + dr]![col + dc] = piece.color;
  }
  return next;
}

export function findFullLines(board: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i]!.every((cell) => cell !== 0)) rows.push(i);
    let colFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r]![i] === 0) {
        colFull = false;
        break;
      }
    }
    if (colFull) cols.push(i);
  }
  return { rows, cols };
}

export function collectClearCells(
  board: Board,
  rows: number[],
  cols: number[],
): { r: number; c: number; color: ColorId }[] {
  const seen = new Set<string>();
  const cells: { r: number; c: number; color: ColorId }[] = [];
  const add = (r: number, c: number) => {
    const key = `${r}:${c}`;
    if (seen.has(key)) return;
    seen.add(key);
    const color = board[r]![c];
    if (color) cells.push({ r, c, color });
  };
  for (const r of rows) for (let c = 0; c < BOARD_SIZE; c++) add(r, c);
  for (const c of cols) for (let r = 0; r < BOARD_SIZE; r++) add(r, c);
  return cells;
}

export function applyClear(board: Board, rows: number[], cols: number[]): Board {
  const next = cloneBoard(board);
  for (const r of rows) for (let c = 0; c < BOARD_SIZE; c++) next[r]![c] = 0;
  for (const c of cols) for (let r = 0; r < BOARD_SIZE; r++) next[r]![c] = 0;
  return next;
}

export function isEmpty(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell === 0));
}

export function scoreClear(lines: number, comboAfter: number): { linePts: number; comboPts: number } {
  if (lines <= 0) return { linePts: 0, comboPts: 0 };
  const baseLine = 10 * lines * lines + 8 * lines;
  const lineMult = lines >= 2 ? 3 : 2;
  const linePts = baseLine * lineMult * 10;
  if (comboAfter <= 1) return { linePts, comboPts: 0 };
  return { linePts, comboPts: comboBonusPerLine(comboAfter) * lines };
}

/** Diminishing combo bonus per line. Combo 2 stays 480; later steps flatten (≈ ln). */
export function comboBonusPerLine(comboAfter: number): number {
  if (comboAfter <= 1) return 0;
  let sum = 0;
  for (let i = 2; i <= comboAfter; i++) {
    const base = i >= 3 ? 600 : 480;
    sum += base / (1 + 0.32 * (i - 2));
  }
  return Math.round(sum);
}

/** Combo +1 on any clear; resets after 3 consecutive placements with no clear. */
export function tickCombo(combo: number, lines: number, misses: number): { combo: number; misses: number } {
  if (lines > 0) return { combo: combo + 1, misses: 0 };
  const next = misses + 1;
  if (next >= 3) return { combo: 0, misses: 0 };
  return { combo, misses: next };
}

function pickWeighted(items: Shape[], occupancyRatio: number, usedFam?: Set<string>, awkward = 1.12): Shape {
  let total = 0;
  const weights = items.map((s) => {
    let w = shapeWeight(s, occupancyRatio, awkward);
    if (usedFam?.has(shapeFamily(s.key))) w *= 0.42;
    total += w;
    return w;
  });
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return items[i]!;
  }
  return items[items.length - 1]!;
}

const COLORS: ColorId[] = [1, 2, 3, 4, 5, 6, 7, 8];

function pickColor(used: ColorId[]): ColorId {
  const pool = COLORS.filter((c) => !used.includes(c));
  const src = pool.length ? pool : COLORS;
  return src[Math.floor(Math.random() * src.length)]!;
}

function stubPiece(shape: Shape): Piece {
  return { id: 0, shape, color: 1 };
}

function pickUnused(pool: Shape[], used: Set<string>): Shape | null {
  const avail = pool.filter((s) => !used.has(s.key));
  const src = avail.length ? avail : pool;
  if (!src.length) return null;
  return src[Math.floor(Math.random() * src.length)]!;
}

interface ShapeHint {
  shape: Shape;
  maxLines: number;
  setups: number;
  fits: boolean;
}

function countNearLines(placed: Board): number {
  let n = 0;
  for (let i = 0; i < BOARD_SIZE; i++) {
    let rowEmpty = 0;
    let colEmpty = 0;
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (placed[i]![j] === 0) rowEmpty++;
      if (placed[j]![i] === 0) colEmpty++;
    }
    if (rowEmpty === 1) n++;
    if (colEmpty === 1) n++;
  }
  return n;
}

function evaluateShape(board: Board, shape: Shape): ShapeHint {
  let maxLines = 0;
  let setups = 0;
  let fits = false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!canPlace(board, shape, r, c)) continue;
      fits = true;
      const placed = applyPlace(board, stubPiece(shape), r, c);
      const { rows, cols } = findFullLines(placed);
      const lines = rows.length + cols.length;
      if (lines > maxLines) maxLines = lines;
      else if (lines === 0) {
        const near = countNearLines(placed);
        if (near > setups) setups = near;
      }
      if (maxLines >= 3) return { shape, maxLines, setups, fits };
    }
  }
  return { shape, maxLines, setups, fits };
}

function boardAfterBestClear(board: Board, shape: Shape): Board | null {
  let bestLines = 0;
  let best: Board | null = null;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!canPlace(board, shape, r, c)) continue;
      const placed = applyPlace(board, stubPiece(shape), r, c);
      const { rows, cols } = findFullLines(placed);
      const lines = rows.length + cols.length;
      if (lines > bestLines) {
        bestLines = lines;
        best = applyClear(placed, rows, cols);
      }
    }
  }
  return best;
}

function chance(p: number): boolean {
  return Math.random() < p;
}

function hintScore(h: ShapeHint): number {
  return h.maxLines * 50 + h.setups * 3 + Math.max(0, 6 - h.shape.cells.length);
}

function bestHint(
  hints: ShapeHint[],
  used: Set<string>,
  pred: (h: ShapeHint) => boolean,
): ShapeHint | null {
  const avail = hints.filter((h) => pred(h) && !used.has(h.shape.key));
  if (!avail.length) return null;
  if (Math.random() < 0.24) {
    avail.sort((a, b) => hintScore(b) - hintScore(a));
    return avail[0]!;
  }
  return avail[Math.floor(Math.random() * avail.length)]!;
}

export interface DealOpts {
  combo?: number;
  score?: number;
  misses?: number;
  forceFit?: boolean;
}

/** 0 = opening, 1 = long run. Soft ramp so mid-game stays familiar. */
export function dealProgress(score: number): number {
  return Math.max(0, Math.min(1, (Math.max(0, score) - 3500) / 24000));
}

export interface AssistRates {
  pMega: number;
  pClear: number;
  pSetup: number;
  pChain: number;
  pChain3: number;
  awkward: number;
}

/**
 * Occupancy + combo already steer the deal. Progress trims "free clears"
 * a little; combo 8+ adds a further nudge. Rescue is a coin-flip, not a
 * guaranteed lifeline.
 */
export function dealAssistRates(opts: {
  combo: number;
  occupancy: number;
  score?: number;
  misses?: number;
}): AssistRates {
  const combo = opts.combo;
  const occ = opts.occupancy;
  const misses = opts.misses ?? 0;
  const progress = dealProgress(opts.score ?? 0);
  const struggling = misses >= 2 || occ >= 0.58;
  const squeeze = struggling ? progress * 0.22 : progress;
  const heat = combo >= 8 ? (struggling ? 0.06 : 0.14) : 0;
  const cut = 1 - 0.26 * squeeze - heat;

  const pMega = (combo >= 2 ? 0.21 : 0.1) * cut;
  const pClear = (combo >= 1 ? 0.38 : occ > 0.1 ? 0.3 : 0.13) * cut;
  const pSetup = 0.17 + 0.04 * squeeze - (combo >= 8 ? 0.03 : 0);
  const pChain = (combo >= 1 ? 0.34 : 0.25) * cut;
  const pChain3 = (combo >= 1 ? 0.22 : 0.14) * cut;
  const awkward = 1.12 + 0.14 * squeeze + (combo >= 8 ? 0.1 : 0);
  return { pMega, pClear, pSetup, pChain, pChain3, awkward };
}

export const RESCUE_CHANCE = 0.5;

export function pickRescueShape(board: Board): Shape | null {
  const rescue = SHAPES.filter((s) => s.cells.length <= 3 && canPlaceSomewhere(board, s));
  if (!rescue.length) return null;
  return rescue[Math.floor(Math.random() * rescue.length)]!;
}

function rollBucket(
  mix: { s: number; m: number; l: number },
  groups: Record<SizeBucket, ShapeHint[]>,
): SizeBucket {
  const keys = (["s", "m", "l"] as const).filter((k) => groups[k].length > 0);
  if (!keys.length) return "s";
  let total = 0;
  const parts = keys.map((k) => {
    total += mix[k];
    return { k, w: mix[k] };
  });
  let r = Math.random() * total;
  for (const p of parts) {
    r -= p.w;
    if (r <= 0) return p.k;
  }
  return parts[parts.length - 1]!.k;
}

function dealSlot(
  pool: ShapeHint[],
  occ: number,
  used: Set<string>,
  rates: AssistRates,
): Shape {
  const unused = pool.filter((h) => !used.has(h.shape.key));
  const src = unused.length ? unused : pool;
  const groups: Record<SizeBucket, ShapeHint[]> = {
    s: src.filter((h) => sizeBucket(h.shape) === "s"),
    m: src.filter((h) => sizeBucket(h.shape) === "m"),
    l: src.filter((h) => sizeBucket(h.shape) === "l"),
  };
  const bucket = rollBucket(bucketMix(occ), groups);
  const inB = groups[bucket].length ? groups[bucket] : src;
  const usedFam = new Set([...used].map((k) => shapeFamily(k)));
  const hit =
    (chance(rates.pMega) ? bestHint(inB, used, (h) => h.maxLines >= 2) : null) ??
    (chance(rates.pClear) ? bestHint(inB, used, (h) => h.maxLines >= 1) : null) ??
    (chance(rates.pSetup) ? bestHint(inB, used, (h) => h.setups >= 1) : null);
  if (hit) return hit.shape;
  return pickWeighted(
    inB.map((h) => h.shape),
    occ,
    usedFam,
    rates.awkward,
  );
}

export function dealPieces(board: Board, opts?: DealOpts): Piece[] {
  const occ = occupancy(board);
  const combo = opts?.combo ?? 0;
  const rates = dealAssistRates({
    combo,
    occupancy: occ,
    score: opts?.score,
    misses: opts?.misses,
  });
  const hints = SHAPES.map((s) => evaluateShape(board, s));
  const fitting = hints.filter((h) => h.fits);
  const pool = fitting.length ? fitting : hints;
  const used = new Set<string>();

  const s1 = dealSlot(pool, occ, used, rates);
  used.add(s1.key);

  const h1 = pool.find((h) => h.shape.key === s1.key);
  const chainBoard = h1 && h1.maxLines >= 1 ? boardAfterBestClear(board, s1) : null;

  const pickChain = (p: number): Shape | null => {
    if (!chainBoard || !chance(p)) return null;
    const chainHints = SHAPES.filter((s) => !used.has(s.key)).map((s) => evaluateShape(chainBoard, s));
    const hit = bestHint(chainHints, used, (h) => h.maxLines >= 1 && h.fits);
    return hit?.shape ?? null;
  };

  const s2 = pickChain(rates.pChain) ?? dealSlot(pool, occ, used, rates);
  used.add(s2.key);

  const s3 = pickChain(rates.pChain3) ?? dealSlot(pool, occ, used, rates);
  used.add(s3.key);

  const picked = [s1, s2, s3];
  const usedColors: ColorId[] = [];
  const pieces: Piece[] = picked.map((shape) => {
    const color = pickColor(usedColors);
    usedColors.push(color);
    return { id: nextPieceId++, shape, color };
  });

  if (!anyPieceFits(board, pieces) && (opts?.forceFit || chance(RESCUE_CHANCE))) {
    const shape = pickRescueShape(board);
    if (shape) pieces[2] = { id: nextPieceId++, shape, color: pickColor(usedColors) };
  }
  return pieces;
}

export function dealFittingPieces(board: Board, opts?: DealOpts): Piece[] {
  return dealPieces(board, opts);
}

export function resolvePlace(
  board: Board,
  piece: Piece,
  row: number,
  col: number,
  combo: number,
): { boardPlaced: Board; event: ClearEvent } | null {
  if (!canPlace(board, piece.shape, row, col)) return null;
  const boardPlaced = applyPlace(board, piece, row, col);
  const { rows, cols } = findFullLines(boardPlaced);
  const lines = rows.length + cols.length;
  const cells = collectClearCells(boardPlaced, rows, cols);
  const nextCombo = lines > 0 ? combo + 1 : combo;
  const placePts = piece.shape.cells.length * 10;
  const { linePts, comboPts } = scoreClear(lines, nextCombo);
  const boardAfter = lines > 0 ? applyClear(boardPlaced, rows, cols) : boardPlaced;
  const perfect = lines > 0 && isEmpty(boardAfter);
  const perfectPts = perfect ? 3000 : 0;
  const event: ClearEvent = {
    id: nextClearId++,
    cells,
    rows,
    cols,
    lines,
    combo: nextCombo,
    placePts,
    linePts,
    comboPts,
    perfectPts,
    totalPts: placePts + linePts + comboPts + perfectPts,
    perfect,
    mega: lines >= 3,
  };
  return { boardPlaced, event };
}

export function boardAfterClear(boardPlaced: Board, event: ClearEvent): Board {
  if (event.lines === 0) return boardPlaced;
  return applyClear(boardPlaced, event.rows, event.cols);
}
