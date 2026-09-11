import type { Lang } from "./types";

const dict = {
  appName: { "zh-HK": "Grid Pop!", "zh-CN": "Grid Pop!", en: "Grid Pop!" },
  play: { "zh-HK": "進入遊戲", "zh-CN": "进入游戏", en: "Play" },
  settings: { "zh-HK": "設定", "zh-CN": "设置", en: "Settings" },
  language: { "zh-HK": "語言", "zh-CN": "语言", en: "Language" },
  howTo: { "zh-HK": "遊戲說明", "zh-CN": "游戏说明", en: "How to Play" },
  sound: { "zh-HK": "聲音", "zh-CN": "声音", en: "Sound" },
  music: { "zh-HK": "音樂", "zh-CN": "音乐", en: "Music" },
  sfx: { "zh-HK": "音效", "zh-CN": "音效", en: "Sound effects" },
  shake: { "zh-HK": "畫面震動", "zh-CN": "画面震动", en: "Screen Shake" },
  on: { "zh-HK": "開", "zh-CN": "开", en: "On" },
  off: { "zh-HK": "關", "zh-CN": "关", en: "Off" },
  back: { "zh-HK": "返回", "zh-CN": "返回", en: "Back" },
  best: { "zh-HK": "最高分", "zh-CN": "最高分", en: "Best" },
  score: { "zh-HK": "分數", "zh-CN": "分数", en: "Score" },
  pause: { "zh-HK": "暫停", "zh-CN": "暂停", en: "Paused" },
  resume: { "zh-HK": "繼續", "zh-CN": "继续", en: "Resume" },
  quit: { "zh-HK": "返回主頁", "zh-CN": "返回主页", en: "Home" },
  gameOver: { "zh-HK": "遊戲結束", "zh-CN": "游戏结束", en: "Game Over" },
  playAgain: { "zh-HK": "再來一局", "zh-CN": "再来一局", en: "Play Again" },
  newGame: { "zh-HK": "新遊戲", "zh-CN": "新游戏", en: "New Game" },
  newBest: { "zh-HK": "新最高分！", "zh-CN": "新最高分！", en: "New Best!" },
  continueAd: { "zh-HK": "觀看廣告繼續", "zh-CN": "观看广告继续", en: "Watch Ad to Continue" },
  skip: { "zh-HK": "跳過", "zh-CN": "跳过", en: "Skip" },
  ad: { "zh-HK": "廣告", "zh-CN": "广告", en: "Ad" },
  tapSkip: { "zh-HK": "點擊跳過", "zh-CN": "点击跳过", en: "Tap to skip" },
  tapContinue: { "zh-HK": "輕觸進入", "zh-CN": "轻触进入", en: "Tap to enter" },
  awesome: { "zh-HK": "太棒了", "zh-CN": "太棒了", en: "Awesome" },
  how1t: { "zh-HK": "拖放方塊", "zh-CN": "拖放方块", en: "Drag the blocks" },
  how1: {
    "zh-HK": "底部每次會出現 3 個不同形狀的方塊。把它們拖到 8×8 棋盤的空位上。方塊不能旋轉。",
    "zh-CN": "底部每次会出现 3 个不同形状的方块。把它们拖到 8×8 棋盘的空位上。方块不能旋转。",
    en: "Three shapes appear at the bottom. Drag them onto empty cells of the 8×8 grid. Pieces cannot be rotated.",
  },
  how2t: { "zh-HK": "填滿就 Pop", "zh-CN": "填满就 Pop", en: "Fill a line, Pop!" },
  how2: {
    "zh-HK": "任何一列或一行被完全填滿，就會立刻消除並得分。行列可以同時爆發。",
    "zh-CN": "任何一列或一行被完全填满，就会立刻消除并得分。行列可以同时爆发。",
    en: "Fill every cell in a row or column to pop it for points. Rows and columns can burst at the same time.",
  },
  how3t: { "zh-HK": "連擊加分", "zh-CN": "连击加分", en: "Chain combos" },
  how3: {
    "zh-HK": "每次消除至少一行／列，Combo 就 +1，沒有上限。連續放下三塊都沒有消除，Combo 才會歸零。連擊加分會隨 Combo 升高而逐漸趨緩。一次清掉兩行／列或以上，倍率會提高。",
    "zh-CN": "每次消除至少一行／列，Combo 就 +1，没有上限。连续放下三块都没有消除，Combo 才会归零。连击加分会随 Combo 升高而逐渐趋缓。一次清掉两行／列或以上，倍率会提高。",
    en: "Each clear of at least one line adds +1 Combo, with no cap. Combo resets only after three placements in a row with no clear. Combo bonuses flatten as the streak grows. Clearing two or more lines at once pays a higher multiplier.",
  },
  how4t: { "zh-HK": "放不下就結束", "zh-CN": "放不下就结束", en: "No fit, game over" },
  how4: {
    "zh-HK": "當剩餘的方塊全部都放不進棋盤時，遊戲結束。進度會自動存檔，隨時可以回來接著玩。",
    "zh-CN": "当剩余的方块全部都放不进棋盘时，游戏结束。进度会自动存档，随时可以回来接着玩。",
    en: "If none of the remaining pieces can fit, the game ends. Progress is saved automatically so you can jump back in.",
  },
  praise2: { "zh-HK": "漂亮！", "zh-CN": "漂亮！", en: "Nice!" },
  praise3: { "zh-HK": "超棒！", "zh-CN": "超棒！", en: "Super!" },
  praise4: { "zh-HK": "厲害！", "zh-CN": "厉害！", en: "Amazing!" },
  praise5: { "zh-HK": "不可思議！", "zh-CN": "不可思议！", en: "Unbelievable!" },
  praise6: { "zh-HK": "傳奇！", "zh-CN": "传奇！", en: "Legendary!" },
  praise7: { "zh-HK": "神級！", "zh-CN": "神级！", en: "Godlike!" },
  mega: { "zh-HK": "超級爆發", "zh-CN": "超级爆发", en: "MEGA POP" },
  double: { "zh-HK": "雙重消除", "zh-CN": "双重消除", en: "DOUBLE" },
  triple: { "zh-HK": "三重爆發", "zh-CN": "三重爆发", en: "TRIPLE" },
  perfect: { "zh-HK": "全盤清空！", "zh-CN": "全盘清空！", en: "PERFECT CLEAR" },
  combo: { "zh-HK": "連擊", "zh-CN": "连击", en: "COMBO" },
  saved: { "zh-HK": "已繼續上次進度", "zh-CN": "已继续上次进度", en: "Progress restored" },
  privacy: { "zh-HK": "私隱政策", "zh-CN": "隐私政策", en: "Privacy Policy" },
  terms: { "zh-HK": "使用條款", "zh-CN": "使用条款", en: "Terms of Use" },
  contact: { "zh-HK": "聯絡我們", "zh-CN": "联系我们", en: "Contact Us" },
  legal: { "zh-HK": "法律與支援", "zh-CN": "法律与支持", en: "Legal & Support" },
} as const;

