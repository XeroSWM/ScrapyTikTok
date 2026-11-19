export async function fetchGeminiAuditReport({ backendIp, profile, psychometrics, frequency }) {
  const response = await fetch("http://" + backendIp + ":8000/api/ai/gemini-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: profile || {}, psychometrics: psychometrics || {}, frequency: frequency || "Moderada" })
  });
  if (!response.ok) throw new Error("Error HTTP " + response.status + " al consultar Gemini");
  return await response.json();
}
