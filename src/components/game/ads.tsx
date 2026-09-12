import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/game/i18n";
import type { Lang } from "@/lib/game/types";
import { ADSENSE_CLIENT, pushAdSense } from "@/lib/game/adsense";
import { cn } from "@/lib/utils";

function AdSenseUnit({
  className,
  format = "auto",
}: {
  className?: string;
  format?: "auto" | "rectangle";
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
      data-ad-format={format === "rectangle" ? "rectangle" : "auto"}
      data-full-width-responsive="true"
    />
  );
}

export function AdBanner({
  lang,
  className,
  size = "banner",
}: {
  lang: Lang;
  className?: string;
  size?: "banner" | "wide";
}) {
  return (
    <aside
      className={cn("gp-ad gp-ad-live", size === "wide" && "gp-ad-wide", className)}
      aria-label={t(lang, "ad")}
    >
      <span className="gp-ad-tag">{t(lang, "ad")}</span>
      <AdSenseUnit />
    </aside>
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
