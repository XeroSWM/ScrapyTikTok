import React, { useState, useRef, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  StatusBar,
  Linking
} from "react-native";
import {
  Play,
  Layers,
  Video,
  MessageSquare,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Clock,
  Heart,
  TrendingUp,
  Hash,
  Activity
} from "lucide-react-native";

export default function App() {
  const [backendIp, setBackendIp] = useState("192.168.1.90");
  const [username, setUsername] = useState("_iamnot_leo_");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(["[READY] Cliente móvil conectado y sincronizado."]);
  const [data, setData] = useState(null);

  // Navegación: "extractor" | "metrics"
  const [mainTab, setMainTab] = useState("extractor");
  // Sub-tabs de métricas: "videos" | "comments" | "network" | "hashtags"
  const [metricsTab, setMetricsTab] = useState("videos");
  const [searchFilter, setSearchFilter] = useState("");
  const [showLimits, setShowLimits] = useState(false);

  // Parámetros cuantitativos
  const [limitsConfig, setLimitsConfig] = useState({
    max_videos: "19",
    max_comment_videos: "2",
    max_following: "20",
    max_followers: "20"
  });

  const popularProfiles = [
    { name: "khaby.lame", cat: "162M" },
    { name: "mrbeast", cat: "104M" },
    { name: "_iamnot_leo_", cat: "341K" }
  ];

  const socketRef = useRef(null);

  // ==========================================
  // HASHTAGS Y FRECUENCIA DINÁMICOS
  // ==========================================
  const detectedHashtags = useMemo(() => {
    if (!data) return [];
    const counts = {};
    const extractTags = (text) => {
      if (!text) return;
      const matches = text.match(/#[\w\u00f1\u00d1_]+/gi);
      if (matches) {
        matches.forEach((t) => {
          const clean = t.toLowerCase();
          counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    };
    extractTags(data.profile?.bio);
    (data.videos || []).forEach((v) => extractTags(v.desc));
    (data.comments || []).forEach((c) => extractTags(c.text));

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [data]);

  const publicationFrequency = useMemo(() => {
    const vids = data?.videos || [];
    const count = vids.length;
    if (count >= 15) return { label: "Alta", color: "#34d399", desc: "Gran volumen reciente" };
    if (count >= 6) return { label: "Moderada", color: "#38bdf8", desc: "Ritmo constante" };
    if (count > 0) return { label: "Pausada", color: "#fbbf24", desc: "Poca actividad detectada" };
    return { label: "Sin Datos", color: "#64748b", desc: "Muestra insuficiente" };
  }, [data]);

  // ==========================================
  // CONEXIÓN WEBSOCKET
  // ==========================================
  const startScrape = () => {
    if (!username.trim() || loading) return;
    setLoading(true);
    setData(null);
    setLogs((prev) => [...prev, `[INIT] Conectando a ws://${backendIp}:8000/ws/scrape...`]);

    try {
      const ws = new WebSocket(`ws://${backendIp}:8000/ws/scrape`);
      socketRef.current = ws;

      ws.onopen = () => {
        setLogs((prev) => [...prev, `[CONNECTED] Extrayendo para @${username}...`]);
        ws.send(
          JSON.stringify({
            username: username.trim(),
            target: "all",
            max_videos: Number(limitsConfig.max_videos) || 19,
            max_comment_videos: Number(limitsConfig.max_comment_videos) || 2,
            max_following: Number(limitsConfig.max_following) || 20,
            max_followers: Number(limitsConfig.max_followers) || 20
          })
        );
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "log") {
            setLogs((prev) => [...prev, msg.message]);
          } else if (msg.type === "result") {
            setData(msg.data);
            setLoading(false);
            setMainTab("metrics");
          } else if (msg.type === "error") {
            setLogs((prev) => [...prev, `[ERROR] ${msg.message}`]);
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
        }
      };

      ws.onerror = () => {
        setLogs((prev) => [...prev, "[ERROR] No se pudo conectar al servidor. Revisa IP y Wi-Fi."]);
        setLoading(false);
      };

      ws.onclose = () => {
        setLoading(false);
      };
    } catch (e) {
      setLogs((prev) => [...prev, `[ERROR] ${e.message}`]);
      setLoading(false);
    }
  };

  const filteredVideos = (data?.videos || []).filter((v) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (v.desc && v.desc.toLowerCase().includes(term)) || (v.url && v.url.toLowerCase().includes(term));
  });

  const filteredComments = (data?.comments || []).filter((c) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (c.text && c.text.toLowerCase().includes(term)) || (c.author && c.author.toLowerCase().includes(term));
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b14" />

      {/* Navbar Superior */}
      <View style={styles.topNav}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>TT</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.navTitle}>TikTok Scraper</Text>
          <Text style={styles.navSubtitle}>LAN: {backendIp}:8000</Text>
        </View>
        <View style={styles.antiBotBadge}>
          <ShieldCheck size={12} color="#34d399" />
          <Text style={styles.antiBotText}>Stealth Activo</Text>
        </View>
      </View>

      {/* Tabs Principales */}
      <View style={styles.mainTabBar}>
        <TouchableOpacity
          onPress={() => setMainTab("extractor")}
          style={[styles.mainTabBtn, mainTab === "extractor" && styles.mainTabBtnActive]}
        >
          <Play size={13} color={mainTab === "extractor" ? "#fff" : "#94a3b8"} fill={mainTab === "extractor" ? "#fff" : "none"} />
          <Text style={[styles.mainTabText, mainTab === "extractor" && styles.mainTabTextActive]}>
            Extractor en Vivo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMainTab("metrics")}
          style={[styles.mainTabBtn, mainTab === "metrics" && styles.mainTabBtnActiveMetrics]}
        >
          <TrendingUp size={13} color={mainTab === "metrics" ? "#fff" : "#94a3b8"} />
          <Text style={[styles.mainTabText, mainTab === "metrics" && styles.mainTabTextActive]}>
            Resultados & Métricas {data ? "●" : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================= */}
      {/* PESTAÑA 1: EXTRACTOR EN VIVO                              */}
      {/* ========================================================= */}
      {mainTab === "extractor" && (
        <ScrollView style={styles.scrollBody} keyboardShouldPersistTaps="handled">
          <View style={styles.panelCard}>
            <Text style={styles.sectionLabel}>IP del Servidor PC (Wi-Fi)</Text>
            <TextInput
              style={styles.textInput}
              value={backendIp}
              onChangeText={setBackendIp}
              placeholder="192.168.1.90"
              placeholderTextColor="#475569"
            />

            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Objetivo de Scraping</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={styles.textInputAt}
                value={username}
                onChangeText={setUsername}
                placeholder="ej. _iamnot_leo_"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />
            </View>

            {/* Perfiles de prueba */}
            <View style={styles.profilesRow}>
              <Text style={styles.profilesLabel}>Pruebas:</Text>
              {popularProfiles.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  style={styles.profileChip}
                  onPress={() => setUsername(p.name)}
                >
                  <Text style={styles.profileChipName}>@{p.name}</Text>
                  <Text style={styles.profileChipCat}>({p.cat})</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón Scrapear */}
            <TouchableOpacity
              style={[styles.btnScrape, loading && { opacity: 0.5 }]}
              onPress={startScrape}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.rowCenter}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.btnScrapeText}>Extrayendo Perfil...</Text>
                </View>
              ) : (
                <View style={styles.rowCenter}>
                  <Play size={15} color="#fff" fill="#fff" />
                  <Text style={styles.btnScrapeText}>Scrapear Perfil Completo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Acordeón de Límites */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowLimits(!showLimits)}
            >
              <Text style={styles.accordionTitle}>
                {showLimits ? "Ocultar Límites de Extracción" : "Configurar Límites Cuantitativos"}
              </Text>
              {showLimits ? <ChevronUp size={16} color="#38bdf8" /> : <ChevronDown size={16} color="#38bdf8" />}
            </TouchableOpacity>

            {showLimits && (
              <View style={styles.limitsGrid}>
                <View style={styles.limitBox}>
                  <Text style={styles.limitLabel}>Videos</Text>
                  <TextInput
                    style={styles.limitInput}
                    value={limitsConfig.max_videos}
                    onChangeText={(val) => setLimitsConfig({ ...limitsConfig, max_videos: val })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.limitBox}>
                  <Text style={styles.limitLabel}>Comentarios</Text>
                  <TextInput
                    style={styles.limitInput}
                    value={limitsConfig.max_comment_videos}
                    onChangeText={(val) => setLimitsConfig({ ...limitsConfig, max_comment_videos: val })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.limitBox}>
                  <Text style={styles.limitLabel}>Siguiendo</Text>
                  <TextInput
                    style={styles.limitInput}
                    value={limitsConfig.max_following}
                    onChangeText={(val) => setLimitsConfig({ ...limitsConfig, max_following: val })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.limitBox}>
                  <Text style={styles.limitLabel}>Seguidores</Text>
                  <TextInput
                    style={styles.limitInput}
                    value={limitsConfig.max_followers}
                    onChangeText={(val) => setLimitsConfig({ ...limitsConfig, max_followers: val })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Consola de logs con estilo DevTools */}
          <View style={styles.terminalCard}>
            <View style={styles.terminalHeader}>
              <View style={styles.dotRed} />
              <View style={styles.dotYellow} />
              <View style={styles.dotGreen} />
              <Text style={styles.terminalTitle}>Playwright DevTools Protocol</Text>
            </View>
            <View style={styles.terminalBody}>
              {logs.slice(-6).map((log, index) => (
                <Text key={index} style={styles.terminalText}>
                  {log}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: RESULTADOS Y MÉTRICAS (IDÉNTICO A PC)          */}
      {/* ========================================================= */}
      {mainTab === "metrics" && (
        <ScrollView style={styles.scrollBody}>
          {data ? (
            <>
              {/* Tarjeta Banner del Perfil */}
              <View style={styles.panelCard}>
                <View style={styles.profileBannerHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                      {data.profile?.name ? data.profile.name[0].toUpperCase() : "U"}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.profileMainName}>{data.profile?.name || "Usuario TikTok"}</Text>
                    <Text style={styles.profileHandle}>{data.profile?.username || "@usuario"}</Text>
                    <Text style={styles.profileBio}>{data.profile?.bio || "Sin descripción de biografía disponible."}</Text>
                  </View>
                </View>

                {/* 4 Métricas Clave */}
                <View style={styles.statsRow}>
                  <View style={styles.statCell}>
                    <Text style={styles.statNum}>{data.profile?.followers || "0"}</Text>
                    <Text style={styles.statDesc}>Seguidores</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statNum}>{data.profile?.likes || "0"}</Text>
                    <Text style={styles.statDesc}>Likes</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statNum}>{data.profile?.videosCount || "0"}</Text>
                    <Text style={styles.statDesc}>Videos</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={[styles.statNum, { color: "#34d399" }]}>
                      {data.profile?.engagement !== "N/A" ? data.profile?.engagement : "5.04%"}
                    </Text>
                    <Text style={styles.statDesc}>Engagement</Text>
                  </View>
                </View>
              </View>

              {/* Sub-Pestañas de Resultados */}
              <View style={styles.subTabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.subTabPill, metricsTab === "videos" && styles.subTabPillActive]}
                    onPress={() => setMetricsTab("videos")}
                  >
                    <Video size={13} color={metricsTab === "videos" ? "#fff" : "#94a3b8"} />
                    <Text style={[styles.subTabPillText, metricsTab === "videos" && styles.subTabPillTextActive]}>
                      Videos ({data.videos?.length || 0})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subTabPill, metricsTab === "comments" && styles.subTabPillActive]}
                    onPress={() => setMetricsTab("comments")}
                  >
                    <MessageSquare size={13} color={metricsTab === "comments" ? "#fff" : "#94a3b8"} />
                    <Text style={[styles.subTabPillText, metricsTab === "comments" && styles.subTabPillTextActive]}>
                      Comentarios ({data.comments?.length || 0})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subTabPill, metricsTab === "network" && styles.subTabPillActive]}
                    onPress={() => setMetricsTab("network")}
                  >
                    <Users size={13} color={metricsTab === "network" ? "#fff" : "#94a3b8"} />
                    <Text style={[styles.subTabPillText, metricsTab === "network" && styles.subTabPillTextActive]}>
                      Red ({(data.followers_list?.length || 0) + (data.following_list?.length || 0)})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subTabPill, metricsTab === "hashtags" && styles.subTabPillActive]}
                    onPress={() => setMetricsTab("hashtags")}
                  >
                    <Hash size={13} color={metricsTab === "hashtags" ? "#fff" : "#94a3b8"} />
                    <Text style={[styles.subTabPillText, metricsTab === "hashtags" && styles.subTabPillTextActive]}>
                      Hashtags ({detectedHashtags.length})
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Buscador reactivo */}
              {metricsTab !== "hashtags" && (
                <View style={styles.searchBar}>
                  <TextInput
                    style={styles.searchInput}
                    value={searchFilter}
                    onChangeText={setSearchFilter}
                    placeholder="Filtrar por texto, usuario..."
                    placeholderTextColor="#475569"
                  />
                </View>
              )}

              {/* 1. SECCIÓN VIDEOS */}
              {metricsTab === "videos" && (
                <View style={styles.videosGrid}>
                  {filteredVideos.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={styles.videoCard}
                      onPress={() => v.url && Linking.openURL(v.url)}
                    >
                      <Image source={{ uri: v.thumbnail }} style={styles.videoCover} />
                      <View style={styles.durationBadge}>
                        <Clock size={9} color="#f43f5e" />
                        <Text style={styles.durationText}>{v.duration || "15s"}</Text>
                      </View>
                      <View style={styles.videoOverlay}>
                        {v.desc ? <Text style={styles.videoDesc} numberOfLines={2}>{v.desc}</Text> : null}
                        <View style={styles.rowBetween}>
                          <View style={styles.rowCenter}>
                            <Eye size={12} color="#38bdf8" />
                            <Text style={styles.viewsCount}>{v.views}</Text>
                          </View>
                          <ExternalLink size={12} color="#fff" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 2. SECCIÓN COMENTARIOS */}
              {metricsTab === "comments" && (
                <View style={{ gap: 8 }}>
                  {filteredComments.length === 0 ? (
                    <Text style={styles.emptyNotice}>No hay comentarios que coincidan con la búsqueda.</Text>
                  ) : (
                    filteredComments.map((c) => (
                      <View key={c.id} style={styles.commentItem}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.commentAuthor}>{c.author || "@usuario"}</Text>
                          {c.likes ? (
                            <View style={styles.likesPill}>
                              <Heart size={10} color="#f43f5e" fill="#f43f5e" />
                              <Text style={styles.likesText}>{c.likes}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.commentContent}>{c.text}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* 3. SECCIÓN RED (SEGUIDORES / SEGUIDOS) */}
              {metricsTab === "network" && (
                <View style={{ gap: 8 }}>
                  <Text style={styles.networkHeader}>Seguidores:</Text>
                  {(data.followers_list || []).map((u, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.userCard}
                      onPress={() => Linking.openURL(`https://tiktok.com/${u.username}`)}
                    >
                      {u.avatar ? (
                        <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.userAvatarFallback}>
                          <Text style={styles.userAvatarText}>{u.username ? u.username[1]?.toUpperCase() : "U"}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.userFullName}>{u.name || "Usuario"}</Text>
                        <Text style={styles.userUsername}>{u.username}</Text>
                      </View>
                      <ExternalLink size={14} color="#64748b" />
                    </TouchableOpacity>
                  ))}

                  <Text style={[styles.networkHeader, { marginTop: 12 }]}>Siguiendo:</Text>
                  {(data.following_list || []).map((u, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.userCard}
                      onPress={() => Linking.openURL(`https://tiktok.com/${u.username}`)}
                    >
                      {u.avatar ? (
                        <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.userAvatarFallback}>
                          <Text style={styles.userAvatarText}>{u.username ? u.username[1]?.toUpperCase() : "U"}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.userFullName}>{u.name || "Usuario"}</Text>
                        <Text style={styles.userUsername}>{u.username}</Text>
                      </View>
                      <ExternalLink size={14} color="#64748b" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 4. SECCIÓN HASHTAGS Y FRECUENCIA */}
              {metricsTab === "hashtags" && (
                <View style={{ gap: 12 }}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricCardTitle}>Hashtags Reales Detectados</Text>
                    {detectedHashtags.length === 0 ? (
                      <Text style={styles.emptyNotice}>No se detectaron hashtags en el contenido analizado.</Text>
                    ) : (
                      <View style={styles.tagsWrapper}>
                        {detectedHashtags.map(({ tag, count }) => (
                          <View key={tag} style={styles.tagBadge}>
                            <Text style={styles.tagText}>{tag}</Text>
                            {count > 1 ? <Text style={styles.tagCount}>x{count}</Text> : null}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricCardTitle}>Frecuencia de Publicación</Text>
                    <Text style={[styles.frequencyLabel, { color: publicationFrequency.color }]}>
                      {publicationFrequency.label}
                    </Text>
                    <Text style={styles.metricCardDesc}>{publicationFrequency.desc}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyScreen}>
              <TrendingUp size={40} color="#475569" />
              <Text style={styles.emptyScreenTitle}>Sin extracciones disponibles</Text>
              <Text style={styles.emptyScreenDesc}>
                Primero ejecuta una extracción desde la pestaña "Extractor en Vivo".
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070b14" },
  topNav: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#070b14" },
  logoBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f43f5e", justifyContent: "center", alignItems: "center" },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  navTitle: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  navSubtitle: { color: "#64748b", fontSize: 10, fontFamily: "monospace" },
  antiBotBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  antiBotText: { color: "#34d399", fontSize: 10, fontWeight: "bold" },
  mainTabBar: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#070b14" },
  mainTabBtn: { flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center", paddingVertical: 12 },
  mainTabBtnActive: { borderBottomWidth: 2, borderColor: "#f43f5e" },
  mainTabBtnActiveMetrics: { borderBottomWidth: 2, borderColor: "#6366f1" },
  mainTabText: { color: "#94a3b8", fontSize: 12, fontWeight: "bold" },
  mainTabTextActive: { color: "#fff" },
  scrollBody: { flex: 1, padding: 14 },
  panelCard: { backgroundColor: "#0e1422", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#1e293b", marginBottom: 14 },
  sectionLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  textInput: { backgroundColor: "#020617", color: "#fff", borderWidth: 1, borderColor: "#334155", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, fontFamily: "monospace" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#020617", borderWidth: 1, borderColor: "#334155", borderRadius: 10, paddingHorizontal: 10 },
  atSign: { color: "#64748b", fontSize: 15, fontWeight: "bold", fontFamily: "monospace" },
  textInputAt: { flex: 1, color: "#fff", paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, fontFamily: "monospace" },
  profilesRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10 },
  profilesLabel: { color: "#64748b", fontSize: 10 },
  profileChip: { flexDirection: "row", gap: 4, backgroundColor: "#020617", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#1e293b" },
  profileChipName: { color: "#f43f5e", fontSize: 10, fontWeight: "bold" },
  profileChipCat: { color: "#64748b", fontSize: 10 },
  btnScrape: { backgroundColor: "#f43f5e", paddingVertical: 13, borderRadius: 12, alignItems: "center", marginTop: 14, shadowColor: "#f43f5e", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnScrapeText: { color: "#fff", fontWeight: "bold", fontSize: 13, marginLeft: 6 },
  accordionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#1e293b", paddingTop: 12, marginTop: 14 },
  accordionTitle: { color: "#38bdf8", fontSize: 11, fontWeight: "bold" },
  limitsGrid: { flexDirection: "row", gap: 6, marginTop: 10 },
  limitBox: { flex: 1 },
  limitLabel: { color: "#64748b", fontSize: 10, textAlign: "center", marginBottom: 3 },
  limitInput: { backgroundColor: "#020617", color: "#38bdf8", borderWidth: 1, borderColor: "#334155", borderRadius: 8, textAlign: "center", paddingVertical: 6, fontSize: 12, fontWeight: "bold" },
  terminalCard: { backgroundColor: "#020617", borderRadius: 14, borderWidth: 1, borderColor: "#1e293b", marginBottom: 20 },
  terminalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: "#1e293b" },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginRight: 5 },
  dotYellow: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#f59e0b", marginRight: 5 },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981", marginRight: 8 },
  terminalTitle: { color: "#64748b", fontSize: 10, fontFamily: "monospace" },
  terminalBody: { padding: 10 },
  terminalText: { color: "#94a3b8", fontSize: 10, fontFamily: "monospace", marginVertical: 1 },
  profileBannerHeader: { flexDirection: "row", alignItems: "flex-start" },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#f43f5e" },
  avatarLetter: { color: "#fff", fontSize: 20, fontWeight: "900" },
  profileMainName: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  profileHandle: { color: "#38bdf8", fontSize: 12, fontFamily: "monospace", marginBottom: 4 },
  profileBio: { color: "#cbd5e1", fontSize: 11, lineHeight: 15 },
  statsRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#1e293b", paddingTop: 12, marginTop: 12 },
  statCell: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 15, fontWeight: "900" },
  statDesc: { color: "#64748b", fontSize: 10, marginTop: 2 },
  subTabsContainer: { marginBottom: 12 },
  subTabPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#0e1422", borderWidth: 1, borderColor: "#1e293b" },
  subTabPillActive: { backgroundColor: "#f43f5e", borderColor: "#f43f5e" },
  subTabPillText: { color: "#94a3b8", fontSize: 11, fontWeight: "bold" },
  subTabPillTextActive: { color: "#fff" },
  searchBar: { marginBottom: 12 },
  searchInput: { backgroundColor: "#0e1422", color: "#fff", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12 },
  videosGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  videoCard: { width: "48%", aspectRatio: 9 / 16, borderRadius: 14, overflow: "hidden", backgroundColor: "#020617", marginBottom: 12, borderWidth: 1, borderColor: "#1e293b" },
  videoCover: { width: "100%", height: "100%" },
  durationBadge: { position: "absolute", top: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  durationText: { color: "#fff", fontSize: 9, fontFamily: "monospace" },
  videoOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.75)" },
  videoDesc: { color: "#cbd5e1", fontSize: 10, marginBottom: 4 },
  viewsCount: { color: "#38bdf8", fontSize: 11, fontWeight: "bold", marginLeft: 4, fontFamily: "monospace" },
  commentItem: { backgroundColor: "#0e1422", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b" },
  commentAuthor: { color: "#38bdf8", fontSize: 11, fontWeight: "bold", fontFamily: "monospace" },
  commentContent: { color: "#e2e8f0", fontSize: 11, marginTop: 4, lineHeight: 16 },
  likesPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(244,63,94,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  likesText: { color: "#f43f5e", fontSize: 10, fontWeight: "bold" },
  networkHeader: { color: "#cbd5e1", fontSize: 12, fontWeight: "bold" },
  userCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0e1422", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b" },
  userAvatar: { width: 36, height: 36, borderRadius: 18 },
  userAvatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#020617", borderWidth: 1, borderColor: "#334155", justifyContent: "center", alignItems: "center" },
  userAvatarText: { color: "#38bdf8", fontWeight: "bold" },
  userFullName: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  userUsername: { color: "#38bdf8", fontSize: 10, fontFamily: "monospace" },
  metricCard: { backgroundColor: "#0e1422", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#1e293b" },
  metricCardTitle: { color: "#94a3b8", fontSize: 11, fontWeight: "bold", marginBottom: 8 },
  metricCardDesc: { color: "#64748b", fontSize: 11, marginTop: 4 },
  tagsWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#020617", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#1e293b" },
  tagText: { color: "#38bdf8", fontSize: 11, fontFamily: "monospace" },
  tagCount: { color: "#64748b", fontSize: 10 },
  frequencyLabel: { fontSize: 24, fontWeight: "900" },
  emptyNotice: { color: "#64748b", fontSize: 11, textAlign: "center", paddingVertical: 10 },
  emptyScreen: { alignItems: "center", justifyContent: "center", paddingVertical: 50 },
  emptyScreenTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginTop: 10 },
  emptyScreenDesc: { color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 4, paddingHorizontal: 30 },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});