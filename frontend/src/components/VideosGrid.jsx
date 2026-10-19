import React from "react";
import { Video } from "lucide-react";

export default function VideosGrid({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">
        No se han extraído videos todavía. Realiza un scraping desde el panel principal.
      </div>
    );
  }

  return (
    <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Videos Extraídos ({videos.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {videos.map((vid, idx) => (
          <div key={idx} className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[9/16] shadow-md">
            {vid.thumbnail ? (
              <img src={vid.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Sin preview</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500" /> {vid.views || "N/A"}
              </span>
              <span className="text-[10px] text-slate-400">{vid.duration || "0:00"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}