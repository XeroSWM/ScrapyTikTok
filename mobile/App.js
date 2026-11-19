import React, { useState, useRef, useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Play, TrendingUp } from "lucide-react-native";
import { DEFAULT_LIMITS, extractHashtags, calculatePublicationFrequency } from "./src/domain/metrics";
import { evaluateOceanPsychometrics } from "./src/domain/psychometrics";
import { fetchGeminiAuditReport } from "./src/domain/advisoryClient";
import { TopNav } from "./src/ui/organisms/TopNav";
import { ExtractorPage } from "./src/ui/pages/ExtractorPage";
import { MetricsPage } from "./src/ui/pages/MetricsPage";

export default function App() {
  const [backendIp, setBackendIp] = useState("192.168.1.90");
  const [username, setUsername] = useState("_iamnot_leo_");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(["[READY] Cliente móvil conectado y sincronizado."]);
  const [data, setData] = useState(null);
  const [mainTab, setMainTab] = useState("extractor");
  const [metricsTab, setMetricsTab] = useState("videos");
  const [searchFilter, setSearchFilter] = useState("");
  const [showLimits, setShowLimits] = useState(false);
  const [geminiReport, setGeminiReport] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [limitsConfig, setLimitsConfig] = useState(DEFAULT_LIMITS);
  const socketRef = useRef(null);

  const detectedHashtags = useMemo(() => extractHashtags(data), [data]);
  const publicationFrequency = useMemo(() => calculatePublicationFrequency(data?.videos), [data]);
  const psychometrics = useMemo(() => evaluateOceanPsychometrics(data), [data]);

  const startScrape = () => {
    if (!username.trim() || loading) return;
    setLoading(true);
    setData(null);
    setGeminiReport(null);
    setAiError(null);
    setLogs((p) => [...p, `[INIT] Conectando a ws://${backendIp}:8000/ws/scrape...`]);

    try {
      const ws = new WebSocket(`ws://${backendIp}:8000/ws/scrape`);
      socketRef.current = ws;
      ws.onopen = () => {
        setLogs((p) => [...p, `[CONNECTED] Extrayendo para @${username}...`]);
        ws.send(JSON.stringify({
          username: username.trim(),
          target: "all",
          max_videos: Number(limitsConfig.max_videos) || 19,
          max_comment_videos: Number(limitsConfig.max_comment_videos) || 2,
          max_following: Number(limitsConfig.max_following) || 20,
          max_followers: Number(limitsConfig.max_followers) || 20
        }));
      };
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "log") setLogs((p) => [...p, msg.message]);
        else if (msg.type === "result") { setData(msg.data); setLoading(false); setMainTab("metrics"); }
        else if (msg.type === "error") { setLogs((p) => [...p, `[ERROR] ${msg.message}`]); setLoading(false); }
      };
      ws.onerror = () => { setLogs((p) => [...p, "[ERROR] No se pudo conectar al servidor. Revisa IP y Wi-Fi."]); setLoading(false); };
      ws.onclose = () => setLoading(false);
    } catch (e) {
      setLogs((p) => [...p, `[ERROR] ${e.message}`]);
      setLoading(false);
    }
  };

  const handleGenerateGeminiReport = async () => {
    if (!data || loadingAi) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetchGeminiAuditReport({ backendIp, profile: data.profile, psychometrics, frequency: publicationFrequency?.label });
      setGeminiReport(res);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b14" />
      <TopNav backendIp={backendIp} />
      <View style={s.tabs}>
        <TouchableOpacity onPress={() => setMainTab("extractor")} style={[s.btn, mainTab === "extractor" && s.actR]}>
          <Play size={13} color={mainTab === "extractor" ? "#fff" : "#94a3b8"} fill={mainTab === "extractor" ? "#fff" : "none"} />
          <Text style={[s.txt, mainTab === "extractor" && { color: "#fff" }]}>Extractor en Vivo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMainTab("metrics")} style={[s.btn, mainTab === "metrics" && s.actI]}>
          <TrendingUp size={13} color={mainTab === "metrics" ? "#fff" : "#94a3b8"} />
          <Text style={[s.txt, mainTab === "metrics" && { color: "#fff" }]}>Resultados & IA {data ? "●" : ""}</Text>
        </TouchableOpacity>
      </View>

      {mainTab === "extractor" ? (
        <ExtractorPage
          backendIp={backendIp} setBackendIp={setBackendIp}
          username={username} setUsername={setUsername}
          loading={loading} startScrape={startScrape}
          showLimits={showLimits} setShowLimits={setShowLimits}
          limitsConfig={limitsConfig} setLimitsConfig={setLimitsConfig}
          logs={logs}
        />
      ) : (
        <MetricsPage
          data={data} metricsTab={metricsTab} setMetricsTab={setMetricsTab}
          searchFilter={searchFilter} setSearchFilter={setSearchFilter}
          detectedHashtags={detectedHashtags} publicationFrequency={publicationFrequency}
          psychometrics={psychometrics} geminiReport={geminiReport}
          loadingAi={loadingAi} aiError={aiError}
          handleGenerateGeminiReport={handleGenerateGeminiReport}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070b14" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#070b14" },
  btn: { flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", alignItems: "center", paddingVertical: 12 },
  actR: { borderBottomWidth: 2, borderColor: "#f43f5e" },
  actI: { borderBottomWidth: 2, borderColor: "#6366f1" },
  txt: { color: "#94a3b8", fontSize: 12, fontWeight: "bold" }
});
