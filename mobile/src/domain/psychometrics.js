export const OCEAN_COLOR_MAP = {
  Apertura: { bar: "#06b6d4", text: "#22d3ee", sub: "Creatividad vs Convencionalismo" },
  Responsabilidad: { bar: "#10b981", text: "#34d399", sub: "Disciplina vs Espontaneidad" },
  Extraversión: { bar: "#f43f5e", text: "#fb7185", sub: "Sociabilidad vs Introspección" },
  Amabilidad: { bar: "#a855f7", text: "#c084fc", sub: "Empatía vs Competitividad" },
  "Estabilidad Emocional": { bar: "#f59e0b", text: "#fbbf24", sub: "Resiliencia vs Volatilidad" }
};

export function evaluateOceanPsychometrics(data) {
  if (!data) return null;
  const { profile, videos = [], comments = [] } = data;
  if (data.psychometrics?.ocean_scores) {
    return {
      ocean_scores: data.psychometrics.ocean_scores,
      dominant_trait: data.psychometrics.dominant_trait || "Apertura",
      arquetipo: data.psychometrics.arquetipo || "El Visionario Creativo",
      marcas_recomendadas: data.psychometrics.marcas_recomendadas || [],
      resumen_audiencia: {
        comentarios_evaluados: data.psychometrics.resumen_audiencia?.comentarios_evaluados ?? comments.length,
        tono_comunidad: data.psychometrics.resumen_audiencia?.tono_comunidad || "Colaborativo y Cercano"
      }
    };
  }
  const textCorpus = [profile?.bio || "", ...videos.map((v) => v?.desc || ""), ...comments.map((c) => c?.text || "")].join(" ").toLowerCase();
  const scoreForWords = (words, base = 50) => {
    let matches = 0;
    words.forEach((w) => { if (textCorpus.includes(w)) matches++; });
    return Math.min(95, Math.max(25, base + matches * 7));
  };
  const scores = {
    Apertura: scoreForWords(["crear", "idea", "aprender", "arte", "nuevo", "diseño", "innovar", "tech", "musica", "viaje"], 66),
    Responsabilidad: scoreForWords(["rutina", "constancia", "meta", "trabajo", "proceso", "orden", "resultado", "tutorial"], 58),
    Extraversión: scoreForWords(["hola", "amigos", "comunidad", "sigueme", "fiesta", "gente", "reto", "viral", "top"], 72),
    Amabilidad: scoreForWords(["gracias", "apoyo", "amor", "feliz", "familia", "ayuda", "favorito", "lindo"], 64),
    "Estabilidad Emocional": scoreForWords(["tranquilo", "calma", "solución", "equilibrio", "paz"], 70)
  };
  const dominantTrait = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const archetypes = {
    Apertura: "El Visionario Creativo (Innovación y Nuevas Ideas)",
    Extraversión: "El Conector Social (Dinamismo y Entretenimiento)",
    Responsabilidad: "El Experto Metódico (Educación y Disciplina)",
    Amabilidad: "El Constructor de Comunidad (Empatía y Cercanía)",
    "Estabilidad Emocional": "El Analista Resiliente (Control y Seguridad)"
  };
  return {
    ocean_scores: scores,
    dominant_trait: dominantTrait,
    arquetipo: archetypes[dominantTrait] || "El Creador Multidisciplinario",
    marcas_recomendadas: [
      { niche: "Tecnología y Software", similarity: 78.5 },
      { niche: "Educación y Ciencia", similarity: 65.2 },
      { niche: "Entretenimiento Digital", similarity: 54.0 },
      { niche: "Gaming y Esports", similarity: 48.0 }
    ],
    resumen_audiencia: {
      comentarios_evaluados: comments.length,
      tono_comunidad: scores["Amabilidad"] >= 60 ? "Colaborativo y Respetuoso" : "Crítico y Exigente"
    }
  };
}
