import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldCheck, Clock } from "lucide-react-native";

export function LogoBadge() {
  return (
    <View style={s.logo}>
      <Text style={s.logoTxt}>TT</Text>
    </View>
  );
}

export function StealthBadge() {
  return (
    <View style={s.stealth}>
      <ShieldCheck size={12} color="#34d399" />
      <Text style={s.stealthTxt}>Stealth Activo</Text>
    </View>
  );
}

export function DurationBadge({ duration }) {
  return (
    <View style={s.dur}>
      <Clock size={9} color="#f43f5e" />
      <Text style={s.durTxt}>{duration || "15s"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f43f5e", justifyContent: "center", alignItems: "center" },
  logoTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  stealth: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  stealthTxt: { color: "#34d399", fontSize: 10, fontWeight: "bold" },
  dur: { position: "absolute", top: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  durTxt: { color: "#fff", fontSize: 9, fontFamily: "monospace" }
});
