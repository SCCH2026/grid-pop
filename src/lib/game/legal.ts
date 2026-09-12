import type { Lang } from "./types";
import { SITE } from "./site";

export interface LegalSection {
  h: string;
  p: string;
}

const privacy: Record<Lang, LegalSection[]> = {
  "zh-HK": [
    {
      h: "簡介",
      p: `最後更新：${SITE.updated}\n\n歡迎遊玩 ${SITE.name}。本政策說明我們在你使用網站或日後的手機 App 時，如何收集、使用、分享與保護資料。使用本遊戲即表示你了解本政策。`,
    },
    {
      h: "1. 我們收集的資料",
      p: "A. 你主動提供的資料\n只有在你聯絡我們（例如電郵查詢、意見或私隱請求）時，我們才會收到你留下的電郵地址與信件內容。遊玩不必註冊帳號。\n\nB. 只存在你裝置上的資料\n遊戲進度、最高分數、語言、音樂／音效與震動設定，儲存在你的瀏覽器或 App 本機。這些資料用來記住進度，預設不會上傳到我們的伺服器做個人檔案。\n\nC. 技術與使用資料\n當遊戲在網站或 App 運作時，我們或服務供應商可能收到裝置型號、作業系統、瀏覽器類型、粗略地區、工作階段長短、當機紀錄，以及是否完成一局或觀看廣告。這些資料用來維持服務與改善體驗。",
    },
    {
      h: "2. 我們如何使用資料",
      p: "我們使用上述資料以：提供與維持遊戲功能；記住你的進度與設定；回覆支援；改善穩定性與難度；顯示廣告並衡量廣告是否有人看到或點擊；遵守法律。",
    },
    {
      h: "3. 廣告與第三方服務",
      p: "本遊戲以免費遊玩為主，並顯示廣告。網站版使用 Google AdSense。App 版日後可能使用 Google AdMob 或其他廣告／分析夥伴。\n\nGoogle 及廣告夥伴可能使用 Cookie、裝置識別碼或類似技術，以提供廣告、限制重複曝光，或製作匯總統計。他們受自己的私隱政策約束。了解 Google 如何使用資料：https://policies.google.com/technologies/partner-sites\n\n你可在裝置設定關閉個人化廣告或限制廣告追蹤，或使用 https://www.google.com/settings/ads/。看廣告繼續是自願的，略過或拒絕不會刪除本機進度。",
    },
    {
      h: "4. 資料分享",
      p: "我們不會出售、出租或以行銷為目的買賣你的個人資料。我們只在以下情況分享資料：為運作遊戲而需要的廣告、分析或雲端供應商；法律要求；或為保護玩家、我們或公眾的權利與安全。",
    },
    {
      h: "5. 資料安全與保存",
      p: "我們採取合理的商業措施保護資料，但沒有任何網路傳輸或儲存方法是百分之百安全。本機進度會留在你的裝置上，直到你清除網站資料或刪除 App。聯絡信件只保存至處理完你的請求所需的時間，或法律要求的期限。",
    },
    {
      h: "6. 兒童私隱",
      p: `${SITE.name} 屬一般休閒娛樂，並非專為 13 歲以下兒童設計。我們不會故意向 13 歲以下兒童收集個人資料。若你認為孩子向我們提供了個人資料，請電郵 ${SITE.contactEmail}，我們會儘快刪除。`,
    },
    {
      h: "7. 你的權利與選擇",
      p: "視乎你所在地區（包括歐盟、英國、加州等地），你可能有權查閱、更正、刪除資料，限制處理，或退出針對性廣告。本機進度可自行在瀏覽器「清除這個網站的資料」或刪除 App 來移除。\n\n行使權利請電郵說明你的請求與聯絡方式。我們可能需要核對身份，並依法在合理時間內回覆。",
    },
    {
      h: "8. 政策更新",
      p: "我們可能更新本政策。更新日期會顯示在本頁頂部。重大變更我們會盡力在遊戲內提示。繼續使用即表示你接受更新後的政策。",
    },
    {
      h: "9. 聯絡我們",
      p: `如對本政策或你的資料有疑問，請電郵：${SITE.contactEmail}\n遊戲：${SITE.name}`,
    },
  ],
  "zh-CN": [
    {
      h: "简介",
      p: `最后更新：${SITE.updated}\n\n欢迎游玩 ${SITE.name}。本政策说明我们在你使用网站或日后的手机 App 时，如何收集、使用、分享与保护资料。使用本游戏即表示你了解本政策。`,
    },
    {
      h: "1. 我们收集的资料",
      p: "A. 你主动提供的资料\n只有在你联络我们（例如电邮查询、意见或隐私请求）时，我们才会收到你留下的电邮地址与信件内容。游玩不必注册账号。\n\nB. 只存在你装置上的资料\n游戏进度、最高分数、语言、音乐／音效与震动设置，储存在你的浏览器或 App 本地。这些资料用来记住进度，默认不会上传到我们的服务器做个人档案。\n\nC. 技术与使用资料\n当游戏在网站或 App 运作时，我们或服务供应商可能收到装置型号、操作系统、浏览器类型、粗略地区、工作阶段长短、崩溃记录，以及是否完成一局或观看广告。这些资料用来维持服务与改善体验。",
    },
    {
      h: "2. 我们如何使用资料",
      p: "我们使用上述资料以：提供与维持游戏功能；记住你的进度与设置；回复支持；改善稳定性与难度；显示广告并衡量广告是否有人看到或点击；遵守法律。",
    },
    {
      h: "3. 广告与第三方服务",
      p: "本游戏以免费游玩为主，并显示广告。网站版使用 Google AdSense。App 版日后可能使用 Google AdMob 或其他广告／分析伙伴。\n\nGoogle 及广告伙伴可能使用 Cookie、装置识别码或类似技术，以提供广告、限制重复曝光，或制作汇总统计。他们受自己的隐私政策约束。了解 Google 如何使用资料：https://policies.google.com/technologies/partner-sites\n\n你可在装置设置关闭个性化广告或限制广告追踪，或使用 https://www.google.com/settings/ads/。看广告继续是自愿的，跳过或拒绝不会删除本地进度。",
    },
    {
      h: "4. 资料分享",
      p: "我们不会出售、出租或以营销为目的买卖你的个人资料。我们只在以下情况分享资料：为运作游戏而需要的广告、分析或云端供应商；法律要求；或为保护玩家、我们或公众的权利与安全。",
    },
    {
      h: "5. 资料安全与保存",
      p: "我们采取合理的商业措施保护资料，但没有任何网络传输或储存方法是百分之百安全。本地进度会留在你的装置上，直到你清除网站数据或删除 App。联络信件只保存至处理完你的请求所需的时间，或法律要求的期限。",
    },
    {
      h: "6. 儿童隐私",
      p: `${SITE.name} 属一般休闲娱乐，并非专为 13 岁以下儿童设计。我们不会故意向 13 岁以下儿童收集个人资料。若你认为孩子向我们提供了个人资料，请电邮 ${SITE.contactEmail}，我们会尽快删除。`,
    },
    {
      h: "7. 你的权利与选择",
      p: "视乎你所在地区（包括欧盟、英国、加州等地），你可能有权查阅、更正、删除资料，限制处理，或退出针对性广告。本地进度可自行在浏览器「清除这个网站的数据」或删除 App 来移除。\n\n行使权利请电邮说明你的请求与联络方式。我们可能需要核对身份，并依法在合理时间内回复。",
    },
    {
      h: "8. 政策更新",
      p: "我们可能更新本政策。更新日期会显示在本页顶部。重大变更我们会尽力在游戏内提示。继续使用即表示你接受更新后的政策。",
    },
    {
      h: "9. 联络我们",
      p: `如对本政策或你的资料有疑问，请电邮：${SITE.contactEmail}\n游戏：${SITE.name}`,
    },
  ],
  en: [
    {
      h: "Introduction",
      p: `Last updated: ${SITE.updated}\n\nWelcome to ${SITE.name}. This policy explains how we collect, use, share and protect information when you play on the website or a future mobile app. By using the game you acknowledge this policy.`,
    },
    {
      h: "1. Information we collect",
      p: "A. Information you give us\nWe only receive an email address and message content if you contact us for support, feedback or a privacy request. You do not need an account to play.\n\nB. Information stored on your device\nProgress, high score, language, music / SFX and shake settings stay in your browser or app storage so the game can remember your run. They are not uploaded to our servers to build a profile.\n\nC. Technical and usage data\nWhen the game runs on web or app, we or our providers may receive device model, OS, browser type, coarse region, session length, crash logs, and whether a round or an ad was completed. This keeps the service working and helps us improve it.",
    },
    {
      h: "2. How we use information",
      p: "We use this information to run the game, remember progress and settings, answer support, improve stability and difficulty, show and measure ads, and comply with law.",
    },
    {
      h: "3. Advertising and third parties",
      p: "The game is free to play and shows ads. The website uses Google AdSense. A future app may use Google AdMob or similar ad / analytics partners.\n\nGoogle and those partners may use cookies, device identifiers or similar tools to serve ads, cap frequency or produce aggregate stats. They follow their own privacy policies. How Google uses data: https://policies.google.com/technologies/partner-sites\n\nYou can turn off personalised ads or limit ad tracking in device settings, or at https://www.google.com/settings/ads/. Watching an ad to continue is optional; skipping it does not erase local progress.",
    },
    {
      h: "4. Sharing",
      p: "We do not sell, rent or trade your personal information for marketing. We share data only with providers who help us run ads, analytics or hosting; when the law requires it; or to protect players, us or the public.",
    },
    {
      h: "5. Security and retention",
      p: "We use reasonable commercial safeguards, but no internet transmission or storage is 100% secure. Local progress stays on your device until you clear site data or delete the app. Support emails are kept only as long as needed to handle your request or as the law requires.",
    },
    {
      h: "6. Children’s privacy",
      p: `${SITE.name} is general-audience entertainment and is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has given us personal data, email ${SITE.contactEmail} and we will delete it promptly.`,
    },
    {
      h: "7. Your rights and choices",
      p: "Depending on where you live (including the EU, UK and California), you may have rights to access, correct or delete data, limit processing, or opt out of targeted ads. You can remove local progress by clearing this site’s data in the browser or deleting the app.\n\nTo exercise rights, email us with your request and a contact method. We may need to verify you and will reply within a reasonable time as required by law.",
    },
    {
      h: "8. Changes",
      p: "We may update this policy. The date at the top of this page will change. We will try to flag material changes in the game. Continued use means you accept the updated policy.",
    },
    {
      h: "9. Contact us",
      p: `Questions about this policy or your data: ${SITE.contactEmail}\nGame: ${SITE.name}`,
    },
  ],
};

