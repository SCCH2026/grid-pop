import { useEffect, useRef } from "react";
import type { ClearEvent, ColorId } from "@/lib/game/types";
import { burstLabel, praiseForCombo, t } from "@/lib/game/i18n";
import type { Lang } from "@/lib/game/types";

import { SuperCrown } from "./icons";

const COLOR_HEX: Record<ColorId, string> = {
  1: "#FF4B7A",
  2: "#FF9F1C",
  3: "#FFD23F",
  4: "#2EC4B6",
  5: "#2EA3FF",
  6: "#7B5CFF",
  7: "#FF6B9D",
  8: "#3DDC97",
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
}

export function BurstCanvas({
  event,
  cellToPx,
}: {
  event: ClearEvent | null;
  cellToPx: (r: number, c: number) => { x: number; y: number; size: number } | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<Particle[]>([]);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (!event || event.lines === 0) return;
    const spawned: Particle[] = [];
    const extra = event.mega ? 10 : event.lines >= 2 ? 6 : 4;
    for (const cell of event.cells) {
      const pos = cellToPx(cell.r, cell.c);
      if (!pos) continue;
      const n = extra;
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 220;
        spawned.push({
          x: pos.x,
          y: pos.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 40,
          life: 1,
          max: 0.45 + Math.random() * 0.35,
          size: 4 + Math.random() * 7,
          color: COLOR_HEX[cell.color],
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 12,
        });
      }
    }
    parts.current.push(...spawned);
  }, [event, cellToPx]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;
    const fit = () => {
      const w = parent?.clientWidth ?? 300;
      const h = parent?.clientHeight ?? 300;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const onResize = () => fit();
    window.addEventListener("resize", onResize);

    const tick = (t: number) => {
      const dt = Math.min(0.05, last.current ? (t - last.current) / 1000 : 0.016);
      last.current = t;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const next: Particle[] = [];
      for (const p of parts.current) {
        p.life -= dt / p.max;
        if (p.life <= 0) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 420 * dt;
        p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        next.push(p);
      }
      parts.current = next;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="gp-burst-canvas" />;
}

export function ComboBanner({ event, lang }: { event: ClearEvent | null; lang: Lang }) {
  if (!event || (event.lines === 0 && event.combo < 2)) return null;
  const praise = praiseForCombo(lang, event.combo);
  const burst = burstLabel(lang, event.lines, event.perfect);
  return (
    <div key={event.id} className={`gp-combo ${event.mega ? "is-mega" : ""} ${event.perfect ? "is-perfect" : ""}`}>
      {burst ? <div className="gp-combo-burst">{burst}</div> : null}
      {event.combo >= 2 ? (
        <div className="gp-combo-x">
          {t(lang, "combo")} x{event.combo}
        </div>
      ) : null}
      {praise ? <div className="gp-combo-praise">{praise}</div> : null}
      {event.totalPts > 0 ? <div className="gp-combo-pts">+{event.totalPts}</div> : null}
    </div>
  );
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export function Fireworks({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fit = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const colors = Object.values(COLOR_HEX);
    const sparks: Spark[] = [];
    let last = 0;
    let acc = 0;
    let raf = 0;
    let running = true;

    const boom = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      const n = 42 + Math.floor(Math.random() * 18);
      for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        const spd = 80 + Math.random() * 260;
        sparks.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        });
      }
    };

    const tick = (t: number) => {
      if (!running) return;
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      acc += dt;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (acc > 0.28) {
        acc = 0;
        boom(40 + Math.random() * (w - 80), 50 + Math.random() * (h * 0.45));
      }
      ctx.clearRect(0, 0, w, h);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!;
        p.life -= dt * 0.85;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 90 * dt;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    boom(window.innerWidth * 0.5, window.innerHeight * 0.28);
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", fit);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={ref} className="gp-fireworks" />;
}

export function HighScorePopup({
  open,
  score,
  lang,
  onClose,
}: {
  open: boolean;
  score: number;
  lang: Lang;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="gp-best-pop" role="dialog" aria-modal="true">
      <Fireworks active />
      <button type="button" className="gp-best-card" onClick={onClose}>
        <SuperCrown className="gp-best-crown" />
        <p className="gp-best-kicker">{t(lang, "newBest")}</p>
        <p className="gp-score gp-score-xl tabular-nums">{score.toLocaleString()}</p>
        <p className="gp-best-hint">{t(lang, "tapSkip")}</p>
      </button>
    </div>
  );
}
