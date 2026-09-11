import { create } from "zustand";
import type { Board, ClearEvent, Piece, Screen, Settings } from "./types";
import {
  anyPieceFits,
  boardAfterClear,
  dealFittingPieces,
  dealPieces,
  emptyBoard,
  resolvePlace,
  tickCombo,
} from "./engine";
import { defaultSave, loadSave, writeSave } from "./save";
import { setMusicVolume, setMuted, setSfxVolume, sfx, unlockAudio } from "./audio";
import { MAX_CONTINUES } from "./types";

interface GameStore {
  hydrated: boolean;
  screen: Screen;
  settings: Settings;
  highScore: number;
  bestAtRunStart: number;
  board: Board;
  pieces: (Piece | null)[];
  score: number;
  combo: number;
  comboMisses: number;
  continueCount: number;
  gameOver: boolean;
  isNewBest: boolean;
  paused: boolean;
  clearing: boolean;
  lastClear: ClearEvent | null;
  pendingBoard: Board | null;
  showInterstitial: boolean;
  interstitialReason: "continue" | "replay" | "quit" | null;
  restored: boolean;
  settingsFrom: "menu" | "play";

  hydrate: () => void;
  persist: () => void;
  setScreen: (screen: Screen) => void;
  openSettings: () => void;
  closeSettings: () => void;
  setLang: (lang: Settings["lang"]) => void;
  toggleSound: () => void;
  setMusic: (v: number) => void;
  setSfxVol: (v: number) => void;
  toggleShake: () => void;
  startGame: (forceNew?: boolean) => void;
  placePiece: (index: number, row: number, col: number) => boolean;
  finishClear: () => void;
  setPaused: (paused: boolean) => void;
  requestContinue: () => void;
  requestExitAd: (kind: "replay" | "quit") => void;
  finishInterstitial: () => void;
  acknowledgeBest: () => void;
  quitToMenu: () => void;
}

function persistState(s: GameStore) {
  const hasRun =
    !s.gameOver &&
    (s.pieces.some(Boolean) ||
      s.score > 0 ||
      s.board.some((row) => row.some(Boolean)));
  writeSave({
    version: 1,
    settings: s.settings,
    highScore: s.highScore,
    inPlay:
      hasRun &&
      (s.screen === "play" ||
        (s.settingsFrom === "play" && (s.screen === "settings" || s.screen === "howto"))),
    run: hasRun
      ? {
          board: s.pendingBoard ?? s.board,
          pieces: s.pieces,
          score: s.score,
          combo: s.combo,
          comboMisses: s.comboMisses,
          continueCount: s.continueCount,
        }
      : null,
  });
}

