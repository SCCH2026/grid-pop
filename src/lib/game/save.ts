import type { ColorId, Piece, RunState, Settings } from "./types";
import { detectLang } from "./i18n";
import { emptyBoard } from "./engine";
import { SHAPES } from "./shapes";

const KEY = "gridpop.v1";
const SAVE_VERSION = 1;

function clamp01(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}

export interface SaveBlob {
  version: number;
  settings: Settings;
  highScore: number;
  run: RunState | null;
  inPlay?: boolean;
}

function defaultSettings(): Settings {
  return { lang: detectLang(), sound: true, music: 0.5, sfxVol: 0.75, shake: true };
}

export function defaultSave(): SaveBlob {
  return {
    version: SAVE_VERSION,
    settings: defaultSettings(),
    highScore: 0,
    run: null,
  };
}

function migrate(raw: SaveBlob): SaveBlob {
  const base = defaultSave();
  const settings = { ...base.settings, ...(raw.settings ?? {}) };
  if (settings.lang !== "zh-HK" && settings.lang !== "zh-CN" && settings.lang !== "en") {
    settings.lang = base.settings.lang;
  }
  settings.music = clamp01(settings.music ?? 0.5);
  settings.sfxVol = clamp01(settings.sfxVol ?? 0.75);
  settings.sound = settings.sound !== false;
  return {
    version: SAVE_VERSION,
    settings,
    highScore: Math.max(0, Math.floor(Number(raw.highScore) || 0)),
    run: parseRun(raw.run),
    inPlay: Boolean(raw.inPlay) && Boolean(parseRun(raw.run)),
  };
}

function parseRun(run: SaveBlob["run"]): RunState | null {
  if (!run || typeof run !== "object") return null;
  try {
    const board = emptyBoard();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const v = Number(run.board?.[r]?.[c] ?? 0);
        board[r]![c] = (v >= 1 && v <= 8 ? v : 0) as ColorId | 0;
      }
    }
    const pieces = [0, 1, 2].map((i) => revivePiece(run.pieces?.[i] ?? null));
    return {
      board,
      pieces,
      score: Math.max(0, Math.floor(Number(run.score) || 0)),
      combo: Math.max(0, Math.floor(Number(run.combo) || 0)),
      comboMisses: Math.max(0, Math.floor(Number(run.comboMisses) || 0)),
      continueCount: Math.max(
        0,
        Math.min(
          3,
          Math.floor(
            Number(
              (run as RunState).continueCount ??
                ((run as { continueUsed?: boolean }).continueUsed ? 1 : 0),
            ) || 0,
          ),
        ),
      ),
    };
  } catch {
    return null;
  }
}

function revivePiece(p: Piece | null): Piece | null {
  if (!p || typeof p !== "object") return null;
  const shape = SHAPES.find((s) => s.key === p.shape?.key);
  if (!shape) return null;
  const color = (Number(p.color) >= 1 && Number(p.color) <= 8 ? Number(p.color) : 1) as ColorId;
  return { id: Number(p.id) || Date.now(), shape, color };
}

export function loadSave(): SaveBlob {
  if (typeof localStorage === "undefined") return defaultSave();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveBlob;
    return migrate(parsed);
  } catch {
    return defaultSave();
  }
}

export function writeSave(blob: SaveBlob): void {
  if (typeof localStorage === "undefined") return;
  try {
    const payload: SaveBlob = { ...blob, version: SAVE_VERSION };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota */
  }
}
