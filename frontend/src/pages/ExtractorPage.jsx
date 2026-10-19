import React, { useState } from "react";
import { 
  Play, CheckCircle2, Download, Layers, Video, MessageSquare, 
  BarChart3, Settings, ShieldCheck, FileSpreadsheet, FileJson, 
  Sparkles, ExternalLink, RefreshCw 
} from "lucide-react";
import ConsoleLogs from "../components/ConsoleLogs";
import ProfilePreview from "../components/ProfilePreview";

export default function ExtractorPage({ onStartScrape, loading, logs, data, onGoMetrics, onClearLogs }) {
  const [targetUser, setTargetUser] = useState("");
  const [extractType, setExtractType] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Parámetros avanzados de Playwright
  const [advancedConfig, setAdvancedConfig] = useState({
    headless: true,
    stealth: true,
    scrollIterations: 2,
    scrollDelayMs: 1500,
    maxVideos: 8,
    maxComments: 10,
    timeoutSeconds: 40
  });

  const popularProfiles = [
    { name: "khaby.lame", category: "Comedia / 162M" },
    { name: "mrbeast", category: "Retos / 104M" },
    { name: "zachking", category: "Magia VFX / 81M" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUser.trim() || loading) return;
    onStartScrape(targetUser.trim(), extractType, advancedConfig);
  };

  const handleSelectQuickProfile = (username) => {
    setTargetUser(username);
  };

  // Exportar datos a CSV
  const downloadCSV = () => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tipo,Identificador,Titulo/Texto,Vistas/Autor,Url\n";

    if (data.profile) {
      csvContent += `Perfil,${data.profile.username},"${data.profile.bio.replace(/"/g, '""')}",${data.profile.followers},https://tiktok.com/@${data.profile.username}\n`;
    }

    if (data.videos) {
      data.videos.forEach((v) => {
        csvContent += `Video,${v.id},"Video Item",${v.views},${v.url}\n`;
      });
    }

    if (data.comments) {
      data.comments.forEach((c) => {
        csvContent += `Comentario,${c.id},"${c.text.replace(/"/g, '""')}",${c.user},-\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tiktok_export_${targetUser || "data"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar datos a JSON
  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiktok_export_${targetUser || "data"}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Panel Superior de Control de Extracción */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Encabezado del Formulario y Estado Anti-Bot */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Objetivo de Scraping (Usuario o Enlace de TikTok)</span>
          </label>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Bypass Anti-Bot Activo</span>
          </div>
        </div>

        {/* Input Principal con botón Scrapear */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base">@</span>
            <input
              type="text"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              placeholder="khaby.lame, mrbeast o enlace completo"
              className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition text-sm font-mono shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !targetUser.trim()}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 text-white font-bold text-sm transition flex items-center justify-center gap-2.5 shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extrayendo...</span>
              </>
            ) : (
              <>
                <span>Scrapear</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </>
            )}
          </button>
        </form>

        {/* Badges de Perfiles Populares */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Perfiles populares:</span>
          {popularProfiles.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleSelectQuickProfile(item.name)}
              className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span className="text-rose-400 font-semibold">@{item.name}</span>
              <span className="text-slate-500 text-[11px]">({item.category})</span>
            </button>
          ))}
        </div>

        {/* Selector de Tipo de Extracción */}
        <div className="space-y-3 pt-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tipo de extracción deseada</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "all", label: "Completo (Todo)", icon: Layers, desc: "Perfil, feed y comentarios" },
              { id: "videos", label: "Videos & Feed", icon: Video, desc: "Miniaturas, URLs y vistas" },
              { id: "comments", label: "Comentarios", icon: MessageSquare, desc: "Respuestas y usuarios" },
              { id: "metrics", label: "Métricas de Perfil", icon: BarChart3, desc: "Seguidores y me gustas" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = extractType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setExtractType(tab.id)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition ${
                    isSelected
                      ? "bg-rose-500/10 border-rose-500 text-rose-300 shadow-md shadow-rose-950/30"
                      : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">{tab.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Acordeón de Opciones Avanzadas de Playwright */}
        <div className="border-t border-slate-800/80 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showAdvanced ? "Ocultar Opciones Avanzadas de Playwright" : "Mostrar Opciones Avanzadas de Playwright"}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Iteraciones de Scroll Infinito</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={advancedConfig.scrollIterations}
                  onChange={(e) => setAdvancedConfig({ ...advancedConfig, scrollIterations: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Pausa entre Scroll (ms)</label>
                <input
                  type="number"
                  step="500"
                  min="500"
                  max="5000"
                  value={advancedConfig.scrollDelayMs}
                  onChange={(e) => setAdvancedConfig({ ...advancedConfig, scrollDelayMs: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Límite Videos a Capturar</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={advancedConfig.maxVideos}
                  onChange={(e) => setAdvancedConfig({ ...advancedConfig, maxVideos: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones de Descarga */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-4 text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${data ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
            <span className={data ? "text-emerald-400 font-medium" : "text-slate-500 font-medium"}>
              {data ? "Datos listos en memoria para descargar:" : "Sin extracciones almacenadas en memoria"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 disabled:opacity-40 transition font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar CSV</span>
            </button>
            <button
              onClick={downloadJSON}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 disabled:opacity-40 transition font-medium"
            >
              <FileJson className="w-3.5 h-3.5 text-rose-400" />
              <span>Descargar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel Inferior Dividido: Consola y Vista Previa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ConsoleLogs logs={logs} onClear={onClearLogs} />
        <ProfilePreview
          profile={data?.profile}
          videos={data?.videos}
          commentsCount={data?.comments?.length || 0}
          onGoMetrics={onGoMetrics}
        />
      </div>
    </div>
  );
}