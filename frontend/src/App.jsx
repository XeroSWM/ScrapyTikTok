import React, { useState, useEffect } from "react";
import { Play, Radio, BarChart3 } from "lucide-react";
import Navbar from "./components/Navbar";
import ExtractorPage from "./pages/ExtractorPage";
import LanAccessPage from "./pages/LanAccessPage";
import MetricsPage from "./pages/MetricsPage";
import { fetchSystemInfo, connectScraperSocket } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("extractor"); // "extractor" | "lan" | "metrics"
  const [lanIp, setLanIp] = useState("192.168.1.15");
  const [lanPort, setLanPort] = useState("5173");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(["[READY] Interfaz conectada y lista."]);
  const [scrapedData, setScrapedData] = useState(null);

  useEffect(() => {
    fetchSystemInfo().then((info) => {
      if (info?.local_ip) setLanIp(info.local_ip);
    });
  }, []);

  const handleClearLogs = () => {
    setLogs(["[READY] Registro de consola reiniciado."]);
  };

  const handleStartScrape = (username, target, limitsConfig = {}) => {
    setLoading(true);
    setLogs((prev) => [
      ...prev,
      `[INIT] Iniciando extracción para @${username} (${target})...`,
      `[CONFIG] Límites: ${limitsConfig.max_videos || 19} videos, ${limitsConfig.max_comment_videos || 2} para comentarios, ${limitsConfig.max_following || 20} seguidos, ${limitsConfig.max_followers || 20} seguidores.`
    ]);

    connectScraperSocket({
      username,
      target,
      ...limitsConfig,
      onLog: (msg) => setLogs((prev) => [...prev, msg]),
      onResult: (data) => {
        setScrapedData(data);
        setLoading(false);
      },
      onError: (err) => {
        setLogs((prev) => [...prev, `[ERROR] ${err}`]);
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Navbar
          lanIp={lanIp}
          lanPort={lanPort}
          onOpenMobile={() => setActiveTab("lan")}
        />

        {/* Barra de navegación de pestañas */}
        <nav className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab("extractor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "extractor"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Play className="w-4 h-4 fill-current" /> Extractor en Vivo
          </button>

          <button
            onClick={() => setActiveTab("lan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "lan"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Radio className="w-4 h-4" /> Acceso Móvil LAN & QR
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "metrics"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Resultados & Métricas
          </button>
        </nav>

        <main>
          {activeTab === "extractor" && (
            <ExtractorPage
              onStartScrape={handleStartScrape}
              loading={loading}
              logs={logs}
              data={scrapedData}
              onGoMetrics={() => setActiveTab("metrics")}
              onClearLogs={handleClearLogs}
            />
          )}

          {activeTab === "lan" && (
            <LanAccessPage
              lanIp={lanIp}
              lanPort={lanPort}
              setLanIp={setLanIp}
              setLanPort={setLanPort}
            />
          )}

          {activeTab === "metrics" && (
            <MetricsPage data={scrapedData} />
          )}
        </main>
      </div>
    </div>
  );
}