import { type ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, FileText, Mail, Music2, RotateCcw, Shield, Volume2, VolumeX, Vibrate } from "lucide-react";
import { LANG_OPTIONS, t } from "@/lib/game/i18n";
import { useGridPop } from "@/lib/game/store";
import { sfx, unlockAudio } from "@/lib/game/audio";
import { AdBanner } from "./ads";
import { GameLogo } from "./icons";
import { SITE } from "@/lib/game/site";
import { contactCopy, legalSections } from "@/lib/game/legal";
import type { Lang, Screen } from "@/lib/game/types";

export function Menu() {
  const lang = useGridPop((s) => s.settings.lang);
  const startGame = useGridPop((s) => s.startGame);
  const openSettings = useGridPop((s) => s.openSettings);

  return (
    <div className="gp-screen gp-menu">
      <GameLogo className="gp-cover gp-menu-logo" />
      <h1 className="sr-only">Grid Pop!</h1>
      <div className="gp-menu-actions">
        <button
          type="button"
          className="gp-btn gp-btn-primary"
          onClick={() => {
            try {
              unlockAudio();
            } catch {
              /* ignore */
            }
            try {
              sfx.tap();
            } catch {
              /* ignore */
            }
            startGame();
          }}
        >
          {t(lang, "play")}
        </button>
        <button
          type="button"
          className="gp-btn gp-btn-secondary"
          onClick={() => {
            sfx.tap();
            openSettings();
          }}
        >
          {t(lang, "settings")}
        </button>
      </div>
      <LegalLinks />
      <AdBanner lang={lang} className="mt-auto" />
    </div>
  );
}

