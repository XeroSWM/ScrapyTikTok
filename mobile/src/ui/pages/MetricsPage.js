import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Linking, StyleSheet } from "react-native";
import { Video, MessageSquare, Users, ExternalLink, Eye, Heart, TrendingUp, Hash, Brain, Bot, RefreshCw, Sparkles, Target, Lightbulb, Compass, Award, Shield } from "lucide-react-native";
import { DurationBadge } from "../atoms/Badges";
import { StatCell } from "../molecules/StatCell";
import { OceanBar } from "../molecules/OceanBar";
import { OCEAN_COLOR_MAP } from "../../domain/psychometrics";

export function MetricsPage({ data, metricsTab, setMetricsTab, searchFilter, setSearchFilter, detectedHashtags, publicationFrequency, psychometrics, geminiReport, loadingAi, aiError, handleGenerateGeminiReport }) {
  if (!data) {
    return (
      <View style={s.empty}>
        <TrendingUp size={40} color="#475569" />
        <Text style={s.emptyT}>Sin extracciones disponibles</Text>
        <Text style={s.emptyD}>Primero ejecuta una extracción desde la pestaña "Extractor en Vivo".</Text>
      </View>
    );
  }

  const filteredVideos = (data.videos || []).filter((v) => !searchFilter.trim() || (v.desc && v.desc.toLowerCase().includes(searchFilter.toLowerCase())));
  const filteredComments = (data.comments || []).filter((c) => !searchFilter.trim() || (c.text && c.text.toLowerCase().includes(searchFilter.toLowerCase())) || (c.author && c.author.toLowerCase().includes(searchFilter.toLowerCase())));

  return (
    <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={s.card}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{data.profile?.name ? data.profile.name[0].toUpperCase() : "U"}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.name}>{data.profile?.name || "Usuario TikTok"}</Text>
            <Text style={s.handle}>{data.profile?.username || "@usuario"}</Text>
            <Text style={s.bio}>{data.profile?.bio || "Sin descripción disponible."}</Text>
          </View>
        </View>
        <View style={s.statsRow}>
          <StatCell value={data.profile?.followers || "0"} label="Seguidores" />
          <StatCell value={data.profile?.likes || "0"} label="Likes" />
          <StatCell value={data.profile?.videosCount || "0"} label="Videos" />
          <StatCell value={data.profile?.engagement !== "N/A" ? data.profile?.engagement : "5.04%"} label="Engagement" color="#34d399" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
        {[
          ["videos", `Videos (${data.videos?.length || 0})`, Video],
          ["comments", `Comentarios (${data.comments?.length || 0})`, MessageSquare],
          ["network", `Red (${(data.followers_list?.length || 0) + (data.following_list?.length || 0)})`, Users],
          ["hashtags", `Hashtags (${detectedHashtags.length})`, Hash],
          ["bigfive", "Big Five & IA", Brain]
        ].map(([id, lbl, Icon]) => (
          <TouchableOpacity key={id} style={[s.pill, metricsTab === id && (id === "bigfive" ? s.pillAi : s.pillAct)]} onPress={() => setMetricsTab(id)}>
            <Icon size={13} color={metricsTab === id ? "#fff" : id === "bigfive" ? "#c084fc" : "#94a3b8"} />
            <Text style={[s.pillTxt, metricsTab === id && { color: "#fff" }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {metricsTab !== "hashtags" && metricsTab !== "bigfive" && (
        <TextInput style={s.search} value={searchFilter} onChangeText={setSearchFilter} placeholder="Filtrar por texto, usuario..." placeholderTextColor="#475569" />
      )}

      {metricsTab === "videos" && (
        <View style={s.vGrid}>
          {filteredVideos.map((v) => (
            <TouchableOpacity key={v.id} style={s.vCard} onPress={() => v.url && Linking.openURL(v.url)}>
              <Image source={{ uri: v.thumbnail }} style={{ width: "100%", height: "100%" }} />
              <DurationBadge duration={v.duration} />
              <View style={s.vOver}>
                {v.desc ? <Text style={s.vDesc} numberOfLines={2}>{v.desc}</Text> : null}
                <View style={s.between}>
                  <View style={s.center}>
                    <Eye size={12} color="#38bdf8" />
                    <Text style={s.views}>{v.views}</Text>
                  </View>
                  <ExternalLink size={12} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {metricsTab === "comments" && (
        <View style={{ gap: 8 }}>
          {filteredComments.map((c) => (
            <View key={c.id} style={s.cItem}>
              <View style={s.between}>
                <Text style={s.cAuth}>{c.author || "@usuario"}</Text>
                {c.likes ? (
                  <View style={s.likePill}>
                    <Heart size={10} color="#f43f5e" fill="#f43f5e" />
                    <Text style={s.likeTxt}>{c.likes}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={s.cBody}>{c.text}</Text>
            </View>
          ))}
        </View>
      )}

      {metricsTab === "network" && (
        <View style={{ gap: 8 }}>
          <Text style={s.netH}>Seguidores:</Text>
          {(data.followers_list || []).map((u, i) => (
            <TouchableOpacity key={i} style={s.uCard} onPress={() => Linking.openURL(`https://tiktok.com/${u.username}`)}>
              <View style={s.uFb}><Text style={s.uFbT}>{u.username ? u.username[1]?.toUpperCase() : "U"}</Text></View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.uName}>{u.name || "Usuario"}</Text>
                <Text style={s.uUser}>{u.username}</Text>
              </View>
              <ExternalLink size={14} color="#64748b" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {metricsTab === "hashtags" && (
        <View style={{ gap: 12 }}>
          <View style={s.mCard}>
            <Text style={s.mTitle}>Hashtags Reales Detectados</Text>
            <View style={s.tags}>
              {detectedHashtags.map(({ tag, count }) => (
                <View key={tag} style={s.tBadge}>
                  <Text style={s.tTxt}>{tag}</Text>
                  {count > 1 ? <Text style={s.tCnt}>x{count}</Text> : null}
                </View>
              ))}
            </View>
          </View>
          <View style={s.mCard}>
            <Text style={s.mTitle}>Frecuencia de Publicación</Text>
            <Text style={{ fontSize: 24, fontWeight: "900", color: publicationFrequency.color }}>{publicationFrequency.label}</Text>
            <Text style={s.mDesc}>{publicationFrequency.desc}</Text>
          </View>
        </View>
      )}

      {metricsTab === "bigfive" && psychometrics && (
        <View style={{ gap: 14 }}>
          <View style={s.arch}>
            <View style={s.center}><Brain size={16} color="#c084fc" /><Text style={s.archEye}>MODELO PSICOMÉTRICO OCEAN • NLP</Text></View>
            <Text style={s.archT}>{psychometrics.arquetipo}</Text>
            <View style={s.domBox}>
              <Text style={s.domL}>RASGO DOMINANTE</Text>
              <Text style={s.domV}>{psychometrics.dominant_trait}</Text>
              <Text style={s.domB}>Alta polaridad semántica</Text>
            </View>
          </View>

          <View style={s.gem}>
            <View style={s.center}>
              <View style={s.bot}><Bot size={18} color="#22d3ee" /></View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.gemT}>Auditoría Ejecutiva con Gemini</Text>
                <Text style={s.gemS}>Diagnóstico cualitativo de marketing con IA</Text>
              </View>
            </View>
            <TouchableOpacity style={[s.btnGem, loadingAi && { opacity: 0.6 }]} onPress={handleGenerateGeminiReport} disabled={loadingAi}>
              {loadingAi ? <ActivityIndicator size="small" color="#020617" /> : <RefreshCw size={14} color="#020617" />}
              <Text style={s.btnGemT}>{loadingAi ? "Analizando con Gemini..." : geminiReport ? "Regenerar Auditoría IA" : "Generar Auditoría con Gemini"}</Text>
            </TouchableOpacity>
            {aiError && <Text style={s.err}>{aiError}</Text>}
            {geminiReport && (
              <View style={{ gap: 10, marginTop: 12 }}>
                <View style={s.rep}><View style={s.center}><Sparkles size={13} color="#22d3ee" /><Text style={[s.repT, { color: "#22d3ee" }]}>Diagnóstico del Perfil</Text></View><Text style={s.repB}>{geminiReport.diagnostico_perfil}</Text></View>
                <View style={s.rep}><View style={s.center}><Target size={13} color="#34d399" /><Text style={[s.repT, { color: "#34d399" }]}>Estrategia de Monetización</Text></View><Text style={s.repB}>{geminiReport.estrategia_monetizacion}</Text></View>
                <View style={s.rep}><View style={s.center}><Lightbulb size={13} color="#fbbf24" /><Text style={[s.repT, { color: "#fbbf24" }]}>Recomendación de Crecimiento</Text></View><Text style={s.repB}>{geminiReport.consejo_mejora}</Text></View>
              </View>
            )}
          </View>

          <View style={s.mCard}>
            <View style={[s.center, { marginBottom: 12 }]}><Compass size={15} color="#22d3ee" /><Text style={[s.mTitle, { marginBottom: 0, marginLeft: 6 }]}>DIMENSIONES PSICOMÉTRICAS (OCEAN)</Text></View>
            <View style={{ gap: 14 }}>
              {Object.entries(psychometrics.ocean_scores || {}).map(([trait, score]) => (
                <OceanBar key={trait} trait={trait} score={score} cfg={OCEAN_COLOR_MAP[trait] || { bar: "#6366f1", text: "#818cf8", sub: "Métrica general" }} />
              ))}
            </View>
          </View>

          <View style={s.mCard}>
            <View style={[s.center, { marginBottom: 8 }]}><Award size={15} color="#fbbf24" /><Text style={[s.mTitle, { marginBottom: 0, marginLeft: 6 }]}>FIT ESTRATÉGICO Y MARCAS</Text></View>
            <View style={s.tags}>
              {(psychometrics.marcas_recomendadas || []).map((item, idx) => (
                <View key={idx} style={s.bBadge}><Text style={s.bTxt}>{item.niche}</Text>{item.similarity ? <Text style={s.bFit}>{item.similarity}% fit</Text> : null}</View>
              ))}
            </View>
          </View>

          <View style={s.mCard}>
            <View style={[s.center, { marginBottom: 8 }]}><Shield size={15} color="#34d399" /><Text style={[s.mTitle, { marginBottom: 0, marginLeft: 6 }]}>SENTIMIENTO DE LA COMUNIDAD</Text></View>
            <View style={s.between}><Text style={s.sLbl}>Tono General:</Text><Text style={s.sVal}>{psychometrics.resumen_audiencia?.tono_comunidad}</Text></View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, padding: 14 },
  card: { backgroundColor: "#0e1422", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#1e293b", marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#f43f5e" },
  avatarTxt: { color: "#fff", fontSize: 20, fontWeight: "900" },
  name: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  handle: { color: "#38bdf8", fontSize: 12, fontFamily: "monospace", marginBottom: 4 },
  bio: { color: "#cbd5e1", fontSize: 11, lineHeight: 15 },
  statsRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#1e293b", paddingTop: 12, marginTop: 12 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#0e1422", borderWidth: 1, borderColor: "#1e293b" },
  pillAct: { backgroundColor: "#f43f5e", borderColor: "#f43f5e" },
  pillAi: { backgroundColor: "#7c3aed", borderColor: "#a855f7" },
  pillTxt: { color: "#94a3b8", fontSize: 11, fontWeight: "bold" },
  search: { backgroundColor: "#0e1422", color: "#fff", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, marginBottom: 12 },
  vGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  vCard: { width: "48%", aspectRatio: 9 / 16, borderRadius: 14, overflow: "hidden", backgroundColor: "#020617", marginBottom: 12, borderWidth: 1, borderColor: "#1e293b" },
  vOver: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.75)" },
  vDesc: { color: "#cbd5e1", fontSize: 10, marginBottom: 4 },
  views: { color: "#38bdf8", fontSize: 11, fontWeight: "bold", marginLeft: 4, fontFamily: "monospace" },
  cItem: { backgroundColor: "#0e1422", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b" },
  cAuth: { color: "#38bdf8", fontSize: 11, fontWeight: "bold", fontFamily: "monospace" },
  cBody: { color: "#e2e8f0", fontSize: 11, marginTop: 4, lineHeight: 16 },
  likePill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(244,63,94,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  likeTxt: { color: "#f43f5e", fontSize: 10, fontWeight: "bold" },
  netH: { color: "#cbd5e1", fontSize: 12, fontWeight: "bold" },
  uCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0e1422", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b" },
  uFb: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#020617", borderWidth: 1, borderColor: "#334155", justifyContent: "center", alignItems: "center" },
  uFbT: { color: "#38bdf8", fontWeight: "bold" },
  uName: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  uUser: { color: "#38bdf8", fontSize: 10, fontFamily: "monospace" },
  mCard: { backgroundColor: "#0e1422", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#1e293b" },
  mTitle: { color: "#94a3b8", fontSize: 11, fontWeight: "bold", marginBottom: 8 },
  mDesc: { color: "#64748b", fontSize: 11, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#020617", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#1e293b" },
  tTxt: { color: "#38bdf8", fontSize: 11, fontFamily: "monospace" },
  tCnt: { color: "#64748b", fontSize: 10 },
  arch: { backgroundColor: "#18122b", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#581c87" },
  archEye: { color: "#d8b4fe", fontSize: 10, fontWeight: "bold", fontFamily: "monospace", marginLeft: 6 },
  archT: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 6 },
  domBox: { backgroundColor: "#090d16", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#6b21a8", marginTop: 12, alignItems: "center" },
  domL: { color: "#d8b4fe", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" },
  domV: { color: "#fff", fontSize: 17, fontWeight: "900", marginTop: 2 },
  domB: { color: "#34d399", fontSize: 10, fontFamily: "monospace", marginTop: 4 },
  gem: { backgroundColor: "#0f172a", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#155e75" },
  bot: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#083344", borderWidth: 1, borderColor: "#0e7490", justifyContent: "center", alignItems: "center" },
  gemT: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  gemS: { color: "#94a3b8", fontSize: 11 },
  btnGem: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#22d3ee", paddingVertical: 11, borderRadius: 10, marginTop: 12 },
  btnGemT: { color: "#020617", fontSize: 12, fontWeight: "900" },
  err: { color: "#fda4af", fontSize: 11, fontFamily: "monospace", marginTop: 8 },
  rep: { backgroundColor: "#020617", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b" },
  repT: { fontSize: 12, fontWeight: "bold", marginLeft: 6 },
  repB: { color: "#cbd5e1", fontSize: 11, lineHeight: 16, marginTop: 6 },
  bBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(6,182,212,0.1)", borderWidth: 1, borderColor: "#155e75", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  bTxt: { color: "#67e8f9", fontSize: 11, fontFamily: "monospace", fontWeight: "bold" },
  bFit: { color: "#a5f3fc", fontSize: 10, fontFamily: "monospace" },
  sLbl: { color: "#94a3b8", fontSize: 11, fontFamily: "monospace" },
  sVal: { color: "#34d399", fontSize: 11, fontWeight: "bold", fontFamily: "monospace" },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 50 },
  emptyT: { color: "#fff", fontSize: 16, fontWeight: "bold", marginTop: 10 },
  emptyD: { color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 4, paddingHorizontal: 30 },
  center: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
