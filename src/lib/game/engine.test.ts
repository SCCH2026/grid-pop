import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { boardAfterClear, comboBonusPerLine, dealAssistRates, dealPieces, dealProgress, emptyBoard, pickRescueShape, RESCUE_CHANCE, resolvePlace, scoreClear, tickCombo } from "./engine.ts";
import { bucketMix } from "./shapes.ts";
import type { Board, Piece } from "./types.ts";

function fillRow(board: Board, row: number, except: number[]) {
  for (let c = 0; c < 8; c++) {
    if (!except.includes(c)) board[row]![c] = 1;
  }
}

function canClear(board: Board, piece: Piece, combo = 0): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const res = resolvePlace(board, piece, r, c, combo);
      if (res && res.event.lines > 0) return true;
    }
  }
  return false;
}

function canChain(board: Board, pieces: Piece[]): boolean {
  for (let a = 0; a < pieces.length; a++) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const first = resolvePlace(board, pieces[a]!, r, c, 1);
        if (!first || first.event.lines === 0) continue;
        const next = boardAfterClear(first.boardPlaced, first.event);
        for (let b = 0; b < pieces.length; b++) {
          if (b === a) continue;
          if (canClear(next, pieces[b]!, 2)) return true;
        }
      }
    }
  }
  return false;
}

describe("dealPieces", () => {
  it("returns three pieces", () => {
    const pieces = dealPieces(emptyBoard());
    assert.equal(pieces.length, 3);
    for (const p of pieces) assert.ok(p.shape.cells.length >= 1);
  });

  it("does not deal C, 2x4, 4x2, plus, big-T, or big-Z shapes", () => {
    const banned = /^(T5|u5|r24|r42|plus|z5|p5)/;
    for (let i = 0; i < 40; i++) {
      for (const p of dealPieces(emptyBoard())) {
        assert.equal(banned.test(p.shape.key), false, p.shape.key);
      }
    }
  });

  it("usually deals a clearer when a row is one cell short", () => {
    const board = emptyBoard();
    fillRow(board, 0, [7]);
    let hits = 0;
    for (let i = 0; i < 30; i++) {
      if (dealPieces(board).some((p) => canClear(board, p))) hits++;
    }
    assert.ok(hits >= 11, `expected some clears, got ${hits}/30`);
  });

  it("usually deals a clearer during an active combo", () => {
    const board = emptyBoard();
    fillRow(board, 0, [7]);
    fillRow(board, 1, [7]);
    let hits = 0;
    for (let i = 0; i < 24; i++) {
      const pieces = dealPieces(board, { combo: 2 });
      if (pieces.some((p) => canClear(board, p, 2))) hits++;
    }
    assert.ok(hits >= 10, `expected some combo-friendly deals, got ${hits}/24`);
  });

  it("usually deals a chain pair when two rows are one short", () => {
    const board = emptyBoard();
    fillRow(board, 0, [7]);
    fillRow(board, 1, [7]);
    let chains = 0;
    for (let i = 0; i < 24; i++) {
      if (canChain(board, dealPieces(board, { combo: 1 }))) chains++;
    }
    assert.ok(chains >= 6, `expected some chain deals, got ${chains}/24`);
  });
});

describe("scoreClear", () => {
  it("doubles a single-line clear", () => {
    assert.equal(scoreClear(1, 1).linePts, (10 + 8) * 2 * 10);
    assert.equal(scoreClear(1, 1).comboPts, 0);
  });

  it("triples a multi-line clear", () => {
    assert.equal(scoreClear(2, 1).linePts, (10 * 4 + 16) * 3 * 10);
    assert.equal(scoreClear(3, 1).linePts, (10 * 9 + 24) * 3 * 10);
    assert.equal(scoreClear(6, 1).linePts, (10 * 36 + 48) * 3 * 10);
  });

  it("pays a combo bonus of 480 on the first combo", () => {
    assert.equal(scoreClear(1, 2).comboPts, 480);
    assert.equal(comboBonusPerLine(2), 480);
  });

  it("flattens extra combo bonus as the streak grows", () => {
    const d23 = comboBonusPerLine(3) - comboBonusPerLine(2);
    const d34 = comboBonusPerLine(4) - comboBonusPerLine(3);
    const d45 = comboBonusPerLine(5) - comboBonusPerLine(4);
    assert.ok(d23 < 480);
    assert.ok(d34 < d23);
    assert.ok(d45 < d34);
    assert.equal(scoreClear(2, 4).comboPts, comboBonusPerLine(4) * 2);
  });

  it("grows combo bonus slowly at high streaks", () => {
    const mid = comboBonusPerLine(20);
    const high = comboBonusPerLine(40);
    assert.ok(high > mid);
    assert.ok(high < mid * 1.7);
  });
});

