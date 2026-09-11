export const BOARD_SIZE = 8;

export type ColorId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Cell = 0 | ColorId;

export type Board = Cell[][];

export type Coord = readonly [number, number];

export interface Shape {
  readonly key: string;
  readonly cells: readonly Coord[];
  readonly w: number;
  readonly h: number;
}

export interface Piece {
  id: number;
  shape: Shape;
  color: ColorId;
}

export interface ClearEvent {
  id: number;
  cells: { r: number; c: number; color: ColorId }[];
  rows: number[];
  cols: number[];
  lines: number;
  combo: number;
  placePts: number;
  linePts: number;
  comboPts: number;
  perfectPts: number;
  totalPts: number;
  perfect: boolean;
  mega: boolean;
}

export type Lang = "zh-HK" | "zh-CN" | "en";

export type Screen =
  | "splash"
  | "menu"
  | "settings"
  | "howto"
  | "play"
  | "privacy"
  | "terms"
  | "contact";

export interface Settings {
  lang: Lang;
  sound: boolean;
  music: number;
  sfxVol: number;
  shake: boolean;
}

export interface RunState {
  board: Board;
  pieces: (Piece | null)[];
  score: number;
  combo: number;
  comboMisses: number;
  continueCount: number;
}

export const MAX_CONTINUES = 3;
