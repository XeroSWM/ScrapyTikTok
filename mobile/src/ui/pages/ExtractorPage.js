import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Play, ChevronDown, ChevronUp } from "lucide-react-native";
import { POPULAR_PROFILES } from "../../domain/metrics";
import { PlaywrightTerminal } from "../organisms/PlaywrightTerminal";

export function ExtractorPage({ backendIp, setBackendIp, username, setUsername, loading, startScrape, showLimits, setShowLimits, limitsConfig, setLimitsConfig, logs }) {
  return (
    <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Text style={s.label}>IP del Servidor PC (Wi-Fi)</Text>
        <TextInput style={s.input} value={backendIp} onChangeText={setBackendIp} placeholder="192.168.1.90" placeholderTextColor="#475569" />

        <Text style={[s.label, { marginTop: 14 }]}>Objetivo de Scraping</Text>
        <View style={s.atBox}>
          <Text style={s.at}>@</Text>
          <TextInput style={s.inputAt} value={username} onChangeText={setUsername} placeholder="ej. _iamnot_leo_" placeholderTextColor="#475569" autoCapitalize="none" />
        </View>

        <View style={s.chipsRow}>
          <Text style={s.chipsLbl}>Pruebas:</Text>
          {POPULAR_PROFILES.map((p) => (
            <TouchableOpacity key={p.name} style={s.chip} onPress={() => setUsername(p.name)}>
              <Text style={s.chipName}>@{p.name}</Text>
              <Text style={s.chipCat}>({p.cat})</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.5 }]} onPress={startScrape} disabled={loading}>
          {loading ? (
            <View style={s.row}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={s.btnTxt}>Extrayendo Perfil...</Text>
            </View>
          ) : (
            <View style={s.row}>
              <Play size={15} color="#fff" fill="#fff" />
              <Text style={s.btnTxt}>Scrapear Perfil Completo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.accHead} onPress={() => setShowLimits(!showLimits)}>
          <Text style={s.accTitle}>{showLimits ? "Ocultar Límites de Extracción" : "Configurar Límites Cuantitativos"}</Text>
          {showLimits ? <ChevronUp size={16} color="#38bdf8" /> : <ChevronDown size={16} color="#38bdf8" />}
        </TouchableOpacity>

        {showLimits && (
          <View style={s.limits}>
            {[["Videos", "max_videos"], ["Comentarios", "max_comment_videos"], ["Siguiendo", "max_following"], ["Seguidores", "max_followers"]].map(([lbl, key]) => (
              <View key={key} style={{ flex: 1 }}>
                <Text style={s.limLbl}>{lbl}</Text>
                <TextInput style={s.limIn} value={limitsConfig[key]} onChangeText={(v) => setLimitsConfig({ ...limitsConfig, [key]: v })} keyboardType="numeric" />
              </View>
            ))}
          </View>
        )}
      </View>

      <PlaywrightTerminal logs={logs} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, padding: 14 },
  card: { backgroundColor: "#0e1422", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#1e293b", marginBottom: 14 },
  label: { color: "#cbd5e1", fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  input: { backgroundColor: "#020617", color: "#fff", borderWidth: 1, borderColor: "#334155", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, fontFamily: "monospace" },
  atBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#020617", borderWidth: 1, borderColor: "#334155", borderRadius: 10, paddingHorizontal: 10 },
  at: { color: "#64748b", fontSize: 15, fontWeight: "bold", fontFamily: "monospace" },
  inputAt: { flex: 1, color: "#fff", paddingHorizontal: 8, paddingVertical: 8, fontSize: 13, fontFamily: "monospace" },
  chipsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chipsLbl: { color: "#64748b", fontSize: 10 },
  chip: { flexDirection: "row", gap: 4, backgroundColor: "#020617", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#1e293b" },
  chipName: { color: "#f43f5e", fontSize: 10, fontWeight: "bold" },
  chipCat: { color: "#64748b", fontSize: 10 },
  btn: { backgroundColor: "#f43f5e", paddingVertical: 13, borderRadius: 12, alignItems: "center", marginTop: 14 },
  btnTxt: { color: "#fff", fontWeight: "bold", fontSize: 13, marginLeft: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  accHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: "#1e293b", paddingTop: 12, marginTop: 14 },
  accTitle: { color: "#38bdf8", fontSize: 11, fontWeight: "bold" },
  limits: { flexDirection: "row", gap: 6, marginTop: 10 },
  limLbl: { color: "#64748b", fontSize: 10, textAlign: "center", marginBottom: 3 },
  limIn: { backgroundColor: "#020617", color: "#38bdf8", borderWidth: 1, borderColor: "#334155", borderRadius: 8, textAlign: "center", paddingVertical: 6, fontSize: 12, fontWeight: "bold" }
});
