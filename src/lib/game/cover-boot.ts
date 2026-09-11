declare global {
  interface Window {
    __GP_COVER?: {
      on: boolean;
      skip: () => void;
    };
  }
}

export function skipCover(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    if (window.__GP_COVER) window.__GP_COVER.on = false;
    window.__GP_COVER?.skip?.();
  } catch {
    /* fall through */
  }
  try {
    document.getElementById("gp-boot-cover")?.remove();
    document.documentElement.classList.add("gp-cover-off");
    document.documentElement.setAttribute("data-gp-cover", "off");
  } catch {
    /* ignore */
  }
}

export function coverIsOn(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.getAttribute("data-gp-cover") === "off") return false;
  if (document.documentElement.classList.contains("gp-cover-off")) return false;
  if (window.__GP_COVER && window.__GP_COVER.on === false) return false;
  return true;
}
