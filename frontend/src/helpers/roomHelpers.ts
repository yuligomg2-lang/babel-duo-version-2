export const getFlag = (langCode: string) => {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    zh: "🇨🇳",
    ja: "🇯🇵",
    ko: "🇰🇷",
  };
  return flags[langCode] || "🏳️";
};

const COLOR_MAP = {
  rose: { hex: "#f43f5e", bg: "bg-rose-500" },
  emerald: { hex: "#10b981", bg: "bg-emerald-500" },
  sky: { hex: "#0ea5e9", bg: "bg-sky-500" },
  amber: { hex: "#f59e0b", bg: "bg-amber-500" },
  violet: { hex: "#8b5cf6", bg: "bg-violet-500" },
};

export const getUserColor = (userId: string) => {
  const keys = Object.keys(COLOR_MAP);
  let hash = 0;
  for (let i = 0; i < userId.length; i++)
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  const key = keys[Math.abs(hash) % keys.length] as keyof typeof COLOR_MAP;
  return COLOR_MAP[key];
};