describe("tickCombo", () => {
  it("adds one combo on any line clear", () => {
    assert.deepEqual(tickCombo(4, 1, 2), { combo: 5, misses: 0 });
  });

  it("keeps combo after one or two misses", () => {
    assert.deepEqual(tickCombo(4, 0, 0), { combo: 4, misses: 1 });
    assert.deepEqual(tickCombo(4, 0, 1), { combo: 4, misses: 2 });
  });

  it("resets combo after three consecutive misses", () => {
    assert.deepEqual(tickCombo(4, 0, 2), { combo: 0, misses: 0 });
  });
});

describe("bucketMix", () => {
  it("uses 35/40/25 at mid occupancy", () => {
    const m = bucketMix(0.25);
    assert.equal(m.s, 0.35);
    assert.equal(m.m, 0.4);
    assert.equal(m.l, 0.25);
  });

  it("boosts 3x3 and 5-cell pieces on an empty board", () => {
    const m = bucketMix(0);
    assert.ok(m.l >= 0.55, `expected large mix >= 0.55, got ${m.l}`);
  });

  it("raises 4-cell-or-smaller as the board fills, capped at 85%", () => {
    const mid = bucketMix(0.25);
    const packed = bucketMix(0.85);
    assert.ok(packed.s + packed.m > mid.s + mid.m);
    assert.ok(packed.s + packed.m <= 0.85 + 1e-9);
    assert.ok(packed.s + packed.m >= 0.84);
  });
});

describe("dealAssistRates", () => {
  it("matches the opening assist rates at score 0", () => {
    const early = dealAssistRates({ combo: 0, occupancy: 0.25, score: 0, misses: 0 });
    assert.equal(early.pClear, 0.3);
    assert.equal(early.pMega, 0.1);
    assert.equal(early.pChain, 0.25);
    assert.equal(early.awkward, 1.12);
    assert.equal(dealProgress(0), 0);
    assert.equal(dealProgress(3500), 0);
  });

  it("trims clear-assist a little on a long comfortable run", () => {
    const early = dealAssistRates({ combo: 2, occupancy: 0.3, score: 0, misses: 0 });
    const late = dealAssistRates({ combo: 2, occupancy: 0.3, score: 28000, misses: 0 });
    assert.ok(late.pClear < early.pClear);
    assert.ok(late.pMega < early.pMega);
    assert.ok(late.pClear > early.pClear * 0.7);
    assert.ok(late.awkward > early.awkward);
    assert.ok(late.awkward <= 1.26 + 1e-9);
  });

  it("barely squeezes when the board is packed or the player just missed", () => {
    const press = dealAssistRates({ combo: 2, occupancy: 0.62, score: 28000, misses: 2 });
    const comfy = dealAssistRates({ combo: 2, occupancy: 0.3, score: 28000, misses: 0 });
    assert.ok(press.pClear > comfy.pClear);
  });

  it("raises difficulty a little once combo reaches 8", () => {
    const base = dealAssistRates({ combo: 7, occupancy: 0.3, score: 12000, misses: 0 });
    const hot = dealAssistRates({ combo: 8, occupancy: 0.3, score: 12000, misses: 0 });
    assert.ok(hot.pClear < base.pClear);
    assert.ok(hot.pMega < base.pMega);
    assert.ok(hot.awkward > base.awkward);
    assert.ok(hot.pClear > base.pClear * 0.8);
  });
});

describe("rescue", () => {
  it("picks a random fitting piece of at most 3 cells", () => {
    const board = emptyBoard();
    fillRow(board, 0, []);
    fillRow(board, 1, []);
    fillRow(board, 2, []);
    fillRow(board, 3, []);
    fillRow(board, 4, []);
    fillRow(board, 5, [0, 1]);
    const shape = pickRescueShape(board);
    assert.ok(shape);
    assert.ok(shape!.cells.length <= 3);
    assert.equal(RESCUE_CHANCE, 0.5);
  });
});