const terms: Record<Lang, LegalSection[]> = {
  "zh-HK": [
    {
      h: "接受條款",
      p: `最後更新：${SITE.updated}\n\n使用 ${SITE.name}（包括網站與日後的 iOS／Android App）即表示你同意本使用條款與私隱政策。若不同意，請停止使用。`,
    },
    {
      h: "1. 授權範圍",
      p: "我們授予你個人、非獨家、不可轉讓、可撤回的授權，僅供你自己娛樂遊玩。你不得複製、改作、轉售、出租遊戲，或進行逆向工程、作弊、外掛或干擾伺服器與廣告。",
    },
    {
      h: "2. 帳號與進度",
      p: "目前無需註冊即可遊玩。分數與進度保存在你的裝置。清除瀏覽器資料、換機或刪除 App 可能令進度消失。排行與分數僅供娛樂，我們可因維護或公平調整規則。",
    },
    {
      h: "3. 廣告與「看廣告繼續」",
      p: "遊戲可能顯示橫幅、插頁或獎勵廣告。看廣告以繼續一局是可選的，每局有次數上限。廣告內容由第三方提供，其準確性與連結由其負責。你不得以自動化方式略過、遮蔽或詐取廣告獎勵。",
    },
    {
      h: "4. 虛擬物品",
      p: "分數、連擊與本機進度沒有現金價值，不能兌換金錢，亦不能在玩家之間轉移。我們可因更新或錯誤修正調整或重設這些內容。",
    },
    {
      h: "5. 玩家行為",
      p: "你不得利用遊戲從事違法、騷擾、欺詐或侵害他人權利的行為，亦不得嘗試攻擊、超載或未經授權存取我們的系統。",
    },
    {
      h: "6. 知識產權",
      p: `${SITE.name} 的名稱、圖示、封面、音效、畫面與程式屬營運方或授權方所有。除本條款允許的遊玩外，未授權使用均被禁止。`,
    },
    {
      h: "7. 現況提供",
      p: "遊戲按「現況」與「現有」基礎提供。我們會盡力維持穩定，但不保證不中斷、無錯誤或適合特定用途。裝置相容性、網路與第三方廣告均可能影響體驗。",
    },
    {
      h: "8. 責任限制",
      p: "在法律允許的最大範圍內，我們不對間接、附帶、特殊或衍生損失負責，包括資料或進度遺失。若仍須承擔責任，總額以你就本遊戲實際支付的費用為限（免費遊玩則為零）。",
    },
    {
      h: "9. 變更與終止",
      p: "我們可更新遊戲或本條款，並在本頁顯示新日期。我們亦可暫停或停止提供遊戲。繼續使用即接受變更。",
    },
    {
      h: "10. 聯絡",
      p: `有關條款的問題：${SITE.contactEmail}`,
    },
  ],
  "zh-CN": [
    {
      h: "接受条款",
      p: `最后更新：${SITE.updated}\n\n使用 ${SITE.name}（包括网站与日后的 iOS／Android App）即表示你同意本使用条款与隐私政策。若不同意，请停止使用。`,
    },
    {
      h: "1. 授权范围",
      p: "我们授予你个人、非独家、不可转让、可撤回的授权，仅供你自己娱乐游玩。你不得复制、改作、转售、出租游戏，或进行逆向工程、作弊、外挂或干扰服务器与广告。",
    },
    {
      h: "2. 账号与进度",
      p: "目前无需注册即可游玩。分数与进度保存在你的装置。清除浏览器数据、换机或删除 App 可能令进度消失。排行与分数仅供娱乐，我们可因维护或公平调整规则。",
    },
    {
      h: "3. 广告与「看广告继续」",
      p: "游戏可能显示横幅、插页或奖励广告。看广告以继续一局是可选的，每局有次数上限。广告内容由第三方提供，其准确性与链接由其负责。你不得以自动化方式跳过、遮蔽或诈取广告奖励。",
    },
    {
      h: "4. 虚拟物品",
      p: "分数、连击与本地进度没有现金价值，不能兑换金钱，也不能在玩家之间转移。我们可因更新或错误修正调整或重设这些内容。",
    },
    {
      h: "5. 玩家行为",
      p: "你不得利用游戏从事违法、骚扰、欺诈或侵害他人权利的行为，亦不得尝试攻击、过载或未经授权访问我们的系统。",
    },
    {
      h: "6. 知识产权",
      p: `${SITE.name} 的名称、图标、封面、音效、画面与程序属运营方或授权方所有。除本条款允许的游玩外，未授权使用均被禁止。`,
    },
    {
      h: "7. 现状提供",
      p: "游戏按「现状」与「现有」基础提供。我们会尽力维持稳定，但不保证不中断、无错误或适合特定用途。装置兼容性、网络与第三方广告均可能影响体验。",
    },
    {
      h: "8. 责任限制",
      p: "在法律允许的最大范围内，我们不对间接、附带、特殊或衍生损失负责，包括数据或进度丢失。若仍须承担责任，总额以你就本游戏实际支付的费用为限（免费游玩则为零）。",
    },
    {
      h: "9. 变更与终止",
      p: "我们可更新游戏或本条款，并在本页显示新日期。我们亦可暂停或停止提供游戏。继续使用即接受变更。",
    },
    {
      h: "10. 联络",
      p: `有关条款的问题：${SITE.contactEmail}`,
    },
  ],
  en: [
    {
      h: "Acceptance",
      p: `Last updated: ${SITE.updated}\n\nBy using ${SITE.name} (the website and any future iOS / Android app) you agree to these Terms and the Privacy Policy. If you do not agree, please stop using the game.`,
    },
    {
      h: "1. Licence",
      p: "We grant you a personal, non-exclusive, non-transferable, revocable licence to play for your own entertainment. You may not copy, adapt, sell or rent the game, reverse-engineer it, cheat, use unofficial tools, or interfere with servers or ads.",
    },
    {
      h: "2. Accounts and progress",
      p: "No account is required. Scores and progress live on your device. Clearing site data, switching devices or deleting the app may wipe progress. Scores are for fun; we may adjust rules for maintenance or fairness.",
    },
    {
      h: "3. Ads and continue",
      p: "The game may show banner, interstitial or rewarded ads. Watching an ad to continue a run is optional and capped per game. Third parties supply ad content and are responsible for it. You may not automate skipping, hiding or farming ad rewards.",
    },
    {
      h: "4. Virtual items",
      p: "Scores, combos and local progress have no cash value, cannot be redeemed for money and cannot be traded. We may change or reset them after updates or bug fixes.",
    },
    {
      h: "5. Conduct",
      p: "Do not use the game for anything unlawful, harassing or fraudulent, or to attack, overload or access our systems without permission.",
    },
    {
      h: "6. Intellectual property",
      p: `The ${SITE.name} name, icons, cover art, audio, screens and code belong to the operator or its licensors. Playing as allowed here does not give you any other rights.`,
    },
    {
      h: "7. As-is",
      p: "The game is provided as-is and as-available. We work to keep it stable but do not warrant that it will be uninterrupted, error-free or fit for a particular purpose. Device support, networks and third-party ads can affect play.",
    },
    {
      h: "8. Liability",
      p: "To the fullest extent allowed by law we are not liable for indirect, incidental, special or consequential loss, including lost data or progress. If liability still applies, it is limited to the amount you paid us for the game (zero if you play for free).",
    },
    {
      h: "9. Changes and termination",
      p: "We may update the game or these terms and will change the date on this page. We may also suspend or stop the service. Keep playing and you accept the changes.",
    },
    {
      h: "10. Contact",
      p: `Questions about these terms: ${SITE.contactEmail}`,
    },
  ],
};

