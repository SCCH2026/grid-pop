import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGridPop } from "@/lib/game/store";
import { setMusicDuck, syncBgm, unlockAudio } from "@/lib/game/audio";
import { coverIsOn, skipCover } from "@/lib/game/cover-boot";
import { HowTo, LegalDoc, Menu, Settings } from "./screens";
import { Play } from "./play";

const MENU_ARM_MS = 320;

function comboTier(combo: number): 0 | 1 | 2 | 3 | 4 {
  if (combo >= 9) return 4;
  if (combo >= 6) return 3;
  if (combo >= 4) return 2;
  if (combo >= 2) return 1;
  return 0;
}

export function GridPopApp() {
  const screen = useGridPop((s) => s.screen);
  const combo = useGridPop((s) => s.combo);
  const paused = useGridPop((s) => s.paused);
  const gameOver = useGridPop((s) => s.gameOver);
  const sound = useGridPop((s) => s.settings.sound);
  const music = useGridPop((s) => s.settings.music);
  const hydrate = useGridPop((s) => s.hydrate);
  const persist = useGridPop((s) => s.persist);
  const playing = screen === "play" && !gameOver;
  const tier = playing ? comboTier(combo) : 0;
  const [coverOn, setCoverOn] = useState(true);
  const [hot, setHot] = useState(false);
  const armRef = useRef<number>(0);
  const goneRef = useRef(false);

  const hideCover = useCallback((instantHot = false) => {
    skipCover();
    const first = !goneRef.current;
    goneRef.current = true;
    setCoverOn(false);
    if (instantHot) {
      window.clearTimeout(armRef.current);
      setHot(true);
      return;
    }
    if (!first) return;
    setHot(false);
    window.clearTimeout(armRef.current);
    armRef.current = window.setTimeout(() => setHot(true), MENU_ARM_MS);
    try {
      unlockAudio();
    } catch {
      /* never block leaving the cover */
    }
  }, []);

  useLayoutEffect(() => {
    const onSkip = () => hideCover();
    window.addEventListener("gp-cover-skip", onSkip);
    const sync = () => {
      if (!coverIsOn()) hideCover();
    };
    sync();
    const poll = window.setInterval(sync, 50);
    const stop = window.setTimeout(() => window.clearInterval(poll), 8000);
    return () => {
      window.removeEventListener("gp-cover-skip", onSkip);
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, [hideCover]);

  useEffect(() => {
    hydrate();
    if (useGridPop.getState().screen === "play") {
      hideCover(true);
    }
    const onHide = () => {
      if (document.visibilityState === "hidden") persist();
      else unlockAudio();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", persist);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", persist);
      window.clearTimeout(armRef.current);
    };
  }, [hydrate, persist, hideCover]);

  useEffect(() => {
    if (!sound || music <= 0.01) {
      syncBgm("off");
      return;
    }
    if (coverOn) {
      syncBgm("off");
      return;
    }
    const play = screen === "play" && !gameOver;
    syncBgm(play ? "play" : "menu", play ? comboTier(combo) / 4 : 0);
    setMusicDuck(play && paused ? 0.32 : 1);
  }, [screen, combo, paused, gameOver, sound, music, coverOn]);

  return (
    <div
      className="gp-root"
      data-combo={tier}
      data-scene={coverOn ? "cover" : playing ? "play" : screen}
      data-cover={coverOn ? "on" : "off"}
      data-hot={hot ? "1" : "0"}
    >
      <div className="gp-sky" aria-hidden="true">
        <span className="orb o1" />
        <span className="orb o2" />
        <span className="orb o3" />
        <span className="orb o4" />
        <span className="gp-sky-wash" />
      </div>
      {!coverOn && screen === "menu" ? <Menu /> : null}
      {!coverOn && screen === "settings" ? <Settings /> : null}
      {!coverOn && screen === "howto" ? <HowTo /> : null}
      {!coverOn && screen === "privacy" ? <LegalDoc kind="privacy" /> : null}
      {!coverOn && screen === "terms" ? <LegalDoc kind="terms" /> : null}
      {!coverOn && screen === "contact" ? <LegalDoc kind="contact" /> : null}
      {!coverOn && screen === "play" ? <Play /> : null}
    </div>
  );
}
