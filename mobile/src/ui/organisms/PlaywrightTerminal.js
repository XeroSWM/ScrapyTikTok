import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function PlaywrightTerminal({ logs }) {
  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={[s.dot, { backgroundColor: "#ef4444" }]} />
        <View style={[s.dot, { backgroundColor: "#f59e0b" }]} />
        <View style={[s.dot, { backgroundColor: "#10b981", marginRight: 8 }]} />
        <Text style={s.title}>Playwright DevTools Protocol</Text>
      </View>
      <View style={s.body}>
        {logs.slice(-6).map((log, i) => (
          <Text key={i} style={s.txt}>{log}</Text>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#020617", borderRadius: 14, borderWidth: 1, borderColor: "#1e293b", marginBottom: 20 },
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: "#1e293b" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  title: { color: "#64748b", fontSize: 10, fontFamily: "monospace" },
  body: { padding: 10 },
  txt: { color: "#94a3b8", fontSize: 10, fontFamily: "monospace", marginVertical: 1 }
});