export type I18nKey = keyof typeof dict;

export function t(lang: Lang, key: I18nKey): string {
  return dict[key][lang];
}

export function praiseForCombo(lang: Lang, combo: number): string | null {
  if (combo < 2) return null;
  if (combo === 2) return t(lang, "praise2");
  if (combo === 3) return t(lang, "praise3");
  if (combo === 4) return t(lang, "praise4");
  if (combo === 5) return t(lang, "praise5");
  if (combo === 6) return t(lang, "praise6");
  return t(lang, "praise7");
}

export function burstLabel(lang: Lang, lines: number, perfect: boolean): string | null {
  if (perfect) return t(lang, "perfect");
  if (lines >= 4) return t(lang, "mega");
  if (lines === 3) return t(lang, "triple");
  if (lines === 2) return t(lang, "double");
  return null;
}

export const LANG_OPTIONS: { id: Lang; label: string }[] = [
  { id: "zh-HK", label: "繁體中文" },
  { id: "zh-CN", label: "简体中文" },
  { id: "en", label: "English" },
];

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "zh-HK";
  const loc = navigator.language || "en";
  const lower = loc.toLowerCase();
  if (lower.startsWith("zh")) {
    if (lower.includes("cn") || lower.includes("hans") || lower === "zh") return "zh-CN";
    return "zh-HK";
  }
  return "en";
}