export const useGridPop = create<GameStore>((set, get) => ({
  hydrated: false,
  screen: "menu",
  settings: defaultSave().settings,
  highScore: 0,
  bestAtRunStart: 0,
  board: emptyBoard(),
  pieces: [null, null, null],
  score: 0,
  combo: 0,
  comboMisses: 0,
  continueCount: 0,
  gameOver: false,
  isNewBest: false,
  paused: false,
  clearing: false,
  lastClear: null,
  pendingBoard: null,
  showInterstitial: false,
  interstitialReason: null,
  restored: false,
  settingsFrom: "menu",

  hydrate: () => {
    if (get().hydrated) return;
    const blob = loadSave();
    setMuted(!blob.settings.sound);
    setMusicVolume(blob.settings.music);
    setSfxVolume(blob.settings.sfxVol);
    const run = blob.run;
    const resume =
      Boolean(blob.inPlay) &&
      Boolean(run) &&
      anyPieceFits(run!.board, run!.pieces);
    set({
      hydrated: true,
      settings: blob.settings,
      highScore: blob.highScore,
      bestAtRunStart: blob.highScore,
      ...(resume && run
        ? {
            screen: "play" as const,
            board: run.board,
            pieces: run.pieces,
            score: run.score,
            combo: run.combo,
            comboMisses: run.comboMisses,
            continueCount: run.continueCount,
            gameOver: false,
            paused: false,
            restored: true,
          }
        : {}),
    });
  },

  persist: () => persistState(get()),

  setScreen: (screen) => {
    set({ screen, paused: false });
    persistState(get());
  },

  openSettings: () => {
    const s = get();
    if (s.clearing) get().finishClear();
    const from = s.screen === "play" ? "play" : "menu";
    set({
      screen: "settings",
      settingsFrom: from,
      paused: from === "play",
    });
  },

  closeSettings: () => {
    const to = get().settingsFrom === "play" ? "play" : "menu";
    set({ screen: to, paused: false });
  },

  setLang: (lang) => {
    set({ settings: { ...get().settings, lang } });
    persistState(get());
  },

  toggleSound: () => {
    const sound = !get().settings.sound;
    setMuted(!sound);
    set({ settings: { ...get().settings, sound } });
    if (sound) {
      unlockAudio();
      sfx.tap();
    }
    persistState(get());
  },

  setMusic: (v) => {
    const music = Math.max(0, Math.min(1, v));
    setMusicVolume(music);
    set({ settings: { ...get().settings, music } });
    persistState(get());
  },

  setSfxVol: (v) => {
    const sfxVol = Math.max(0, Math.min(1, v));
    setSfxVolume(sfxVol);
    set({ settings: { ...get().settings, sfxVol } });
    persistState(get());
  },

  toggleShake: () => {
    set({ settings: { ...get().settings, shake: !get().settings.shake } });
    persistState(get());
  },

  startGame: (forceNew = false) => {
    unlockAudio();
    const blob = loadSave();
    if (!forceNew && blob.run && anyPieceFits(blob.run.board, blob.run.pieces)) {
      set({
        screen: "play",
        board: blob.run.board,
        pieces: blob.run.pieces,
        score: blob.run.score,
        combo: blob.run.combo,
        comboMisses: blob.run.comboMisses ?? 0,
        continueCount: blob.run.continueCount,
        highScore: blob.highScore,
        bestAtRunStart: blob.highScore,
        gameOver: false,
        isNewBest: false,
        paused: false,
        clearing: false,
        lastClear: null,
        pendingBoard: null,
        restored: true,
      });
      persistState(get());
      return;
    }
    const board = emptyBoard();
    set({
      screen: "play",
      board,
      pieces: dealPieces(board),
      score: 0,
      combo: 0,
      comboMisses: 0,
      continueCount: 0,
      highScore: blob.highScore,
      bestAtRunStart: blob.highScore,
      gameOver: false,
      isNewBest: false,
      paused: false,
      clearing: false,
      lastClear: null,
      pendingBoard: null,
      restored: false,
    });
    persistState(get());
  },

  placePiece: (index, row, col) => {
    const s = get();
    if (s.clearing || s.gameOver || s.paused) return false;
    const piece = s.pieces[index];
    if (!piece) return false;
    const result = resolvePlace(s.board, piece, row, col, s.combo);
    if (!result) return false;

    const nextPieces = s.pieces.slice() as (Piece | null)[];
    nextPieces[index] = null;
    const { boardPlaced, event } = result;
    const trayEmpty = nextPieces.every((p) => p === null);
    const comboTick = tickCombo(s.combo, event.lines, s.comboMisses);
    const nextScore = s.score + event.totalPts;
    const nextHigh = Math.max(s.highScore, nextScore);

    if (event.lines > 0) {
      set({
        board: boardPlaced,
        pieces: nextPieces,
        score: nextScore,
        combo: comboTick.combo,
        comboMisses: comboTick.misses,
        highScore: nextHigh,
        clearing: true,
        lastClear: { ...event, combo: comboTick.combo },
        pendingBoard: boardAfterClear(boardPlaced, event),
      });
    } else {
      const refill = trayEmpty ? dealFittingPieces(boardPlaced, { combo: comboTick.combo, score: nextScore, misses: comboTick.misses }) : nextPieces;
      const over = !anyPieceFits(boardPlaced, refill);
      set({
        board: boardPlaced,
        pieces: refill,
        score: nextScore,
        combo: comboTick.combo,
        comboMisses: comboTick.misses,
        highScore: nextHigh,
        lastClear: event,
        gameOver: over,
        isNewBest: over && nextScore > s.bestAtRunStart,
        pendingBoard: null,
      });
      persistState(get());
    }
    return true;
  },

  finishClear: () => {
    const s = get();
    if (!s.clearing || !s.pendingBoard) return;
    const board = s.pendingBoard;
    let pieces = s.pieces;
    if (pieces.every((p) => p === null)) pieces = dealFittingPieces(board, { combo: s.combo, score: s.score, misses: s.comboMisses });
    const over = !anyPieceFits(board, pieces);
    set({
      board,
      pieces,
      clearing: false,
      pendingBoard: null,
      gameOver: over,
      isNewBest: over && s.score > s.bestAtRunStart,
    });
    persistState(get());
  },

  setPaused: (paused) => set({ paused }),

  requestContinue: () => {
    const s = get();
    if (s.continueCount >= MAX_CONTINUES) return;
    unlockAudio();
    set({ showInterstitial: true, interstitialReason: "continue", paused: false });
  },

  requestExitAd: (kind) => {
    unlockAudio();
    set({ showInterstitial: true, interstitialReason: kind, paused: false });
  },

  finishInterstitial: () => {
    const s = get();
    const reason = s.interstitialReason;
    set({ showInterstitial: false, interstitialReason: null });
    if (reason === "continue") {
      set({
        gameOver: false,
        isNewBest: false,
        pieces: dealFittingPieces(s.board, { combo: 0, score: s.score, misses: 0, forceFit: true }),
        continueCount: Math.min(MAX_CONTINUES, s.continueCount + 1),
        combo: 0,
        comboMisses: 0,
        lastClear: null,
      });
      persistState(get());
      return;
    }
    if (reason === "replay") {
      get().startGame(true);
      return;
    }
    if (reason === "quit") {
      get().quitToMenu();
    }
  },

  acknowledgeBest: () => set({ isNewBest: false }),

  quitToMenu: () => {
    if (get().clearing) get().finishClear();
    set({ screen: "menu", paused: false, showInterstitial: false, interstitialReason: null });
    persistState(get());
  },
}));
