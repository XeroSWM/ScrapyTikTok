import { StyleSheet } from "react-native";

export const COLORS = {
  bg: "#070b14",
  card: "#0e1422",
  input: "#020617",
  border: "#1e293b",
  primary: "#f43f5e",
  cyan: "#22d3ee",
  sky: "#38bdf8",
  emerald: "#34d399",
  purple: "#a855f7",
  amber: "#fbbf24"
};

export const sharedStyles = StyleSheet.create({
  panelCard: { backgroundColor: "#0e1422", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#1e293b", marginBottom: 14 },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
