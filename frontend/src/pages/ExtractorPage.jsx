import React, { useState } from "react";
import { 
  Play, Layers, Video, MessageSquare, 
  Settings, ShieldCheck, FileSpreadsheet, FileJson, 
  RefreshCw, Users, UserCheck 
} from "lucide-react";
import ConsoleLogs from "../components/ConsoleLogs";
import ProfilePreview from "../components/ProfilePreview";

export default function ExtractorPage({ onStartScrape, loading, logs, data, onGoMetrics, onClearLogs }) {
  const [targetUser, setTargetUser] = useState("");
  // Este estado define el filtro para la descarga (CSV / JSON)
  const [exportScope, setExportScope] = useState("all"); 
  const [showAdvanced, setShowAdvanced] = useState(true);
  
  // Parámetros cuantitativos enviados al backend
  const [limitsConfig, setLimitsConfig] = useState({
    max_videos: 19,
    max_comment_videos: 2,
    max_following: 20,
    max_followers: 20
  });

  const popularProfiles = [
    { name: "khaby.lame", category: "Comedia / 162M" },
    { name: "mrbeast", category: "Retos / 104M" },
    { name: "_iamnot_leo_", category: "Creador / 341K" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUser.trim() || loading) return;
    // Siempre extrae en modo 'all' para tener todo disponible
    onStartScrape(targetUser.trim(), "all", limitsConfig);
  };

  const handleSelectQuickProfile = (username) => {
    setTargetUser(username);
  };

  // Exportar datos a CSV según la tarjeta seleccionada
  const downloadCSV = () => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (exportScope === "all") {
      csvContent += "Tipo,Identificador,Titulo/Texto,Vistas/Autor,Url\n";

      if (data.profile) {
        csvContent += `Perfil,${data.profile.username},"${(data.profile.bio || "").replace(/"/g, '""')}",${data.profile.followers},https://tiktok.com/@${data.profile.username}\n`;
      }
      if (data.videos) {
        data.videos.forEach((v) => {
          csvContent += `Video,${v.id},"Video Item",${v.views},${v.url}\n`;
        });
      }
      if (data.comments) {
        data.comments.forEach((c) => {
          csvContent += `Comentario,${c.id},"${(c.text || "").replace(/"/g, '""')}",${c.author || c.user || "anonimo"},${c.video_url || "-"}\n`;
        });
      }
      if (data.following_list) {
        data.following_list.forEach((u) => {
          csvContent += `Siguiendo,-,"${(u.name || "").replace(/"/g, '""')}",${u.username},https://tiktok.com/${u.username}\n`;
        });
      }
      if (data.followers_list) {
        data.followers_list.forEach((u) => {
          csvContent += `Seguidor,-,"${(u.name || "").replace(/"/g, '""')}",${u.username},https://tiktok.com/${u.username}\n`;
        });
      }
    } 
    else if (exportScope === "videos") {
      csvContent += "ID,URL,Vistas,Duracion,Miniatura\n";
      (data.videos || []).forEach((v) => {
        csvContent += `${v.id},${v.url},${v.views},${v.duration || "-"},${v.thumbnail || ""}\n`;
      });
    } 
    else if (exportScope === "comments") {
      csvContent += "ID_Comentario,Video_ID,Autor,Nombre,Comentario,Likes,Fecha\n";
      (data.comments || []).forEach((c) => {
        csvContent += `${c.id || "-"},${c.video_id || "-"},${c.author || "-"},"${(c.author_name || "").replace(/"/g, '""')}","${(c.text || "").replace(/"/g, '""')}",${c.likes || "0"},${c.date || "-"}\n`;
      });
    } 
    else if (exportScope === "relations") {
      csvContent += "Tipo,Username,Nombre,Avatar\n";
      (data.following_list || []).forEach((u) => {
        csvContent += `Siguiendo,${u.username},"${(u.name || "").replace(/"/g, '""')}",${u.avatar || ""}\n`;
      });
      (data.followers_list || []).forEach((u) => {
        csvContent += `Seguidor,${u.username},"${(u.name || "").replace(/"/g, '""')}",${u.avatar || ""}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tiktok_${targetUser || "export"}_${exportScope}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar datos a JSON según la tarjeta seleccionada
  const downloadJSON = () => {
    if (!data) return;
    let payloadToExport = {};

    if (exportScope === "all") {
      payloadToExport = data;
    } else if (exportScope === "videos") {
      payloadToExport = { profile: data.profile, videos: data.videos || [] };
    } else if (exportScope === "comments") {
      payloadToExport = { profile: data.profile, comments: data.comments || [] };
    } else if (exportScope === "relations") {
      payloadToExport = {
        profile: data.profile,
        following_list: data.following_list || [],
        followers_list: data.followers_list || []
      };
    }

    const blob = new Blob([JSON.stringify(payloadToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiktok_${targetUser || "export"}_${exportScope}.json`;
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
              placeholder="_iamnot_leo_, khaby.lame o enlace completo"
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
                <span>Extrayendo Todo...</span>
              </>
            ) : (
              <>
                <span>Scrapear Perfil</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </>
            )}
          </button>
        </form>

        {/* Badges de Perfiles Populares */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Perfiles de prueba:</span>
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

        {/* Selector del Alcance de Exportación */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Seleccionar datos a exportar (CSV / JSON)
            </p>
            <span className="text-[11px] text-slate-500 font-mono">
              Exportando actualmente: <strong className="text-rose-400 uppercase">{exportScope}</strong>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "all", label: "Completo (Todo)", icon: Layers, desc: "Descarga perfil, videos, comentarios y red" },
              { id: "videos", label: "Videos & Feed", icon: Video, desc: "Descarga sólo la lista de videos y vistas" },
              { id: "comments", label: "Comentarios", icon: MessageSquare, desc: "Descarga sólo las respuestas y autores" },
              { id: "relations", label: "Comunidad & Red", icon: Users, desc: "Descarga sólo seguidores y seguidos" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = exportScope === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setExportScope(tab.id)}
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

        {/* Panel de Límites Numéricos de Extracción */}
        <div className="border-t border-slate-800/80 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showAdvanced ? "Ocultar Límites de Extracción" : "Configurar Límites de Extracción"}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              {/* 1. Videos a Capturar */}
              <div className="space-y-1.5">
                <label className="text-slate-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>Videos a Capturar</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={limitsConfig.max_videos}
                  onChange={(e) => setLimitsConfig({ ...limitsConfig, max_videos: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 2. Videos para Comentarios */}
              <div className="space-y-1.5">
                <label className="text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Videos para Comentarios</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={limitsConfig.max_comment_videos}
                  onChange={(e) => setLimitsConfig({ ...limitsConfig, max_comment_videos: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 3. Límite Siguiendo */}
              <div className="space-y-1.5">
                <label className="text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Límite Siguiendo</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={limitsConfig.max_following}
                  onChange={(e) => setLimitsConfig({ ...limitsConfig, max_following: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 4. Límite Seguidores */}
              <div className="space-y-1.5">
                <label className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>Límite Seguidores</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={limitsConfig.max_followers}
                  onChange={(e) => setLimitsConfig({ ...limitsConfig, max_followers: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
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
              {data ? `Datos listos (Exportando: ${exportScope.toUpperCase()})` : "Sin datos almacenados"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 disabled:opacity-40 transition font-medium cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar CSV ({exportScope})</span>
            </button>
            <button
              onClick={downloadJSON}
              disabled={!data}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 disabled:opacity-40 transition font-medium cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5 text-rose-400" />
              <span>Descargar JSON ({exportScope})</span>
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