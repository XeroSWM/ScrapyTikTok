import React from "react";

export default function ProfilePreview({ profile, videos, onGoMetrics }) {
  if (!profile) {
    return (
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-80 text-slate-500 text-sm">
        <p>Inicia un scraping para visualizar el resumen del perfil en tiempo real.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">
            Vista Previa ({profile.username || "Usuario"})
          </h3>
          <button onClick={onGoMetrics} className="text-xs text-rose-400 hover:underline">
            Ver todo en grande →
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shrink-0">
            {profile.name ? profile.name[0]?.toUpperCase() : "?"}
          </div>
          <div>
            <h4 className="font-bold text-white text-base">{profile.name || "Sin nombre"}</h4>
            <p className="text-xs text-cyan-400 font-mono">{profile.username}</p>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{profile.bio || "Sin biografía"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
            <p className="text-[10px] text-slate-500 uppercase">Seguidores</p>
            <p className="text-sm font-bold text-white">{profile.followers || "0"}</p>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
            <p className="text-[10px] text-slate-500 uppercase">Likes</p>
            <p className="text-sm font-bold text-rose-400">{profile.likes || "0"}</p>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
            <p className="text-[10px] text-slate-500 uppercase">Videos</p>
            <p className="text-sm font-bold text-emerald-400">{profile.videosCount || videos?.length || "0"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-slate-500 mb-2">Últimos videos extraídos ({videos?.length || 0}):</p>
        <div className="grid grid-cols-4 gap-2">
          {videos && videos.length > 0 ? (
            videos.slice(0, 4).map((vid, idx) => (
              <div key={idx} className="relative aspect-[9/16] rounded-md overflow-hidden bg-slate-950 border border-slate-800">
                {vid.thumbnail ? (
                  <img src={vid.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">Video</div>
                )}
                <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] px-1 rounded text-white font-mono">
                  {vid.views || "N/A"}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-4 py-4 text-center text-xs text-slate-600">Sin videos en caché</div>
          )}
        </div>
      </div>
    </div>
  );
}