type Bus = { ctx: AudioContext; master: GainNode; sfx: GainNode; music: GainNode; air: BiquadFilterNode };

let bus: Bus | null = null;
let muted = false;
let sfxVol = 0.75;
let musicVol = 0.5;
let musicDuck = 1;

function getBus(): Bus | null {
  if (typeof window === "undefined") return null;
  if (bus) return bus;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC({ latencyHint: "interactive" });
  const master = ctx.createGain();
  const sfx = ctx.createGain();
  const music = ctx.createGain();
  const air = ctx.createBiquadFilter();
  air.type = "lowpass";
  air.frequency.value = 1750;
  air.Q.value = 0.45;
  applyGains(master, sfx, music, ctx.currentTime);
  sfx.connect(master);
  music.connect(air);
  air.connect(master);
  master.connect(ctx.destination);
  bus = { ctx, master, sfx, music, air };
  return bus;
}

function applyGains(master: GainNode, sfx: GainNode, music: GainNode, t: number) {
  master.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.03);
  sfx.gain.setTargetAtTime(Math.max(0, Math.min(1, sfxVol)) * 0.72, t, 0.03);
  music.gain.setTargetAtTime(Math.max(0, Math.min(1, musicVol)) * 0.4 * musicDuck, t, 0.05);
}

function refreshGains() {
  if (!bus) return;
  applyGains(bus.master, bus.sfx, bus.music, bus.ctx.currentTime);
}

export function setMuted(next: boolean) {
  muted = next;
  refreshGains();
  if (next) stopBgm();
  else startBgmIfNeeded();
}

export function setSfxVolume(next: number) {
  sfxVol = Math.max(0, Math.min(1, next));
  refreshGains();
}

export function setMusicVolume(next: number) {
  musicVol = Math.max(0, Math.min(1, next));
  refreshGains();
  if (musicVol <= 0.01 || muted) stopBgm();
  else startBgmIfNeeded();
}

export function setMusicDuck(next: number) {
  musicDuck = Math.max(0.15, Math.min(1, next));
  refreshGains();
}