export function legalSections(kind: "privacy" | "terms", lang: Lang): LegalSection[] {
  return (kind === "privacy" ? privacy : terms)[lang];
}

export const contactCopy: Record<
  Lang,
  { intro: string; topics: { title: string; body: string }[]; footer: string }
> = {
  "zh-HK": {
    intro: `需要協助、合作或行使私隱權利，都請寫信到下面的電郵。我們會盡力在數個工作天內回覆。`,
    topics: [
      {
        title: "遊戲支援",
        body: "無法開始、存檔不見、畫面異常或廣告無法關閉時，請附上手機型號、系統（iOS／Android／瀏覽器）與截圖。",
      },
      {
        title: "私隱請求",
        body: "查閱、更正或刪除資料，請在主旨寫上「私隱請求」，並說明你希望我們做什麼。",
      },
      {
        title: "廣告與合作",
        body: "媒體、品牌或廣告合作請註明公司名稱與用途。",
      },
    ],
    footer: `${SITE.name}　支援電郵`,
  },
  "zh-CN": {
    intro: `需要协助、合作或行使隐私权利，都请写信到下面的电邮。我们会尽力在数个工作天内回复。`,
    topics: [
      {
        title: "游戏支持",
        body: "无法开始、存档不见、画面异常或广告无法关闭时，请附上手机型号、系统（iOS／Android／浏览器）与截图。",
      },
      {
        title: "隐私请求",
        body: "查阅、更正或删除资料，请在主旨写上「隐私请求」，并说明你希望我们做什么。",
      },
      {
        title: "广告与合作",
        body: "媒体、品牌或广告合作请注明公司名称与用途。",
      },
    ],
    footer: `${SITE.name}　支持电邮`,
  },
  en: {
    intro: `For help, partnerships or privacy requests, email us below. We aim to reply within a few working days.`,
    topics: [
      {
        title: "Game support",
        body: "If the game will not start, progress vanished, the screen looks wrong or an ad will not close, include your device, system (iOS / Android / browser) and a screenshot.",
      },
      {
        title: "Privacy requests",
        body: "To access, correct or delete data, put “Privacy request” in the subject and tell us what you need.",
      },
      {
        title: "Ads and partnerships",
        body: "Press, brand or advertising enquiries should include your organisation and purpose.",
      },
    ],
    footer: `${SITE.name}  ·  support email`,
  },
};
