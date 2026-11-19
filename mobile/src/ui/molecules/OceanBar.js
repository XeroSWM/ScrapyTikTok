import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function OceanBar({ trait, score, cfg }) {
  return (
    <View>
      <View style={s.row}>
        <Text style={s.name}>{trait}</Text>
        <Text style={[s.score, { color: cfg.text }]}>{score}%</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${score}%`, backgroundColor: cfg.bar }]} />
      </View>
      <Text style={s.sub}>{cfg.sub}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: "#e2e8f0", fontSize: 12, fontWeight: "bold" },
  score: { fontSize: 12, fontWeight: "900", fontFamily: "monospace" },
  track: { height: 7, backgroundColor: "#020617", borderRadius: 4, borderWidth: 1, borderColor: "#1e293b", overflow: "hidden", marginTop: 5 },
  fill: { height: "100%", borderRadius: 4 },
  sub: { color: "#64748b", fontSize: 10, marginTop: 3 }
});