export function unlockAudio() {
  const b = getBus();
  if (!b) return;
  if (b.ctx.state === "suspended") void b.ctx.resume();
  startBgmIfNeeded();
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.18,
  when = 0,
  slideTo?: number,
) {
  const b = getBus();
  if (!b || muted || sfxVol <= 0.01) return;
  const t0 = b.ctx.currentTime + when;
  const osc = b.ctx.createOscillator();
  const g = b.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(b.sfx);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

function noiseBurst(dur: number, gain = 0.04, when = 0, hp = 1800) {
  const b = getBus();
  if (!b || muted || sfxVol <= 0.01) return;
  const t0 = b.ctx.currentTime + when;
  const n = b.ctx.createBuffer(1, Math.floor(b.ctx.sampleRate * dur), b.ctx.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = b.ctx.createBufferSource();
  src.buffer = n;
  const f = b.ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = b.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(b.sfx);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
  src.onended = () => {
    src.disconnect();
    f.disconnect();
    g.disconnect();
  };
}

const VOWEL: Record<"a" | "e" | "i" | "o" | "u", [number, number]> = {
  a: [820, 1280],
  e: [430, 2150],
  i: [310, 2680],
  o: [520, 920],
  u: [360, 760],
};

function syllable(
  pitchFrom: number,
  pitchTo: number,
  dur: number,
  vowel: keyof typeof VOWEL,
  gain = 0.11,
  when = 0,
) {
  const b = getBus();
  if (!b || muted || sfxVol <= 0.01) return;
  const t0 = b.ctx.currentTime + when;
  const [f1, f2] = VOWEL[vowel];
  const src = b.ctx.createOscillator();
  src.type = "sawtooth";
  src.frequency.setValueAtTime(pitchFrom, t0);
  src.frequency.exponentialRampToValueAtTime(Math.max(70, pitchTo), t0 + dur);

  const bp1 = b.ctx.createBiquadFilter();
  bp1.type = "bandpass";
  bp1.frequency.setValueAtTime(f1, t0);
  bp1.Q.value = 7;
  const bp2 = b.ctx.createBiquadFilter();
  bp2.type = "bandpass";
  bp2.frequency.setValueAtTime(f2, t0);
  bp2.Q.value = 6;

  const g = b.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.025);
  g.gain.exponentialRampToValueAtTime(gain * 0.72, t0 + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  src.connect(bp1);
  src.connect(bp2);
  bp1.connect(g);
  bp2.connect(g);
  g.connect(b.sfx);
  src.start(t0);
  src.stop(t0 + dur + 0.04);
  src.onended = () => {
    src.disconnect();
    bp1.disconnect();
    bp2.disconnect();
    g.disconnect();
  };
}

function sparkle(start = 880, n = 3, when = 0) {
  for (let i = 0; i < n; i++) {
    tone(start + i * 180, 0.1, "sine", 0.07, when + i * 0.05);
  }
}

export const sfx = {
  tap() {
    tone(720, 0.06, "triangle", 0.1);
  },
  place() {
    const jitter = 1 + (Math.random() * 0.1 - 0.05);
    tone(420 * jitter, 0.07, "square", 0.09);
    tone(640 * jitter, 0.09, "triangle", 0.07, 0.02);
  },
  clear(lines: number) {
    const n = Math.min(5, Math.max(1, lines));
    for (let i = 0; i < n; i++) {
      tone(520 + i * 160, 0.12, "sine", 0.1, i * 0.04);
    }
  },
  cheerClear() {
    noiseBurst(0.05, 0.03, 0, 2200);
    syllable(430, 510, 0.11, "i", 0.1, 0);
    syllable(500, 620, 0.2, "e", 0.13, 0.09);
    sparkle(980, 2, 0.12);
  },
  cheerCombo(n: number) {
    const lift = Math.min(4, Math.max(0, n - 2)) * 18;
    syllable(340 + lift, 300 + lift, 0.1, "u", 0.1, 0);
    syllable(380 + lift, 540 + lift, 0.22, "a", 0.14, 0.08);
    sparkle(760, 3, 0.1);
  },
  cheerMega() {
    syllable(280, 340, 0.16, "u", 0.12, 0);
    syllable(420, 560, 0.26, "u", 0.15, 0.14);
    sparkle(880, 4, 0.16);
    tone(1320, 0.18, "triangle", 0.06, 0.28);
  },
  cheerChain(n: number) {
    const lift = Math.min(80, n * 12);
    syllable(480 + lift, 520 + lift, 0.08, "i", 0.1, 0);
    syllable(540 + lift, 420 + lift, 0.1, "i", 0.11, 0.08);
    syllable(500 + lift, 680 + lift, 0.22, "i", 0.14, 0.18);
    sparkle(1040, 5, 0.2);
    tone(1560, 0.16, "sine", 0.05, 0.34);
  },
  combo(n: number) {
    sfx.cheerCombo(n);
  },
  mega() {
    sfx.cheerMega();
  },
  fail() {
    tone(240, 0.22, "square", 0.1, 0, 110);
  },
  best() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => tone(f, 0.22, "triangle", 0.12, i * 0.09));
    syllable(400, 560, 0.18, "a", 0.1, 0.12);
    syllable(520, 700, 0.24, "i", 0.12, 0.28);
  },
  popSmall() {
    tone(980, 0.05, "sine", 0.07);
  },
};

export type BgmMode = "off" | "menu" | "play";

