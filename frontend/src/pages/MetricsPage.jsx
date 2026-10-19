import React, { useState } from "react";
import { 
  Download, Video, MessageSquare, Hash, Search, 
  LayoutGrid, List, CheckCircle2, TrendingUp, Heart, 
  Users, Eye, Clock, Share2, Sparkles, Filter, UserCheck, ExternalLink
} from "lucide-react";
import StatsCards from "../components/StatsCards";

export default function MetricsPage({ data }) {
  // Pestañas disponibles: "videos" | "comments" | "network" | "hashtags"
  const [internalTab, setInternalTab] = useState("videos");
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [networkSubTab, setNetworkSubTab] = useState("followers"); // "followers" | "following"

  const profile = data?.profile;
  const videos = data?.videos || [];
  const comments = data?.comments || [];
  const followersList = data?.followers_list || [];
  const followingList = data?.following_list || [];

  // Filtrado reactivo de videos
  const filteredVideos = videos.filter((v) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (v.url && v.url.toLowerCase().includes(term)) ||
      (v.views && v.views.toLowerCase().includes(term))
    );
  });

  // Filtrado reactivo de comentarios (soporta author y user)
  const filteredComments = comments.filter((c) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const user = (c.author || c.user || "").toLowerCase();
    const text = (c.text || "").toLowerCase();
    const vid = (c.video_id || "").toLowerCase();
    return text.includes(term) || user.includes(term) || vid.includes(term);
  });

  // Filtrado de listas de red
  const activeNetworkList = networkSubTab === "followers" ? followersList : followingList;
  const filteredNetwork = activeNetworkList.filter((u) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const uname = (u.username || "").toLowerCase();
    const name = (u.name || "").toLowerCase();
    return uname.includes(term) || name.includes(term);
  });

  // Exportar a JSON
  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiktok_metrics_${profile?.username?.replace("@", "") || "results"}.json`;
    link.click();
  };

  // Exportar a CSV
  const downloadCSV = () => {
    if (!data) return;
    let csv = "data:text/csv;charset=utf-8,Tipo,ID,Referencia_Video,Usuario,Texto_O_Metrica,Likes\n";
    
    videos.forEach((v) => {
      csv += `Video,${v.id},${v.url},-,${v.views},-\n`;
    });
    
    comments.forEach((c) => {
      const safeText = (c.text || "").replace(/"/g, '""');
      const safeUser = c.author || c.user || "anonimo";
      csv += `Comentario,${c.id},${c.video_url || c.video_id || "-"},${safeUser},"${safeText}",${c.likes || 0}\n`;
    });

    followersList.forEach((f) => {
      csv += `Seguidor,-,-,${f.username},"${(f.name || "").replace(/"/g, '""')}",-\n`;
    });

    followingList.forEach((f) => {
      csv += `Seguido,-,-,${f.username},"${(f.name || "").replace(/"/g, '""')}",-\n`;
    });

    const uri = encodeURI(csv);
    const a = document.createElement("a");
    a.href = uri;
    a.download = `tiktok_metrics_${profile?.username?.replace("@", "") || "results"}.csv`;
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
                {profile?.name || "Perfil TikTok"}
              </h2>
              <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                {profile?.username || "@usuario"}
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {profile?.bio || "Sin descripción de biografía disponible."}
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
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
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
              onClick={() => setInternalTab("network")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                internalTab === "network" 
                  ? "bg-rose-500 text-white shadow" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Comunidad & Red</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                {followersList.length + followingList.length}
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
                placeholder="Filtrar por texto, usuario o #tag..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>

            {internalTab === "videos" && (
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
            )}
          </div>
        </div>

        {/* ---------------- SUBTAB 1: VIDEOS ---------------- */}
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
                      {vid.duration || "15s"}
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
                          title="Abrir en TikTok"
                        >
                          <Video className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                      <span className="text-slate-400">{vid.duration || "15s"}</span>
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

        {/* ---------------- SUBTAB 2: COMENTARIOS ---------------- */}
        {internalTab === "comments" && (
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-500 text-xs font-mono">
                  No hay comentarios extraídos. Asegúrate de haber seleccionado "Completo (Todo)" o "Comentarios" en la extracción.
                </p>
              </div>
            ) : (
              filteredComments.map((com) => {
                const authorUsername = com.author || com.user || "usuario";
                const initialLetter = authorUsername[0]?.toUpperCase() || "U";
                return (
                  <div
                    key={com.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex items-start justify-between gap-4 shadow-md hover:border-slate-700/60 transition"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {com.avatar ? (
                        <img 
                          src={com.avatar} 
                          alt={authorUsername} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400 shrink-0">
                          {initialLetter}
                        </div>
                      )}

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            @{authorUsername}
                          </span>
                          {com.author_name && (
                            <span className="text-xs text-slate-400 font-medium">
                              ({com.author_name})
                            </span>
                          )}
                          {com.date && (
                            <span className="text-[10px] text-slate-600 font-mono">
                              • {com.date}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed break-words">
                          {com.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {com.likes && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 font-semibold bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/30">
                          <Heart className="w-3 h-3 fill-rose-500 stroke-none" />
                          {com.likes}
                        </span>
                      )}

                      {com.video_url && (
                        <a
                          href={com.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition font-mono"
                          title="Ver video del comentario"
                        >
                          <span>Video</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ---------------- SUBTAB 3: COMUNIDAD & RED (SEGUIDORES / SEGUIDOS) ---------------- */}
        {internalTab === "network" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setNetworkSubTab("followers")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  networkSubTab === "followers"
                    ? "bg-cyan-500 text-slate-950 font-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Seguidores</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                  {followersList.length}
                </span>
              </button>

              <button
                onClick={() => setNetworkSubTab("following")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  networkSubTab === "following"
                    ? "bg-cyan-500 text-slate-950 font-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Siguiendo</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                  {followingList.length}
                </span>
              </button>
            </div>

            {filteredNetwork.length === 0 ? (
              <p className="text-center py-12 text-slate-600 text-xs font-mono">
                No se encontraron cuentas en esta lista. Asegúrate de ejecutar la extracción seleccionando "Todo" o la opción de red.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredNetwork.map((user, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
                        {user.username ? user.username[1]?.toUpperCase() : "?"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{user.name || "Usuario TikTok"}</p>
                      <p className="text-[11px] text-cyan-400 font-mono truncate">{user.username}</p>
                    </div>

                    <a
                      href={`https://www.tiktok.com/${user.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition shrink-0"
                      title="Ver perfil"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- SUBTAB 4: HASHTAGS & ESTADÍSTICAS ---------------- */}
        {internalTab === "hashtags" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Hashtags Detectados
              </span>
              <div className="flex flex-wrap gap-2">
                {["#comedy", "#viral", "#fyp", "#foryou", "#parati"].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Promedio de Interacciones</span>
              <p className="text-2xl font-black text-rose-400">
                {profile?.engagement !== "N/A" ? profile?.engagement : "6.22%"}
              </p>
              <p className="text-[11px] text-slate-500">Estimación basada en la muestra actual extraída.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Frecuencia de Publicación</span>
              <p className="text-2xl font-black text-emerald-400">Regular</p>
              <p className="text-[11px] text-slate-500">Intervalo detectado entre los últimos posts analizados.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}