export function Settings() {
  const lang = useGridPop((s) => s.settings.lang);
  const sound = useGridPop((s) => s.settings.sound);
  const music = useGridPop((s) => s.settings.music);
  const sfxVol = useGridPop((s) => s.settings.sfxVol);
  const shake = useGridPop((s) => s.settings.shake);
  const setLang = useGridPop((s) => s.setLang);
  const toggleSound = useGridPop((s) => s.toggleSound);
  const setMusic = useGridPop((s) => s.setMusic);
  const setSfxVol = useGridPop((s) => s.setSfxVol);
  const toggleShake = useGridPop((s) => s.toggleShake);
  const closeSettings = useGridPop((s) => s.closeSettings);
  const setScreen = useGridPop((s) => s.setScreen);
  const settingsFrom = useGridPop((s) => s.settingsFrom);
  const startGame = useGridPop((s) => s.startGame);

  return (
    <div className="gp-screen gp-settings">
      <header className="gp-sheet-head">
        <button
          type="button"
          className="gp-icon-btn"
          onClick={() => {
            sfx.tap();
            closeSettings();
          }}
          aria-label={t(lang, "back")}
        >
          <ChevronLeft />
        </button>
        <h2>{t(lang, "settings")}</h2>
        <span className="gp-icon-btn ghost" />
      </header>

      <div className="gp-set-card">
        <div className="gp-set-row gp-set-stack">
          <p className="gp-set-label">{t(lang, "language")}</p>
          <div className="gp-lang">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={opt.id === lang ? "is-on" : ""}
                onClick={() => {
                  sfx.tap();
                  setLang(opt.id);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="gp-set-row"
          onClick={() => {
            sfx.tap();
            setScreen("howto");
          }}
        >
          <BookOpen className="gp-set-ico" />
          <span className="gp-set-label">{t(lang, "howTo")}</span>
          <ChevronRight className="gp-set-chev" />
        </button>

        {settingsFrom === "play" ? (
          <button
            type="button"
            className="gp-set-row"
            onClick={() => {
              sfx.tap();
              startGame(true);
            }}
          >
            <RotateCcw className="gp-set-ico" />
            <span className="gp-set-label">{t(lang, "newGame")}</span>
          </button>
        ) : null}

        <button type="button" className="gp-set-row" onClick={toggleSound}>
          {sound ? <Volume2 className="gp-set-ico" /> : <VolumeX className="gp-set-ico" />}
          <span className="gp-set-label">{t(lang, "sound")}</span>
          <span className="gp-set-val">{t(lang, sound ? "on" : "off")}</span>
        </button>

        <label className="gp-set-row gp-set-stack">
          <span className="gp-set-slide-head">
            <Music2 className="gp-set-ico" />
            <span className="gp-set-label">{t(lang, "music")}</span>
            <span className="gp-set-val">{Math.round(music * 100)}</span>
          </span>
          <input
            className="gp-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(music * 100)}
            aria-label={t(lang, "music")}
            onPointerDown={() => unlockAudio()}
            onChange={(e) => setMusic(Number(e.target.value) / 100)}
          />
        </label>

        <label className="gp-set-row gp-set-stack">
          <span className="gp-set-slide-head">
            <Volume2 className="gp-set-ico" />
            <span className="gp-set-label">{t(lang, "sfx")}</span>
            <span className="gp-set-val">{Math.round(sfxVol * 100)}</span>
          </span>
          <input
            className="gp-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(sfxVol * 100)}
            aria-label={t(lang, "sfx")}
            onPointerDown={() => unlockAudio()}
            onChange={(e) => setSfxVol(Number(e.target.value) / 100)}
          />
        </label>

        <button type="button" className="gp-set-row" onClick={toggleShake}>
          <Vibrate className="gp-set-ico" />
          <span className="gp-set-label">{t(lang, "shake")}</span>
          <span className="gp-set-val">{t(lang, shake ? "on" : "off")}</span>
        </button>
      </div>

      <div className="gp-set-card">
        <p className="gp-set-label gp-legal-head">{t(lang, "legal")}</p>
        <LegalRow screen="privacy" icon={<Shield className="gp-set-ico" />} label={t(lang, "privacy")} />
        <LegalRow screen="terms" icon={<FileText className="gp-set-ico" />} label={t(lang, "terms")} />
        <LegalRow screen="contact" icon={<Mail className="gp-set-ico" />} label={t(lang, "contact")} />
      </div>

      <AdBanner lang={lang} className="mt-auto" />
    </div>
  );
}

export function HowTo() {
  const lang = useGridPop((s) => s.settings.lang);
  const setScreen = useGridPop((s) => s.setScreen);
  const steps = [
    { t: "how1t", b: "how1", art: "drag" },
    { t: "how2t", b: "how2", art: "pop" },
    { t: "how3t", b: "how3", art: "combo" },
    { t: "how4t", b: "how4", art: "end" },
  ] as const;

  return (
    <div className="gp-screen gp-howto">
      <header className="gp-sheet-head">
        <button
          type="button"
          className="gp-icon-btn"
          onClick={() => {
            sfx.tap();
            setScreen("settings");
          }}
          aria-label={t(lang, "back")}
        >
          <ChevronLeft />
        </button>
        <h2>{t(lang, "howTo")}</h2>
        <span className="gp-icon-btn ghost" />
      </header>
      <div className="gp-how-list">
        {steps.map((s, i) => (
          <article key={s.t} className="gp-how-card">
            <MiniArt kind={s.art} />
            <div>
              <p className="gp-how-step">
                {i + 1}. {t(lang, s.t)}
              </p>
              <p className="gp-how-body">{t(lang, s.b)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MiniArt({ kind }: { kind: "drag" | "pop" | "combo" | "end" }) {
  if (kind === "drag") {
    return (
      <div className="gp-mini">
        <span className="c c1" />
        <span className="c c2" />
        <span className="c c1" />
        <span className="c empty" />
        <span className="c c2" />
        <span className="c empty" />
      </div>
    );
  }
  if (kind === "pop") {
    return (
      <div className="gp-mini gp-mini-pop">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={i < 3 ? "c c3" : "c empty"} />
        ))}
      </div>
    );
  }
  if (kind === "combo") {
    return <div className="gp-mini-combo">x4</div>;
  }
  return (
    <div className="gp-mini">
      <span className="c c5" />
      <span className="c c6" />
      <span className="c empty" />
      <span className="c c5" />
      <span className="c empty" />
      <span className="c c6" />
    </div>
  );
}

function LegalLinks() {
  const lang = useGridPop((s) => s.settings.lang);
  const setScreen = useGridPop((s) => s.setScreen);
  const go = (screen: Screen) => {
    sfx.tap();
    setScreen(screen);
  };
  return (
    <nav className="gp-legal-links" aria-label={t(lang, "legal")}>
      <button type="button" onClick={() => go("privacy")}>
        {t(lang, "privacy")}
      </button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => go("terms")}>
        {t(lang, "terms")}
      </button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => go("contact")}>
        {t(lang, "contact")}
      </button>
    </nav>
  );
}

function LegalRow({
  screen,
  icon,
  label,
}: {
  screen: Screen;
  icon: ReactNode;
  label: string;
}) {
  const setScreen = useGridPop((s) => s.setScreen);
  return (
    <button
      type="button"
      className="gp-set-row"
      onClick={() => {
        sfx.tap();
        setScreen(screen);
      }}
    >
      {icon}
      <span className="gp-set-label">{label}</span>
      <ChevronRight className="gp-set-chev" />
    </button>
  );
}

export function LegalDoc({ kind }: { kind: "privacy" | "terms" | "contact" }) {
  const lang = useGridPop((s) => s.settings.lang);
  const setScreen = useGridPop((s) => s.setScreen);
  const settingsFrom = useGridPop((s) => s.settingsFrom);
  const title = t(lang, kind);
  return (
    <div className="gp-screen gp-legal">
      <header className="gp-sheet-head">
        <button
          type="button"
          className="gp-icon-btn"
          onClick={() => {
            sfx.tap();
            setScreen(settingsFrom === "play" ? "settings" : "menu");
          }}
          aria-label={t(lang, "back")}
        >
          <ChevronLeft />
        </button>
        <h2>{title}</h2>
        <span className="gp-icon-btn ghost" />
      </header>
      <article className="gp-legal-card">
        {kind === "contact" ? (
          <ContactBody lang={lang} />
        ) : (
          legalSections(kind, lang).map((sec) => (
            <section key={sec.h} className="gp-legal-sec">
              <h3>{sec.h}</h3>
              <p>{sec.p}</p>
            </section>
          ))
        )}
      </article>
    </div>
  );
}

function ContactBody({ lang }: { lang: Lang }) {
  const copy = contactCopy[lang];
  return (
    <>
      <p className="gp-legal-lead">{copy.intro}</p>
      <a className="gp-legal-mail" href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(SITE.name)}`}>
        {SITE.contactEmail}
      </a>
      {copy.topics.map((item) => (
        <section key={item.title} className="gp-legal-sec">
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </section>
      ))}
      <p className="gp-legal-note">{copy.footer}</p>
    </>
  );
}

