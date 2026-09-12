/** Google AdSense publisher. Used in head, ads.txt, and in-page units. */
export const ADSENSE_CLIENT = "ca-pub-7778572681888859";
export const ADSENSE_SCRIPT = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function pushAdSense(): void {
  if (typeof window === "undefined") return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    /* unfilled on preview hosts or before AdSense approval */
  }
}
