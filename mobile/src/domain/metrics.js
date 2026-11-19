export const DEFAULT_LIMITS = { max_videos: "19", max_comment_videos: "2", max_following: "20", max_followers: "20" };
export const POPULAR_PROFILES = [
  { name: "khaby.lame", cat: "162M" },
  { name: "mrbeast", cat: "104M" },
  { name: "_iamnot_leo_", cat: "341K" }
];

export function extractHashtags(data) {
  if (!data) return [];
  const counts = {};
  const scan = (text) => {
    if (!text) return;
    const matches = text.match(/#[\w\u00f1\u00d1_]+/gi);
    if (matches) matches.forEach((t) => { const clean = t.toLowerCase(); counts[clean] = (counts[clean] || 0) + 1; });
  };
  scan(data.profile?.bio);
  (data.videos || []).forEach((v) => scan(v.desc));
  (data.comments || []).forEach((c) => scan(c.text));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}

export function calculatePublicationFrequency(videos = []) {
  const count = videos.length;
  if (count >= 15) return { label: "Alta", color: "#34d399", desc: "Gran volumen reciente" };
  if (count >= 6) return { label: "Moderada", color: "#38bdf8", desc: "Ritmo constante" };
  if (count > 0) return { label: "Pausada", color: "#fbbf24", desc: "Poca actividad detectada" };
  return { label: "Sin Datos", color: "#64748b", desc: "Muestra insuficiente" };
}
