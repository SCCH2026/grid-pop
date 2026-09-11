import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/game/i18n";
import type { Lang } from "@/lib/game/types";
import { cn } from "@/lib/utils";

const CREATIVES = [
  {
    id: "stack",
    kicker: { "zh-HK": "熱門遊戲", "zh-CN": "热门游戏", en: "Hot Game" },
    title: { "zh-HK": "Candy Stack", "zh-CN": "Candy Stack", en: "Candy Stack" },
    body: { "zh-HK": "免費下載 · 立即暢玩", "zh-CN": "免费下载 · 立即畅玩", en: "Free · Play now" },
    cta: { "zh-HK": "安裝", "zh-CN": "安装", en: "Install" },
    hue: "from-[#FF8BA7] to-[#FF4B7A]",
  },
  {
    id: "shop",
    kicker: { "zh-HK": "限時優惠", "zh-CN": "限时优惠", en: "Flash Sale" },
    title: { "zh-HK": "夏日七折起", "zh-CN": "夏日七折起", en: "Summer 30% off" },
    body: { "zh-HK": "服飾 · 波鞋 · 配件", "zh-CN": "服饰 · 球鞋 · 配件", en: "Style · Kicks · More" },
    cta: { "zh-HK": "逛逛", "zh-CN": "逛逛", en: "Shop" },
    hue: "from-[#7AD7FF] to-[#2EA3FF]",
  },
  {
    id: "food",
    kicker: { "zh-HK": "外賣", "zh-CN": "外卖", en: "Delivery" },
    title: { "zh-HK": "首單免運", "zh-CN": "首单免运", en: "Free first delivery" },
    body: { "zh-HK": "30 分鐘送到", "zh-CN": "30 分钟送到", en: "At your door in 30m" },
    cta: { "zh-HK": "點餐", "zh-CN": "点餐", en: "Order" },
    hue: "from-[#FFD56A] to-[#FF9F1C]",
  },
  {
    id: "trip",
    kicker: { "zh-HK": "旅遊", "zh-CN": "旅游", en: "Travel" },
    title: { "zh-HK": "週末出走", "zh-CN": "周末出走", en: "Weekend getaway" },
    body: { "zh-HK": "機票酒店套票", "zh-CN": "机票酒店套票", en: "Flights + stays" },
    cta: { "zh-HK": "預訂", "zh-CN": "预订", en: "Book" },
    hue: "from-[#7EEED0] to-[#2EC4B6]",
  },
] as const;

function pickCreative(seed: number) {
  return CREATIVES[Math.abs(seed) % CREATIVES.length]!;
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
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const tmr = window.setInterval(() => setIdx((n) => n + 1), 8000);
    return () => window.clearInterval(tmr);
  }, []);
  const ad = pickCreative(idx);
  return (
    <aside className={cn("gp-ad", size === "wide" && "gp-ad-wide", className)} aria-label={t(lang, "ad")}>
      <span className="gp-ad-tag">{t(lang, "ad")}</span>
      <div className={cn("gp-ad-art bg-gradient-to-br", ad.hue)} />
      <div className="gp-ad-copy">
        <p className="gp-ad-kicker">{ad.kicker[lang]}</p>
        <p className="gp-ad-title">{ad.title[lang]}</p>
        <p className="gp-ad-body">{ad.body[lang]}</p>
      </div>
      <span className="gp-ad-cta">{ad.cta[lang]}</span>
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
  const ad = useMemo(() => pickCreative(Date.now()), [open]);

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
      <div className={cn("gp-interstitial-stage bg-gradient-to-br", ad.hue)}>
        <span className="gp-ad-tag gp-ad-tag-lg">{t(lang, "ad")}</span>
        <p className="gp-interstitial-kicker">{ad.kicker[lang]}</p>
        <h2 className="gp-interstitial-title">{ad.title[lang]}</h2>
        <p className="gp-interstitial-body">{ad.body[lang]}</p>
        <span className="gp-ad-cta gp-ad-cta-lg">{ad.cta[lang]}</span>
        <div className="gp-ad-orbits" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <button type="button" className="gp-skip" disabled={left > 0} onClick={onDone}>
        {left > 0 ? `${t(lang, "skip")} ${left}` : t(lang, "tapSkip")}
      </button>
    </div>
  );
}
