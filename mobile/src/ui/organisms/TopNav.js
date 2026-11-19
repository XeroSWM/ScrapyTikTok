import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LogoBadge, StealthBadge } from "../atoms/Badges";

export function TopNav({ backendIp }) {
  return (
    <View style={s.nav}>
      <LogoBadge />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={s.title}>VerifAI Scraper</Text>
        <Text style={s.sub}>LAN: {backendIp}:8000</Text>
      </View>
      <StealthBadge />
    </View>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#070b14" },
  title: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  sub: { color: "#64748b", fontSize: 10, fontFamily: "monospace" }
});