/** Original 48-bar pop-style song in C major. Verse, chorus, bridge, then offset on repeat. */
const SONG: { c: number[]; m: number[] }[] = [
  { c: [48, 52, 55, 60], m: [76, 0, 74, 76, 79, 76, 74, 0] },
  { c: [43, 47, 50, 55], m: [74, 72, 71, 72, 74, 0, 76, 74] },
  { c: [45, 48, 52, 57], m: [72, 69, 72, 74, 76, 74, 72, 69] },
  { c: [41, 45, 48, 53], m: [72, 74, 76, 0, 74, 72, 69, 67] },
  { c: [48, 52, 55, 60], m: [76, 79, 81, 79, 76, 74, 72, 0] },
  { c: [43, 47, 50, 55], m: [74, 76, 79, 76, 74, 71, 72, 74] },
  { c: [41, 45, 48, 53], m: [69, 72, 74, 76, 74, 72, 69, 65] },
  { c: [43, 47, 50, 55], m: [67, 71, 74, 76, 74, 71, 67, 0] },

  { c: [48, 52, 55, 64], m: [72, 76, 0, 79, 76, 74, 72, 0] },
  { c: [43, 47, 50, 59], m: [71, 74, 76, 74, 72, 71, 67, 0] },
  { c: [45, 48, 52, 60], m: [69, 72, 76, 79, 76, 72, 69, 67] },
  { c: [41, 45, 48, 53], m: [65, 69, 72, 74, 72, 69, 67, 65] },
  { c: [48, 52, 55, 60], m: [64, 67, 72, 76, 74, 72, 67, 64] },
  { c: [43, 47, 50, 55], m: [67, 71, 74, 79, 76, 74, 71, 67] },
  { c: [41, 45, 48, 53], m: [69, 72, 76, 74, 72, 69, 72, 74] },
  { c: [43, 47, 50, 55], m: [76, 74, 71, 72, 74, 76, 79, 0] },

  { c: [41, 45, 48, 53], m: [81, 0, 79, 81, 84, 81, 79, 0] },
  { c: [48, 52, 55, 60], m: [79, 76, 74, 76, 79, 0, 81, 79] },
  { c: [43, 47, 50, 55], m: [74, 76, 79, 81, 79, 76, 74, 71] },
  { c: [45, 48, 52, 57], m: [72, 76, 79, 76, 72, 69, 72, 0] },
  { c: [41, 45, 48, 53], m: [77, 76, 74, 72, 74, 76, 77, 79] },
  { c: [48, 52, 55, 60], m: [76, 72, 69, 72, 76, 79, 76, 0] },
  { c: [50, 53, 57, 62], m: [74, 72, 69, 67, 69, 72, 74, 76] },
  { c: [43, 47, 50, 55], m: [74, 71, 67, 71, 74, 76, 79, 76] },

  { c: [41, 45, 48, 53], m: [84, 81, 79, 81, 84, 0, 81, 79] },
  { c: [48, 52, 55, 64], m: [76, 79, 81, 84, 81, 79, 76, 74] },
  { c: [43, 47, 50, 55], m: [79, 76, 74, 76, 79, 74, 71, 0] },
  { c: [45, 48, 52, 57], m: [72, 74, 76, 79, 81, 79, 76, 72] },
  { c: [41, 45, 48, 53], m: [77, 81, 84, 81, 77, 76, 74, 72] },
  { c: [48, 52, 55, 60], m: [72, 76, 79, 76, 72, 67, 69, 72] },
  { c: [52, 55, 59, 64], m: [71, 74, 76, 79, 76, 74, 71, 67] },
  { c: [43, 47, 50, 55], m: [67, 71, 74, 76, 79, 76, 74, 0] },

  { c: [45, 48, 52, 57], m: [69, 0, 72, 69, 67, 69, 72, 0] },
  { c: [41, 45, 48, 53], m: [65, 69, 72, 74, 72, 69, 65, 0] },
  { c: [48, 52, 55, 60], m: [64, 67, 72, 76, 72, 67, 64, 0] },
  { c: [43, 47, 50, 55], m: [67, 71, 74, 72, 71, 67, 64, 67] },
  { c: [45, 48, 52, 57], m: [69, 72, 76, 74, 72, 69, 67, 69] },
  { c: [41, 45, 48, 53], m: [72, 74, 76, 79, 76, 74, 72, 69] },
  { c: [50, 53, 57, 62], m: [69, 74, 77, 76, 74, 69, 67, 65] },
  { c: [43, 47, 50, 55], m: [67, 71, 74, 76, 74, 72, 71, 67] },

  { c: [41, 45, 48, 53], m: [79, 81, 84, 81, 79, 76, 77, 79] },
  { c: [48, 52, 55, 60], m: [81, 79, 76, 72, 76, 79, 81, 0] },
  { c: [43, 47, 50, 55], m: [79, 74, 71, 74, 79, 81, 79, 76] },
  { c: [45, 48, 52, 57], m: [76, 72, 69, 72, 76, 79, 76, 72] },
  { c: [41, 45, 48, 53], m: [72, 77, 81, 79, 77, 72, 69, 0] },
  { c: [48, 52, 55, 60], m: [67, 72, 76, 79, 76, 72, 67, 64] },
  { c: [43, 47, 50, 55], m: [62, 67, 71, 74, 76, 74, 71, 67] },
  { c: [48, 52, 55, 60], m: [72, 76, 79, 76, 72, 67, 64, 60] },
];

