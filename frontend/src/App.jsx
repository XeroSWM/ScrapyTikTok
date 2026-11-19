

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Play, Radio, BarChart3 } from "lucide-react";
import Navbar from "./components/Navbar";
import ExtractorPage from "./pages/ExtractorPage";
import { fetchSystemInfo, connectScraperSocket } from "./services/api";

const LanAccessPage = lazy(() => import("./pages/LanAccessPage"));
const MetricsPage = lazy(() => import("./pages/MetricsPage"));

export default function App() {
  const [activeTab, setActiveTab] = useState("extractor");
  const [lanIp, setLanIp] = useState("192.168.1.15");
  const [lanPort, setLanPort] = useState("5173");
  const [loading, setLoading] = useState(false);
  const logId = useRef(0);
  const [logs, setLogs] = useState(() => [
    { id: 0, time: new Date().toLocaleTimeString(), message: "[READY] Interfaz lista." }
  ]);
  const [scrapedData, setScrapedData] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [backendCheck, setBackendCheck] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSystemInfo()
      .then((info) => {
        if (!active) return;
        if (info?.local_ip) setLanIp(info.local_ip);
        setBackendStatus("online");
      })
      .catch(() => {
        if (active) setBackendStatus("offline");
      });
    return () => { active = false; };
  }, [backendCheck]);

  const createLog = (message) => ({
    id: ++logId.current,
    time: new Date().toLocaleTimeString(),
    message
  });

  const appendLog = (message) => {
    const entry = createLog(message);
    setLogs((prev) => [...prev, entry].slice(-200));
  };

  const handleClearLogs = () => {
    setLogs([createLog("[READY] Registro de consola reiniciado.")]);
  };

  const handleStartScrape = (username, target, limitsConfig = {}) => {
    setLoading(true);
    appendLog(
      `[INIT] Iniciando extracción para @${username} (${target})...`
    );
    appendLog(
      `[CONFIG] Límites: ${limitsConfig.max_videos || 19} videos, ${limitsConfig.max_comment_videos || 2} para comentarios, ${limitsConfig.max_following || 20} seguidos, ${limitsConfig.max_followers || 20} seguidores.`
    );

    connectScraperSocket({
      username,
      target,
      ...limitsConfig,
      onLog: appendLog,
      onResult: (data) => {
        setScrapedData(data);
        setLoading(false);
      },
      onError: (err) => {
        appendLog(`[ERROR] ${err}`);
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
          backendStatus={backendStatus}
          onCheckBackend={() => {
            setBackendStatus("checking");
            setBackendCheck((prev) => prev + 1);
          }}
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
          <Suspense
            fallback={
              <div
                role="status"
                className="py-12 text-center text-sm text-slate-400"
              >
                Cargando...
              </div>
            }
          >
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
          </Suspense>
        </main>
      </div>
    </div>
  );
}
