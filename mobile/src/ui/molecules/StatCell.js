import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function StatCell({ value, label, color = "#fff" }) {
  return (
    <View style={s.cell}>
      <Text style={[s.num, { color }]}>{value}</Text>
      <Text style={s.desc}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  cell: { flex: 1, alignItems: "center" },
  num: { fontSize: 15, fontWeight: "900" },
  desc: { color: "#64748b", fontSize: 10, marginTop: 2 }
});