let bgmMode: BgmMode = "off";
let bgmHeat = 0;
let bgmTimer: number | null = null;
let nextBeatAt = 0;
let beat = 0;

function midiHz(n: number) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

function softTone(freq: number, dur: number, gain: number, t0: number, attack: number, type: OscillatorType = "sine") {
  const b = getBus();
  if (!b) return;
  const osc = b.ctx.createOscillator();
  const g = b.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + attack);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 0.55), t0 + dur * 0.48);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(b.music);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

function isChorusBar(idx: number) {
  return (idx >= 16 && idx <= 31) || (idx >= 40 && idx <= 47);
}

function scheduleBeat(step: number, t0: number) {
  const b = getBus();
  if (!b) return;
  const play = bgmMode === "play";
  const barN = Math.floor(step / 8);
  const cycle = Math.floor(barN / SONG.length);
  const start = [0, 16, 32, 8][cycle % 4]!;
  const idx = (barN + start) % SONG.length;
  const eighth = step % 8;
  const bar = SONG[idx]!;
  const eighthSec = beatSeconds();
  const padGain = play ? 0.028 : 0.024;
  const lift = play ? Math.round(bgmHeat) : 0;

  if (eighth === 0) {
    for (const n of bar.c) {
      softTone(midiHz(n), eighthSec * 8.6, padGain, t0, 0.38);
    }
    softTone(midiHz(bar.c[0]! - 12), eighthSec * 8.8, padGain * 1.05, t0, 0.42);
  }
  if (eighth === 0 || eighth === 4) {
    softTone(midiHz(bar.c[0]!), eighthSec * 2.6, play ? 0.046 : 0.038, t0, 0.03);
  }

  const note = bar.m[eighth]!;
  if (note > 0) {
    const mGain = play ? 0.052 : 0.044;
    const next = bar.m[(eighth + 1) % 8];
    const dur = eighthSec * (eighth === 7 || next === 0 ? 2.4 : 1.7);
    softTone(midiHz(note + lift), dur, mGain, t0, 0.05, "triangle");
    softTone(midiHz(note + lift), dur * 1.12, mGain * 0.28, t0, 0.08);
    if (isChorusBar(idx) && (eighth === 0 || eighth === 4)) {
      softTone(midiHz(note + 12 + lift), dur * 0.9, mGain * 0.18, t0, 0.06);
    }
    if (eighth % 2 === 0) {
      softTone(midiHz(note + lift), dur * 1.2, mGain * 0.22, t0 + eighthSec * 1.5, 0.1);
    }
  }

  if (play && bgmHeat >= 0.7 && eighth === 6 && note > 0) {
    softTone(midiHz(note + 7 + lift), eighthSec * 1.4, 0.016, t0 + 0.04, 0.08);
  }
  b.air.frequency.setTargetAtTime(play ? 2100 + bgmHeat * 280 : 1750, t0, 0.3);
}

function beatSeconds() {
  const bpm = (bgmMode === "play" ? 94 : 82) * (1 + bgmHeat * 0.02);
  return 60 / bpm / 2;
}

function bgmTick() {
  const b = getBus();
  if (!b || muted || musicVol <= 0.01 || bgmMode === "off") {
    stopBgm();
    return;
  }
  const horizon = b.ctx.currentTime + 0.28;
  while (nextBeatAt < horizon) {
    scheduleBeat(beat, nextBeatAt);
    nextBeatAt += beatSeconds();
    beat += 1;
  }
}

function startBgmIfNeeded() {
  const b = getBus();
  if (!b || muted || musicVol <= 0.01 || bgmMode === "off") return;
  if (b.ctx.state === "suspended") return;
  if (bgmTimer != null) return;
  nextBeatAt = b.ctx.currentTime + 0.08;
  bgmTimer = window.setInterval(bgmTick, 50);
  bgmTick();
}

function stopBgm() {
  if (bgmTimer != null) {
    window.clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

export function syncBgm(mode: BgmMode, heat = 0) {
  const nextHeat = Math.max(0, Math.min(1, heat));
  const changed = mode !== bgmMode;
  bgmMode = mode;
  bgmHeat = nextHeat;
  if (mode === "off" || muted || musicVol <= 0.01) {
    stopBgm();
    return;
  }
  if (changed) {
    stopBgm();
    beat = 0;
  }
  startBgmIfNeeded();
}
