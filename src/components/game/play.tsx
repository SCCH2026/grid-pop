import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as PtrEvent } from "react";

import { Home, Pause, Settings } from "lucide-react";
import { BOARD_SIZE, MAX_CONTINUES, type Piece } from "@/lib/game/types";
import { canPlace } from "@/lib/game/engine";
import { t } from "@/lib/game/i18n";
import { useGridPop } from "@/lib/game/store";
import { sfx, unlockAudio } from "@/lib/game/audio";
import { AdBanner, InterstitialAd } from "./ads";
import { BurstCanvas, ComboBanner, HighScorePopup } from "./fx";
import { SuperCrown } from "./icons";

const BOARD_GAP = 3;
const TRAY_SCALE = 0.8;
const TRAY_GAP = 1;
const TRAY_PAD = 8;
const HIT = 64;

interface DragState {
  index: number;
  x: number;
  y: number;
  lift: number;
  hover: { r: number; c: number } | null;
  valid: boolean;
}

export function Play() {
  const lang = useGridPop((s) => s.settings.lang);
  const shakeOn = useGridPop((s) => s.settings.shake);
  const board = useGridPop((s) => s.board);
  const pieces = useGridPop((s) => s.pieces);
  const score = useGridPop((s) => s.score);
  const highScore = useGridPop((s) => s.highScore);
  const combo = useGridPop((s) => s.combo);
  const clearing = useGridPop((s) => s.clearing);
  const lastClear = useGridPop((s) => s.lastClear);
  const gameOver = useGridPop((s) => s.gameOver);
  const isNewBest = useGridPop((s) => s.isNewBest);
  const paused = useGridPop((s) => s.paused);
  const continueCount = useGridPop((s) => s.continueCount);
  const showInterstitial = useGridPop((s) => s.showInterstitial);
  const restored = useGridPop((s) => s.restored);
  const placePiece = useGridPop((s) => s.placePiece);
  const finishClear = useGridPop((s) => s.finishClear);
  const setPaused = useGridPop((s) => s.setPaused);
  const startGame = useGridPop((s) => s.startGame);
  const openSettings = useGridPop((s) => s.openSettings);
  const requestContinue = useGridPop((s) => s.requestContinue);
  const requestExitAd = useGridPop((s) => s.requestExitAd);
  const finishInterstitial = useGridPop((s) => s.finishInterstitial);
  const acknowledgeBest = useGridPop((s) => s.acknowledgeBest);

  const boardRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(36);
  const [boardSide, setBoardSide] = useState(280);
  const [trayCell, setTrayCell] = useState(28);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [scorePop, setScorePop] = useState(0);
  const [showRestored, setShowRestored] = useState(restored);
  const [hudMenu, setHudMenu] = useState(false);
  const prevScore = useRef(score);
  const shownBest = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const dragLayerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef(pieces);
  const boardLive = useRef(board);
  const cellRef = useRef(cell);
  piecesRef.current = pieces;
  boardLive.current = board;
  cellRef.current = cell;

  useEffect(() => {
    if (!restored) return;
    setShowRestored(true);
    const tmr = window.setTimeout(() => setShowRestored(false), 2200);
    return () => window.clearTimeout(tmr);
  }, [restored]);

  useLayoutEffect(() => {
    const root = playRef.current;
    const slot = slotRef.current;
    const tray = trayRef.current;
    if (!root || !slot) return;

    const run = () => {
      const sw = slot.clientWidth;
      const sh = slot.clientHeight;
      if (sw < 32 || sh < 32) return;
      const side = Math.max(96, Math.floor(Math.min(sw, sh)));
      setBoardSide((prev) => (Math.abs(prev - side) < 1 ? prev : side));
      const boardCell = (side - 10 - BOARD_GAP * (BOARD_SIZE - 1)) / BOARD_SIZE;
      setCell((prev) => {
        const next = Math.max(8, boardCell);
        return Math.abs(prev - next) < 0.2 ? prev : next;
      });

      const trayH = tray?.clientHeight || 72;
      const trayW = tray?.clientWidth || sw;
      const slotW = Math.max(40, trayW / 3);
      let maxH = 1;
      let maxW = 1;
      for (const p of pieces) {
        if (!p) continue;
        if (p.shape.h > maxH) maxH = p.shape.h;
        if (p.shape.w > maxW) maxW = p.shape.w;
      }
      const preferred = boardCell * TRAY_SCALE;
      const fitH = (trayH - TRAY_PAD * 2 - (maxH - 1) * TRAY_GAP) / maxH;
      const fitW = (slotW - 12 - (maxW - 1) * TRAY_GAP) / maxW;
      const nextTray = Math.max(8, Math.min(preferred, fitH, fitW));
      setTrayCell((prev) => (Math.abs(prev - nextTray) < 0.2 ? prev : nextTray));
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(root);
    ro.observe(slot);
    if (tray) ro.observe(tray);
    const ad = root.querySelector(".gp-play-ad");
    if (ad) ro.observe(ad);
    window.addEventListener("resize", run);
    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", run);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", run);
      mq.removeEventListener("change", run);
    };
  }, [pieces]);

  useEffect(() => {
    if (!clearing || !lastClear) return;
    if (lastClear.lines > 0) {
      sfx.clear(lastClear.lines);
      if (lastClear.mega || lastClear.perfect) sfx.cheerMega();
      else sfx.cheerClear();
      if (lastClear.combo >= 4) sfx.cheerChain(lastClear.combo);
      else if (lastClear.combo >= 2) sfx.cheerCombo(lastClear.combo);
      if (shakeOn) {
        navigator.vibrate?.(lastClear.mega ? [18, 40, 24] : 12);
      }
    }
    const wait = lastClear.mega || lastClear.perfect ? 720 : 420;
    const tmr = window.setTimeout(() => finishClear(), wait);
    return () => window.clearTimeout(tmr);
  }, [clearing, lastClear, finishClear, shakeOn]);

  useEffect(() => {
    if (score !== prevScore.current) {
      setScorePop((n) => n + 1);
      prevScore.current = score;
    }
  }, [score]);

  useEffect(() => {
    if (isNewBest && !shownBest.current) {
      shownBest.current = true;
      sfx.best();
    }
    if (!gameOver) shownBest.current = false;
  }, [isNewBest, gameOver]);

  const cellToPx = useCallback(
    (r: number, c: number) => {
      const el = boardRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const size = cell;
      return {
        x: 5 + c * (size + BOARD_GAP) + size / 2,
        y: 5 + r * (size + BOARD_GAP) + size / 2,
        size,
        originX: rect.left,
        originY: rect.top,
      };
    },
    [cell],
  );

  const hoverFromPoint = useCallback((piece: Piece, clientX: number, clientY: number, lift: number) => {
    const el = boardRef.current;
    const size = cellRef.current;
    if (!el) return { hover: null as { r: number; c: number } | null, valid: false };
    const rect = el.getBoundingClientRect();
    const step = size + BOARD_GAP;
    const pw = piece.shape.w * size + (piece.shape.w - 1) * BOARD_GAP;
    const ph = piece.shape.h * size + (piece.shape.h - 1) * BOARD_GAP;
    const originX = clientX - pw / 2;
    const originY = clientY - ph - lift;
    const col = Math.round((originX - (rect.left + 5)) / step);
    const row = Math.round((originY - (rect.top + 5)) / step);
    if (row < -2 || col < -2 || row > BOARD_SIZE + 1 || col > BOARD_SIZE + 1) {
      return { hover: null, valid: false };
    }
    return { hover: { r: row, c: col }, valid: canPlace(boardLive.current, piece.shape, row, col) };
  }, []);

  const paintDrag = (x: number, y: number, lift: number, w: number, h: number) => {
    const el = dragLayerRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x - w / 2}px, ${y - h - lift}px, 0)`;
  };

  useLayoutEffect(() => {
    const d = dragRef.current;
    if (!d) return;
    const p = piecesRef.current[d.index];
    if (!p) return;
    const size = cellRef.current;
    const w = p.shape.w * size + (p.shape.w - 1) * BOARD_GAP;
    const h = p.shape.h * size + (p.shape.h - 1) * BOARD_GAP;
    paintDrag(d.x, d.y, d.lift, w, h);
  }, [drag]);

  useEffect(() => {
    if (!hudMenu) return;
    const close = (ev: PointerEvent) => {
      if (!menuRef.current?.contains(ev.target as Node)) setHudMenu(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [hudMenu]);

  const onPointerDown = (index: number, e: PtrEvent<HTMLButtonElement>) => {
    if (clearing || gameOver || paused) return;
    const piece = piecesRef.current[index];
    if (!piece) return;
    e.preventDefault();
    e.stopPropagation();
    unlockAudio();
    setHudMenu(false);
    const pointerId = e.pointerId;
    const size = cellRef.current;
    const lift = Math.max(40, size * 0.95);
    const w = piece.shape.w * size + (piece.shape.w - 1) * BOARD_GAP;
    const h = piece.shape.h * size + (piece.shape.h - 1) * BOARD_GAP;
    let moved = false;
    let raf = 0;
    let px = e.clientX;
    let py = e.clientY;
    const first = hoverFromPoint(piece, px, py, lift);
    const initial: DragState = { index, x: px, y: py, lift, ...first };
    dragRef.current = initial;
    setDrag(initial);
    let lastR = first.hover?.r ?? null;
    let lastC = first.hover?.c ?? null;
    let lastValid = first.valid;

    const flush = () => {
      raf = 0;
      const p = piecesRef.current[index];
      if (!p) return;
      const nextHover = hoverFromPoint(p, px, py, lift);
      const next: DragState = { index, x: px, y: py, lift, ...nextHover };
      dragRef.current = next;
      paintDrag(px, py, lift, w, h);
      const nr = nextHover.hover?.r ?? null;
      const nc = nextHover.hover?.c ?? null;
      if (nr !== lastR || nc !== lastC || nextHover.valid !== lastValid) {
        lastR = nr;
        lastC = nc;
        lastValid = nextHover.valid;
        setDrag(next);
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const coalesced = ev.getCoalescedEvents?.();
      const last = coalesced && coalesced.length ? coalesced[coalesced.length - 1]! : ev;
      px = last.clientX;
      py = last.clientY;
      if (Math.abs(px - initial.x) + Math.abs(py - initial.y) > 2) moved = true;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const finish = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", finish, true);
      window.removeEventListener("pointercancel", finish, true);
      flush();
      const d = dragRef.current;
      const p = piecesRef.current[index];
      dragRef.current = null;
      setDrag(null);
      if (p && d?.hover && d.valid) {
        const ok = placePiece(index, d.hover.r, d.hover.c);
        if (ok) sfx.place();
        else sfx.fail();
      } else if (moved) {
        sfx.fail();
      }
    };
    window.addEventListener("pointermove", onMove, { capture: true, passive: false });
    window.addEventListener("pointerup", finish, { capture: true });
    window.addEventListener("pointercancel", finish, { capture: true });
  };

  const clearingSet = new Set(
    lastClear && clearing ? lastClear.cells.map((c) => `${c.r}:${c.c}`) : [],
  );

  const dragPiece = drag ? pieces[drag.index] : null;
  const dragW = dragPiece ? dragPiece.shape.w * cell + (dragPiece.shape.w - 1) * BOARD_GAP : 0;
  const dragH = dragPiece ? dragPiece.shape.h * cell + (dragPiece.shape.h - 1) * BOARD_GAP : 0;

  return (
    <div className="gp-play" ref={playRef}>
      <header className="gp-hud">
        <div className="gp-hud-best">
          <SuperCrown className="gp-crown-hud" />
          <span className="tabular-nums">{highScore.toLocaleString()}</span>
        </div>
        <div className="gp-hud-actions">
          <button
            type="button"
            className="gp-icon-btn"
            aria-label={t(lang, "pause")}
            onClick={() => {
              sfx.tap();
              setPaused(true);
            }}
          >
            <Pause />
          </button>
          <div className="gp-hud-gear" ref={menuRef}>
            <button
              type="button"
              className="gp-icon-btn"
              aria-label={t(lang, "settings")}
              aria-expanded={hudMenu}
              onClick={() => {
                sfx.tap();
                setHudMenu((v) => !v);
              }}
            >
              <Settings />
            </button>
            {hudMenu ? (
              <div className="gp-hud-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    sfx.tap();
                    setHudMenu(false);
                    openSettings();
                  }}
                >
                  {t(lang, "settings")}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    sfx.tap();
                    setHudMenu(false);
                    startGame(true);
                  }}
                >
                  {t(lang, "newGame")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="gp-score-slot">
        <div key={scorePop} className="gp-score-hero tabular-nums">
          {score.toLocaleString()}
        </div>
        <div className={`gp-combo-live ${combo >= 2 ? "is-on" : ""}`} aria-live="polite">
          {combo >= 2 ? (
            <span key={combo} className="gp-combo-live-pop">
              <span className="gp-combo-live-x">×{combo}</span>
              <span>{t(lang, "combo")}</span>
            </span>
          ) : null}
        </div>
      </div>

      {showRestored ? <p className="gp-restore">{t(lang, "saved")}</p> : null}

      <div className="gp-board-slot" ref={slotRef}>
        <div className="gp-board-wrap" style={{ width: boardSide, height: boardSide }}>
          <div
            ref={boardRef}
            className="gp-board"
            style={{ gap: BOARD_GAP, padding: 5 }}
          >
          {board.map((row, r) =>
            row.map((val, c) => {
              const key = `${r}:${c}`;
              const ghost =
                drag &&
                drag.hover &&
                dragPiece &&
                dragPiece.shape.cells.some(([dr, dc]) => drag.hover!.r + dr === r && drag.hover!.c + dc === c);
              return (
                <div
                  key={key}
                  className={`gp-cell ${val ? `is-fill c${val}` : "is-empty"} ${
                    clearingSet.has(key) ? "is-clearing" : ""
                  } ${ghost ? (drag?.valid ? "is-ghost" : "is-ghost-bad") : ""}`}

                />
              );
            }),
          )}
        </div>
          <BurstCanvas event={clearing ? lastClear : null} cellToPx={cellToPx} />
          <ComboBanner event={clearing ? lastClear : null} lang={lang} />
        </div>
      </div>

      <div className="gp-tray" ref={trayRef}>
        {pieces.map((piece, i) => (
          <div key={piece ? piece.id : `empty-${i}`} className="gp-tray-slot">
            {piece ? (
              <button
                type="button"
                className={`gp-tray-piece ${drag?.index === i ? "is-dragging" : ""}`}
                style={{
                  width: Math.max(HIT, piece.shape.w * trayCell + (piece.shape.w - 1) * TRAY_GAP + 20),
                  height: Math.max(HIT, piece.shape.h * trayCell + (piece.shape.h - 1) * TRAY_GAP + 20),
                }}
                onPointerDown={(e) => onPointerDown(i, e)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span
                  className="gp-tray-shape"
                  style={{
                    width: piece.shape.w * trayCell + (piece.shape.w - 1) * TRAY_GAP,
                    height: piece.shape.h * trayCell + (piece.shape.h - 1) * TRAY_GAP,
                    gap: TRAY_GAP,
                    gridTemplateColumns: `repeat(${piece.shape.w}, ${trayCell}px)`,
                    gridTemplateRows: `repeat(${piece.shape.h}, ${trayCell}px)`,
                  }}
                >
                  {piece.shape.cells.map(([r, c]) => (
                    <span
                      key={`${r}-${c}`}
                      className={`gp-cell is-fill c${piece.color}`}
                      style={{
                        gridColumn: c + 1,
                        gridRow: r + 1,
                        width: trayCell,
                        height: trayCell,
                      }}
                    />
                  ))}
                </span>
              </button>
            ) : (
              <span className="gp-tray-empty" />
            )}
          </div>
        ))}
      </div>

      {drag && dragPiece ? (
        <div
          ref={dragLayerRef}
          className={`gp-drag-layer ${drag.valid ? "is-ok" : "is-bad"}`}
          style={{
            width: dragW,
            height: dragH,
            gap: BOARD_GAP,
            gridTemplateColumns: `repeat(${dragPiece.shape.w}, ${cell}px)`,
            gridTemplateRows: `repeat(${dragPiece.shape.h}, ${cell}px)`,
          }}
        >
          {dragPiece.shape.cells.map(([r, c]) => (
            <span
              key={`${r}-${c}`}
              className={`gp-cell is-fill c${dragPiece.color}`}
              style={{ gridColumn: c + 1, gridRow: r + 1, width: cell, height: cell }}
            />
          ))}
        </div>
      ) : null}

      {paused ? (
        <div className="gp-modal">
          <div className="gp-modal-card">
            <h2>{t(lang, "pause")}</h2>
            <button type="button" className="gp-btn gp-btn-primary" onClick={() => setPaused(false)}>
              {t(lang, "resume")}
            </button>
            <button type="button" className="gp-btn gp-btn-ghost" onClick={() => requestExitAd("quit")}>
              {t(lang, "quit")}
            </button>
          </div>
        </div>
      ) : null}

      <HighScorePopup
        open={gameOver && isNewBest}
        score={score}
        lang={lang}
        onClose={acknowledgeBest}
      />

      {gameOver && !isNewBest ? (
        <div className="gp-modal">
          <div className="gp-modal-card">
            <h2>{t(lang, "gameOver")}</h2>
            <p className="gp-score gp-score-md tabular-nums">{score.toLocaleString()}</p>
            <div className="gp-hud-best gp-center">
              <SuperCrown className="gp-crown-hud" />
              <span className="tabular-nums">{highScore.toLocaleString()}</span>
            </div>
            {!continueCount || continueCount < MAX_CONTINUES ? (
              <button type="button" className="gp-btn gp-btn-ad" onClick={requestContinue}>
                {t(lang, "continueAd")}
              </button>
            ) : null}
            <button
              type="button"
              className="gp-btn gp-btn-primary"
              onClick={() => requestExitAd("replay")}
            >
              {t(lang, "playAgain")}
            </button>
            <button type="button" className="gp-btn gp-btn-ghost" onClick={() => requestExitAd("quit")}>
              <Home className="size-4" /> {t(lang, "quit")}
            </button>
          </div>
        </div>
      ) : null}

      <InterstitialAd lang={lang} open={showInterstitial} onDone={finishInterstitial} />
      <AdBanner lang={lang} className="gp-play-ad" format="horizontal" />
    </div>
  );
}
