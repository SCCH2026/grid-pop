import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { t } from "@/lib/game/i18n";
import type { Lang } from "@/lib/game/types";
import { ADSENSE_CLIENT, pushAdSense } from "@/lib/game/adsense";
import { cn } from "@/lib/utils";

function AdSenseUnit({
  className,
  format = "auto",
}: {
  className?: string;
  format?: "auto" | "rectangle" | "horizontal";
}) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getAttribute("data-adsbygoogle-status")) return;
    const id = window.requestAnimationFrame(() => {
      pushAdSense();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <ins
      ref={ref}
      className={cn("adsbygoogle gp-adsense-ins", className)}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-format={format}
      data-full-width-responsive={format === "horizontal" ? "false" : "true"}
    />
  );
}

export function AdBanner({
  lang,
  className,
  size = "banner",
  format = "auto",
}: {
  lang: Lang;
  className?: string;
  size?: "banner" | "wide";
  format?: "auto" | "rectangle" | "horizontal";
}) {
  return (
    <aside
      className={cn("gp-ad gp-ad-live", size === "wide" && "gp-ad-wide", className)}
      aria-label={t(lang, "ad")}
    >
      <span className="gp-ad-tag">{t(lang, "ad")}</span>
      <AdSenseUnit format={format} />
    </aside>
  );
}

const MENU_AD_H = "min(72px, 16.666dvh)";
const MENU_AD_MAX = "16.666dvh";

export function MenuAdSlot({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pin = () => {
      if (el.style.getPropertyValue("height") !== MENU_AD_H) {
        el.style.setProperty("height", MENU_AD_H, "important");
      }
      if (el.style.getPropertyValue("max-height") !== MENU_AD_MAX) {
        el.style.setProperty("max-height", MENU_AD_MAX, "important");
      }
      el.style.setProperty("overflow", "hidden", "important");
    };
    pin();
    const mo = new MutationObserver(pin);
    mo.observe(el, { attributes: true, attributeFilter: ["style"] });
    return () => mo.disconnect();
  }, []);

  return (
    <div ref={ref} className="gp-menu-ad-slot">
      <AdBanner lang={lang} className="gp-menu-ad" format="horizontal" />
    </div>
  );
}

export function InterstitialAd({
  lang,
  open,
  onDone,
}: {
  lang: Lang;
  open: boolean;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(5);

  useEffect(() => {
    if (!open) return;
    setLeft(5);
    const tmr = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          window.clearInterval(tmr);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(tmr);
  }, [open]);

  if (!open) return null;

  return (
    <div className="gp-interstitial" role="dialog" aria-modal="true" aria-label={t(lang, "ad")}>
      <div className="gp-interstitial-stage gp-interstitial-adsense">
        <span className="gp-ad-tag gp-ad-tag-lg">{t(lang, "ad")}</span>
        <AdSenseUnit format="rectangle" className="gp-adsense-interstitial" />
      </div>
      <button type="button" className="gp-skip" disabled={left > 0} onClick={onDone}>
        {left > 0 ? `${t(lang, "skip")} ${left}` : t(lang, "tapSkip")}
      </button>
    </div>
  );
}
