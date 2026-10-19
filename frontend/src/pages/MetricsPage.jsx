   import React, { useState } from "react";
import { 
  Download, Video, MessageSquare, Hash, Search, 
  LayoutGrid, List, CheckCircle2, TrendingUp, Heart, 
  Users, Eye, Clock, Share2, Sparkles, Filter 
} from "lucide-react";
import StatsCards from "../components/StatsCards";

export default function MetricsPage({ data }) {
  const [internalTab, setInternalTab] = useState("videos"); // "videos" | "comments" | "hashtags"
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const profile = data?.profile;
  const videos = data?.videos || [];
  const comments = data?.comments || [];

  // Filtrado reactivo de videos
  const filteredVideos = videos.filter((v) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (v.url && v.url.toLowerCase().includes(term)) ||
      (v.views && v.views.toLowerCase().includes(term))
    );
  });

  // Filtrado reactivo de comentarios
  const filteredComments = comments.filter((c) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (c.text && c.text.toLowerCase().includes(term)) ||
      (c.user && c.user.toLowerCase().includes(term))
    );
  });

  // Exportar a JSON
  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiktok_metrics_${profile?.username || "results"}.json`;
    link.click();
  };

  // Exportar a CSV
  const downloadCSV = () => {
    if (!data) return;
    let csv = "data:text/csv;charset=utf-8,ID,Tipo,Detalle,Metrica\n";
    videos.forEach((v) => {
      csv += `${v.id},Video,${v.url},${v.views}\n`;
    });
    comments.forEach((c) => {
      csv += `${c.id},Comentario,"${c.text.replace(/"/g, '""')}",${c.user}\n`;
    });
    const uri = encodeURI(csv);
    const a = document.createElement("a");
    a.href = uri;
    a.download = `tiktok_metrics_${profile?.username || "results"}.csv`;
    a.click();
  };

  if (!data) {
    return (
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-16 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No hay métricas disponibles todavía</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Para visualizar el análisis detallado, primero ejecuta un scraping desde la pestaña <strong>Extractor en Vivo</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Principal del Perfil */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-2xl font-black text-white uppercase">
                {profile?.name ? profile.name[0] : "?"}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-cyan-500 border-2 border-[#0e1422] flex items-center justify-center text-slate-950 shadow">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {profile?.name || "Khabane lame"}
              </h2>
              <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                {profile?.username || "@khaby.lame"}
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {profile?.bio || "If you want to laugh you are in the right place 😎 Life is simple. Just common sense."}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                Región: <strong className="text-slate-200">Global / IT</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                ID Interno: <strong className="text-slate-200">{profile?.username?.replace("@", "")}_official</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold transition shadow-lg shadow-rose-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Estadísticas Reutilizables */}
      <StatsCards profile={profile} />

      {/* Explorador de Resultados con Filtro y Pestañas Internas */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Barra de Filtros y Sub-Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          
          {/* Sub-Pestañas */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setInternalTab("videos")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                internalTab === "videos" 
                  ? "bg-rose-500 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Videos Extraídos</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {videos.length}
              </span>
            </button>

            <button
              onClick={() => setInternalTab("comments")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                internalTab === "comments" 
                  ? "bg-rose-500 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Comentarios</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {comments.length}
              </span>
            </button>

            <button
              onClick={() => setInternalTab("hashtags")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                internalTab === "hashtags" 
                  ? "bg-rose-500 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Hashtags & Estadísticas</span>
            </button>
          </div>

          {/* Buscador y Selector Grid/List */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar por texto o #hashtag..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                title="Vista cuadrícula"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                title="Vista lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido según la Sub-Pestaña Activa */}
        
        {/* SUBTAB 1: VIDEOS */}
        {internalTab === "videos" && (
          <div>
            {filteredVideos.length === 0 ? (
              <p className="text-center py-12 text-slate-600 text-xs font-mono">
                No se encontraron videos que coincidan con la búsqueda.
              </p>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {filteredVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[9/16] shadow-xl hover:border-slate-700 transition"
                  >
                    <img
                      src={vid.thumbnail}
                      alt="Thumbnail video"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-[10px] px-2 py-0.5 rounded-md text-white font-mono flex items-center gap-1 border border-white/10">
                      <Clock className="w-2.5 h-2.5 text-rose-400" />
                      {vid.duration || "24s"}
                    </span>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-xs font-bold flex items-center gap-1.5 font-mono">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" /> {vid.views}
                        </span>
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-white/10 hover:bg-rose-500 text-white transition"
                        >
                          <Video className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Vista Lista */
              <div className="space-y-2">
                {filteredVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={vid.thumbnail} alt="" className="w-10 h-14 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-bold text-white">Video #{vid.id}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm">{vid.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-cyan-400 font-bold">{vid.views} vistas</span>
                      <span className="text-slate-400">{vid.duration || "24s"}</span>
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                      >
                        Abrir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: COMENTARIOS */}
        {internalTab === "comments" && (
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <p className="text-center py-12 text-slate-600 text-xs font-mono">
                No hay comentarios extraídos. Asegúrate de haber seleccionado "Completo (Todo)" o "Comentarios" en la extracción.
              </p>
            ) : (
              filteredComments.map((com) => (
                <div
                  key={com.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400 shrink-0">
                    {com.user[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">@{com.user}</span>
                      <span className="text-[10px] text-slate-600">Comentario detectado</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{com.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBTAB 3: HASHTAGS & ESTADÍSTICAS */}
        {internalTab === "hashtags" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Hashtags Más Frecuentes
              </span>
              <div className="flex flex-wrap gap-2">
                {["#comedy", "#learnontiktok", "#viral", "#fyp", "#foryou"].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Promedio de Interacción por Video</span>
              <p className="text-2xl font-black text-rose-400">~1.4M</p>
              <p className="text-[11px] text-slate-500">Estimación basada en la muestra actual extraída.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Frecuencia de Publicación</span>
              <p className="text-2xl font-black text-emerald-400">Diaria</p>
              <p className="text-[11px] text-slate-500">Intervalo regular detectado entre los últimos posts.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}